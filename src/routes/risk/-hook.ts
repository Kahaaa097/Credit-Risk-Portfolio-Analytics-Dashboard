import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/hooks/db";

// Type definitions (omitted for brevity, assume they are the same)
export interface ParentBranchOption {
  value: string;
  label: string;
}

interface RiskKPI {
  npl_ratio: number; // NPL ratio (groups 3-5)
  npl_stock: number; // Total NPL amount in billions VND
  total_outstanding: number; // Total outstanding for reference
}

interface TopExposure {
  customer_code: string;
  contract_number: string;
  debt_group: string;
  principal_outstanding: number; // In billions VND
  ranking: number;
}

interface WatchlistItem {
  customer_code: string;
  contract_number: string;
  expiry_date: string;
  days_to_expiry: number;
  contract_status: string;
  principal_outstanding: number; // In billions VND
  penalty_interest_total: number; // Total penalty interest
  alert_reason: string;
}

// Hook to search for parent branches (no change, as it's a search function)
export function useParentBranchSearch(searchQuery: string) {
  return useQuery({
    queryKey: ["parent-branch-search", searchQuery],
    queryFn: async (): Promise<ParentBranchOption[]> => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return [];
      }

      const searchPattern1 = `%${searchQuery.trim()}%`;
      const searchPattern2 = `%$VN{searchQuery.trim()}%`;

      const result = await db.sql`
        SELECT DISTINCT 
          b.parent_branch_code AS value,
          COALESCE(b.branch_name || ' (' || b.parent_branch_code || ')', b.parent_branch_code) AS label
        FROM branches b
        WHERE b.parent_branch_code IS NOT NULL
          AND b.parent_branch_code != ''
          AND (
            b.parent_branch_code LIKE ${searchPattern1}
            OR b.branch_name LIKE ${searchPattern1}
            OR b.parent_branch_code LIKE ${searchPattern2}
            OR b.branch_name LIKE ${searchPattern2}
          )
        ORDER BY b.parent_branch_code
        LIMIT 50
      `;

      return result.map((row) => ({
        value: (row as { value: string }).value ?? "",
        label: (row as { label: string }).label ?? "",
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    enabled: searchQuery.trim().length > 0, // Only run query if search query exists
  });
}

// Hook for Risk KPIs
function useRiskKPIData(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["risk-kpi-data", parentBranchCode],
    // Only run if parentBranchCode is truthy
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<RiskKPI> => {
      const kpiResult = await db.sql`
        SELECT 
          -- Total outstanding balance (converted to VND)
          ROUND(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS total_outstanding,
          
          -- NPL stock (groups 3, 4, 5) in billions VND
          ROUND(
            SUM(
              CASE WHEN debt_group_bank IN ('3', '4', '5') 
              THEN COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0) 
              ELSE 0 END
            ) / 1000000000.0,
            2
          ) AS npl_stock,
          
          -- NPL ratio (groups 3, 4, 5)
          ROUND(
            COALESCE(
              SUM(
                CASE WHEN debt_group_bank IN ('3', '4', '5') 
                THEN COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0) 
                ELSE 0 END
              ) * 1.0 / NULLIF(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)), 0),
              0
            ),
            4
          ) AS npl_ratio
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
      `;

      if (kpiResult.length > 0) {
        return kpiResult[0] as RiskKPI;
      }
      throw new Error("No risk KPI data found");
    },
  });
}

// Hook for Top Exposure
function useTopExposureData(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["top-exposure-data", parentBranchCode],
    // Only run if parentBranchCode is truthy
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<TopExposure[]> => {
      const exposureResult = await db.sql`
        SELECT 
          l.customer_code,
          l.contract_number,
          l.debt_group_bank AS debt_group,
          ROUND(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) / 1000000000.0, 2) AS principal_outstanding
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND l.debt_group_bank IN ('3', '4')
          AND COALESCE(l.principal_outstanding, 0) > 0
        ORDER BY principal_outstanding DESC
        LIMIT 20
      `;

      return (exposureResult as TopExposure[]).map((row, index) => ({
        ...row,
        ranking: index + 1,
      }));
    },
  });
}

// Hook for Watchlist
function useWatchlistData(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["watchlist-data", parentBranchCode],
    // Only run if parentBranchCode is truthy
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<WatchlistItem[]> => {
      const watchlistResult = await db.sql`
        SELECT 
          l.customer_code,
          l.contract_number,
          l.expiry_date,
          l.contract_status,
          ROUND(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) / 1000000000.0, 2) AS principal_outstanding,
          ROUND((
            COALESCE(l.penalty_interest_principal_outstanding, 0) + 
            COALESCE(l.penalty_interest_on_interest_outstanding, 0)
          ) / 1000000000.0, 2) AS penalty_interest_total,
          CASE 
            WHEN julianday(l.expiry_date) - julianday('now') <= 30 AND julianday(l.expiry_date) - julianday('now') > 0 
              THEN 'Sắp đến hạn trong 30 ngày'
            WHEN julianday(l.expiry_date) - julianday('now') <= 0 
              THEN 'Đã quá hạn'
            WHEN (COALESCE(l.penalty_interest_principal_outstanding, 0) + COALESCE(l.penalty_interest_on_interest_outstanding, 0)) > 0 
              THEN 'Có lãi suất phạt'
            ELSE 'Khác'
          END AS alert_reason,
          CAST(julianday(l.expiry_date) - julianday('now') AS INTEGER) AS days_to_expiry
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
          AND (
            -- Expiring within 30 days
            julianday(l.expiry_date) - julianday('now') <= 30
            -- Has penalty interest
            OR (COALESCE(l.penalty_interest_principal_outstanding, 0) + COALESCE(l.penalty_interest_on_interest_outstanding, 0)) > 0
          )
        ORDER BY 
          CASE 
            WHEN julianday(l.expiry_date) - julianday('now') <= 0 THEN 0
            WHEN (COALESCE(l.penalty_interest_principal_outstanding, 0) + COALESCE(l.penalty_interest_on_interest_outstanding, 0)) > 0 THEN 1
            ELSE 2
          END,
          days_to_expiry ASC,
          penalty_interest_total DESC
        LIMIT 50
      `;

      return watchlistResult as WatchlistItem[];
    },
  });
}

// Hook for NPL by Debt Group breakdown (No change needed as it already required parentBranchCode)
function useNPLByGroupData(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["npl-by-group-data", parentBranchCode],
    // Only run if parentBranchCode is truthy
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<
      Array<{ name: string; value: number; count: number }>
    > => {
      const groupResult = await db.sql`
        SELECT 
          CASE 
            WHEN l.debt_group_bank = '3' THEN 'Nhóm 3 (Dưới chuẩn)'
            WHEN l.debt_group_bank = '4' THEN 'Nhóm 4 (Nghi ngờ)'
            WHEN l.debt_group_bank = '5' THEN 'Nhóm 5 (Có khả năng mất vốn)'
            ELSE 'Khác'
          END AS name,
          ROUND(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS value,
          COUNT(*) AS count
        FROM loans l
          INNER JOIN branches b ON l.branch_code = b.branch_code
            WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
            AND l.debt_group_bank IN ('3', '4', '5')
            AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY l.debt_group_bank
        ORDER BY l.debt_group_bank
      `;

      return groupResult as Array<{
        name: string;
        value: number;
        count: number;
      }>;
    },
  });
}

// Hook for NPL by Branch (updated to only run when parentBranchCode is provided)
function useNPLByBranchData(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["npl-by-branch-data", parentBranchCode],
    // Only run if parentBranchCode is truthy
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<
      Array<{
        branch_code: string;
        branch_name: string;
        npl_amount: number;
        total_outstanding: number;
        npl_ratio: number;
      }>
    > => {
      const branchResult = await db.sql`
        SELECT 
          l.branch_code,
          COALESCE(b.branch_name, l.branch_code) AS branch_name,
          ROUND(
            SUM(
              CASE WHEN l.debt_group_bank IN ('3', '4', '5') 
              THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) 
              ELSE 0 END
            ) / 1000000000.0,
            2
          ) AS npl_amount,
          ROUND(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS total_outstanding,
          ROUND(
            COALESCE(
              SUM(
                CASE WHEN l.debt_group_bank IN ('3', '4', '5') 
                THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) 
                ELSE 0 END
              ) * 1.0 / NULLIF(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)), 0),
              0
            ),
            4
          ) AS npl_ratio
        FROM loans l
        INNER JOIN branches b ON b.branch_code = l.branch_code
        WHERE l.branch_code IS NOT NULL 
          AND l.branch_code != ''
          AND COALESCE(l.principal_outstanding, 0) > 0
          AND b.parent_branch_code = ${parentBranchCode}
        GROUP BY l.branch_code, b.branch_name
        HAVING npl_amount > 0
        ORDER BY npl_amount DESC
        LIMIT 10
      `;

      return branchResult as Array<{
        branch_code: string;
        branch_name: string;
        npl_amount: number;
        total_outstanding: number;
        npl_ratio: number;
      }>;
    },
  });
}

export {
  useRiskKPIData,
  useTopExposureData,
  useWatchlistData,
  useNPLByGroupData,
  useNPLByBranchData,
  type RiskKPI,
  type TopExposure,
  type WatchlistItem,
};
