import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/hooks/db";

// Type definitions
interface KPI {
  eop_balance: number;
  avg_balance: number; // Snapshot approximation due to lack of daily history
  growth_mom: number; // Set to 0 due to lack of historical snapshots
  growth_ytd: number; // Set to 0 due to lack of historical snapshots
  n_customers: number;
  n_contracts: number;
  npl_ratio: number;
  par30: number; // Approximated as share of overdue principal (no days bucket in schema)
  par60: number; // Not computable -> 0 as placeholder
  par90: number; // Not computable -> 0 as placeholder
  avg_interest_rate: number; // Weighted by outstanding
  avg_spread: number; // Weighted by outstanding
  fx_share: number; // Uses exchange_rate for conversion
}

interface CustomerTypeData {
  name: string;
  value: number;
  percentage: number;
}

interface CurrencyData {
  name: string;
  value: number;
  percentage: number;
}

interface TopBranchData {
  branch_id: string;
  branch_name: string;
  eop_balance: number;
  npl_ratio: number;
  ranking: number;
}

interface TrendData {
  period: string;
  eop_balance: number;
  npl_ratio: number;
}

interface LoanGroupsData {
  name: string;
  value: number;
}

interface AlertData {
  branch_id: string;
  npl_ratio: number;
  eop_balance: number;
  alert_reason: string;
}

interface BranchHeatmapData {
  branch_id: string;
  name: string;
  eop_balance: number;
  npl_ratio: number;
  [key: string]: string | number;
}

// Custom hooks for data loading
function useKPIData() {
  return useQuery({
    queryKey: ["kpi-data"],
    queryFn: async (): Promise<KPI> => {
      // Active loans approximation: principal_outstanding > 0 at current snapshot
      const kpiResult = await db.sql`
        SELECT 
          -- EOP balance (tỷ VND), converted via exchange_rate where provided
          ROUND(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS eop_balance,

          -- Average balance (snapshot approximation: average outstanding per active loan, not time-weighted)
          ROUND(AVG(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS avg_balance,

          -- Distinct counts on active loans
          COUNT(DISTINCT customer_code) AS n_customers,
          COUNT(DISTINCT contract_number) AS n_contracts,

          -- Weighted average interest rate by outstanding
          ROUND(
            AVG(interest_rate) / 100,
            4
          ) AS avg_interest_rate,

          -- Weighted average spread by outstanding
          ROUND(
            COALESCE(
              SUM((floating_margin) * (COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)))
              / NULLIF(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)), 0),
            0
            ),
            4
          ) AS avg_spread,

          -- FX share on converted amounts
          ROUND(
            COALESCE(
              SUM(CASE WHEN currency != 'VND' THEN COALESCE(principal_outstanding * COALESCE(exchange_rate, 1), 0) ELSE 0 END)
              * 1.0 / NULLIF(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)), 0),
            0
            ),
            4
          ) AS fx_share,

          -- NPL ratio (groups 3-4)
          ROUND(
            COALESCE(
              SUM(CASE WHEN debt_group_ku IN ('3','4') THEN COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END)
              * 1.0 / NULLIF(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)), 0),
            0
            ),
            4
          ) AS npl_ratio,

          -- PAR30 approximation (any overdue principal > 0)
          ROUND(
            COALESCE(
              SUM(CASE WHEN COALESCE(principal_overdue, 0) > 0 THEN COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END)
              * 1.0 / NULLIF(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)), 0),
            0
            ),
            4
          ) AS par30
        FROM loans
        WHERE COALESCE(principal_outstanding, 0) > 0
      `;

      if (kpiResult.length > 0) {
        return {
          // Base metrics from query
          ...(kpiResult[0] as KPI),
          // Not computable without historical snapshots -> set to 0
          growth_mom: 0,
          growth_ytd: 0,
          // No days-past-due buckets available in schema -> set placeholders
          par60: 0,
          par90: 0,
        };
      }
      throw new Error("No KPI data found");
    },
  });
}

function useTrendData() {
  return useQuery({
    queryKey: ["trend-data"],
    queryFn: async (): Promise<TrendData[]> => {
      // Approximated "trend" across branches (since no historical snapshots exist)
      const trendResult = await db.sql`
        SELECT 
          branch_code AS period,
          ROUND(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS eop_balance,
          ROUND(
            COALESCE(
              SUM(CASE WHEN debt_group_ku IN ('3','4') THEN COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END)
              * 1.0 / NULLIF(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)), 0),
            0
            ),
            4
          ) AS npl_ratio
        FROM loans
        WHERE branch_code IS NOT NULL AND branch_code != ''
          AND COALESCE(principal_outstanding, 0) > 0
        GROUP BY branch_code
        ORDER BY eop_balance DESC
        LIMIT 9
      `;
      return trendResult as TrendData[];
    },
  });
}

function useLoanGroupsData() {
  return useQuery({
    queryKey: ["loan-groups-data"],
    queryFn: async (): Promise<LoanGroupsData[]> => {
      const groupsResult = await db.sql`
        SELECT 
          CASE 
            WHEN debt_group_ku = '1' THEN 'Nhóm 1 (Chuẩn)'
            WHEN debt_group_ku = '2' THEN 'Nhóm 2 (Cần chú ý)'
            WHEN debt_group_ku = '3' THEN 'Nhóm 3 (Dưới chuẩn)'
            WHEN debt_group_ku = '4' THEN 'Nhóm 4 (Nghi ngờ)'
            ELSE 'Khác'
          END AS name,
          COUNT(*) AS value
        FROM loans
        WHERE COALESCE(principal_outstanding, 0) > 0
        GROUP BY debt_group_ku
        ORDER BY debt_group_ku
      `;
      return groupsResult as LoanGroupsData[];
    },
  });
}

function useAlertsData() {
  return useQuery({
    queryKey: ["alerts-data"],
    queryFn: async (): Promise<AlertData[]> => {
      const alertsResult = await db.sql`
        SELECT 
          branch_code AS branch_id,
          ROUND(
            COALESCE(
              SUM(CASE WHEN debt_group_ku IN ('3','4') THEN COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END)
              * 1.0 / NULLIF(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)), 0),
            0
            ),
            4
          ) AS npl_ratio,
          ROUND(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS eop_balance,
          'NPL cao nhất trong hệ thống' AS alert_reason
        FROM loans
        WHERE branch_code IS NOT NULL AND branch_code != ''
          AND COALESCE(principal_outstanding, 0) > 0
        GROUP BY branch_code
        HAVING SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)) > 0
        ORDER BY npl_ratio DESC
        LIMIT 5
      `;
      return alertsResult as AlertData[];
    },
  });
}

function useBranchHeatmapData() {
  return useQuery({
    queryKey: ["branch-heatmap-data"],
    queryFn: async (): Promise<BranchHeatmapData[]> => {
      // Roll up to parent branches for the heatmap
      const heatmapResult = await db.sql`
        SELECT 
          COALESCE(b.parent_branch_code, l.branch_code) AS branch_id,
          COALESCE(b.department_name, b.branch_name, l.branch_code) AS name,
          ROUND(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS eop_balance,
          ROUND(
            COALESCE(
              SUM(CASE WHEN l.debt_group_ku IN ('3','4') THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END)
              * 1.0 / NULLIF(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)), 0),
            0
            ),
            4
          ) AS npl_ratio
        FROM loans l
        LEFT JOIN branches b ON b.branch_code = l.branch_code
        WHERE l.branch_code IS NOT NULL AND l.branch_code != ''
          AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY COALESCE(b.parent_branch_code, l.branch_code), COALESCE(b.department_name, b.branch_name, l.branch_code)
        HAVING SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) > 0
        ORDER BY eop_balance DESC
        LIMIT 10
      `;
      return heatmapResult as BranchHeatmapData[];
    },
  });
}

// Hook for customer type distribution (Khách hàng ưu tiên classification)
function useCustomerTypeData() {
  return useQuery({
    queryKey: ["customer-type-data"],
    queryFn: async (): Promise<CustomerTypeData[]> => {
      const customerTypeResult = await db.sql`
        SELECT 
          CASE 
            WHEN c.priority_customer LIKE '%Private%' THEN 'Khách hàng cao cấp'
            WHEN c.priority_customer LIKE '%Gold%' OR c.priority_customer LIKE '%Platinum%' THEN 'Khách hàng ưu tiên'
            WHEN c.priority_customer LIKE '%Diamond%' THEN 'Khách hàng gắn mã theo dõi hạng'
            WHEN c.priority_customer LIKE '%Partnership%' THEN 'Khách hàng đối tác'
            ELSE 'Khách hàng thông thường'
          END AS name,
          COUNT(DISTINCT l.customer_code) AS value
        FROM loans l
        LEFT JOIN customers c ON c.customer_code = l.customer_code
        WHERE COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY 
          CASE 
            WHEN c.priority_customer LIKE '%Private%' THEN 'Khách hàng cao cấp'
            WHEN c.priority_customer LIKE '%Gold%' OR c.priority_customer LIKE '%Platinum%' THEN 'Khách hàng ưu tiên'
            WHEN c.priority_customer LIKE '%Diamond%' THEN 'Khách hàng gắn mã theo dõi hạng'
            WHEN c.priority_customer LIKE '%Partnership%' THEN 'Khách hàng đối tác'
            ELSE 'Khách hàng thông thường'
          END
        ORDER BY value DESC
      `;
      
      const total = customerTypeResult.reduce((sum: number, row: any) => sum + (row.value || 0), 0);
      
      return customerTypeResult.map((row: any) => ({
        name: row.name,
        value: row.value,
        percentage: total > 0 ? (row.value / total) * 100 : 0
      }));
    },
  });
}

// Hook for currency distribution (VND vs Foreign currency)
function useCurrencyData() {
  return useQuery({
    queryKey: ["currency-data"],
    queryFn: async (): Promise<CurrencyData[]> => {
      const currencyResult = await db.sql`
        SELECT 
          CASE 
            WHEN currency = 'VND' THEN 'VND'
            ELSE 'Ngoại tệ'
          END AS name,
          ROUND(SUM(COALESCE(principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS value
        FROM loans
        WHERE COALESCE(principal_outstanding, 0) > 0
        GROUP BY 
          CASE 
            WHEN currency = 'VND' THEN 'VND'
            ELSE 'Ngoại tệ'
          END
        ORDER BY value DESC
      `;
      
      const total = currencyResult.reduce((sum: number, row: any) => sum + (row.value || 0), 0);
      
      return currencyResult.map((row: any) => ({
        name: row.name,
        value: row.value,
        percentage: total > 0 ? (row.value / total) * 100 : 0
      }));
    },
  });
}

// Hook for top 5 branches by outstanding balance
function useTopBranchesByBalance() {
  return useQuery({
    queryKey: ["top-branches-balance"],
    queryFn: async (): Promise<TopBranchData[]> => {
      const topBranchesResult = await db.sql`
        SELECT 
          l.branch_code AS branch_id,
          COALESCE(b.branch_name, l.branch_code) AS branch_name,
          ROUND(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS eop_balance,
          ROUND(
            COALESCE(
              SUM(CASE WHEN l.debt_group_ku IN ('3','4') THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END)
              * 1.0 / NULLIF(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)), 0),
            0
            ),
            4
          ) AS npl_ratio
        FROM loans l
        LEFT JOIN branches b ON b.branch_code = l.branch_code
        WHERE l.branch_code IS NOT NULL AND l.branch_code != ''
          AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY l.branch_code, b.branch_name
        ORDER BY eop_balance DESC
        LIMIT 5
      `;
      
      return topBranchesResult.map((row: any, index: number) => ({
        ...row,
        ranking: index + 1
      }));
    },
  });
}

export {
  useKPIData,
  useTrendData,
  useLoanGroupsData,
  useAlertsData,
  useBranchHeatmapData,
  useCustomerTypeData,
  useCurrencyData,
  useTopBranchesByBalance,
  type KPI,
  type TrendData,
  type LoanGroupsData,
  type AlertData,
  type BranchHeatmapData,
  type CustomerTypeData,
  type CurrencyData,
  type TopBranchData,
};
