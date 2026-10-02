import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/hooks/db";

// Type definitions
export interface ParentBranchOption {
  value: string;
  label: string;
}

export interface BranchKpi {
  eopBalance: number;
  nplRatio: number;
  nCustomers: number;
  nContracts: number;
  disbursementYtd: number;
  avgInterestRate: number;
}

export interface CustomerMixItem {
  customerType: string;
  count: number;
  exposure: number;
}

export interface LoanGroupItem {
  loanGroup: 1 | 2 | 3 | 4;
  exposure: number;
}

export interface LoanGroupByBranchItem {
  branchCode: string;
  branchName: string;
  group1: number;
  group2: number;
  group3: number;
  group4: number;
}

export interface RateBullet {
  actualRate: number;
  benchmarkRate: number;
  spread: number;
}

export interface DisbPoint {
  period: string;
  amount: number;
}

export interface MaturityBucket {
  months: 1 | 3 | 6 | 12;
  principalDue: number;
  nContracts: number;
}

export interface MaturityCalendarItem {
  bucket: string;
  principalDue: number;
  nContracts: number;
  nplContracts: number;
}

export interface ContractRow {
  contractId: string;
  customerId: string;
  productCode: string;
  purposeCode: string;
  currency: string;
  eopBalance: number;
  loanGroup: 1 | 2 | 3 | 4;
  interestRate: number;
  maturityDate: string;
  status: "active" | "overdue" | "closed";
  riskFlag?: string;
}

export interface ContractsResp {
  rows: ContractRow[];
}

export interface Option {
  value: string;
  label: string;
}

// Hook to search for parent branches
export function useParentBranchSearch(searchQuery: string) {
  return useQuery({
    queryKey: ["parent-branch-search", searchQuery],
    queryFn: async (): Promise<ParentBranchOption[]> => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return [];
      }

      const searchPattern = `%${searchQuery.trim()}%`;

      const result = await db.sql`
        SELECT DISTINCT 
          b.parent_branch_code AS value,
          COALESCE(b.branch_name || ' (' || b.parent_branch_code || ')', b.parent_branch_code) AS label
        FROM branches b
        WHERE b.parent_branch_code IS NOT NULL
          AND b.parent_branch_code != ''
          AND (
            b.parent_branch_code LIKE ${searchPattern}
            OR b.branch_name LIKE ${searchPattern}
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
    enabled: searchQuery.trim().length > 0,
  });
}

// Custom hooks for branch data
export function useBranchKPI(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["branch-kpi", parentBranchCode],
    queryFn: async (): Promise<BranchKpi> => {
      const result = await db.sql`
        SELECT 
          ROUND(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS eop_balance,
          ROUND(
            COALESCE(
              SUM(CASE WHEN l.debt_group_bank IN ('3','4','5') THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END)
              * 1.0 / NULLIF(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)), 0),
            0),
            4
          ) AS npl_ratio,
          COUNT(DISTINCT l.customer_code) AS n_customers,
          COUNT(DISTINCT l.contract_number) AS n_contracts,
          ROUND(SUM(COALESCE(l.principal_disbursed * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS disbursement_ytd,
          ROUND(
            COALESCE(
              SUM((l.interest_rate) * (COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)))
              / NULLIF(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)), 0),
            0),
            4
          ) AS avg_interest_rate
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
      `;

      if (result.length > 0) {
        const row = result[0] as {
          eop_balance: number;
          npl_ratio: number;
          n_customers: number;
          n_contracts: number;
          disbursement_ytd: number;
          avg_interest_rate: number;
        };
        return {
          eopBalance: row.eop_balance ?? 0,
          nplRatio: row.npl_ratio ?? 0,
          nCustomers: row.n_customers ?? 0,
          nContracts: row.n_contracts ?? 0,
          disbursementYtd: row.disbursement_ytd ?? 0,
          avgInterestRate: row.avg_interest_rate ?? 0 / 100,
        };
      }

      return {
        eopBalance: 0,
        nplRatio: 0,
        nCustomers: 0,
        nContracts: 0,
        disbursementYtd: 0,
        avgInterestRate: 0,
      };
    },
    enabled: !!parentBranchCode,
  });
}

export function useCustomerMix(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["branch-customer-mix", parentBranchCode],
    queryFn: async (): Promise<CustomerMixItem[]> => {
      const result = await db.sql`
        SELECT 
          CASE 
            WHEN c.priority_customer LIKE '%Private%' THEN 'Khách hàng cao cấp'
            WHEN c.priority_customer LIKE '%Gold%' OR c.priority_customer LIKE '%Platinum%' THEN 'Khách hàng ưu tiên'
            WHEN c.priority_customer LIKE '%Diamond%' THEN 'Khách hàng gắn mã theo dõi hạng'
            WHEN c.priority_customer LIKE '%Partnership%' THEN 'Khách hàng đối tác'
            ELSE 'Khách hàng thông thường'
          END AS customer_type,
          COUNT(DISTINCT l.customer_code) AS count,
          ROUND(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS exposure
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        LEFT JOIN customers c ON l.customer_code = c.customer_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY customer_type
        ORDER BY exposure DESC
      `;

      return result.map((row) => ({
        customerType:
          (row as { customer_type: string }).customer_type ??
          "Khách hàng thông thường",
        count: (row as { count: number }).count ?? 0,
        exposure: (row as { exposure: number }).exposure ?? 0,
      }));
    },
    enabled: !!parentBranchCode,
  });
}

export function useLoanGroups(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["branch-loan-groups", parentBranchCode],
    queryFn: async (): Promise<LoanGroupItem[]> => {
      const result = await db.sql`
        SELECT 
          CAST(COALESCE(l.debt_group_bank, '1') AS INTEGER) AS loan_group,
          ROUND(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS exposure
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY l.debt_group_bank
        ORDER BY loan_group
      `;

      return result.map((row) => ({
        loanGroup: (row as { loan_group: 1 | 2 | 3 | 4 }).loan_group,
        exposure: (row as { exposure: number }).exposure ?? 0,
      }));
    },
    enabled: !!parentBranchCode,
  });
}

export function useLoanGroupsByBranch(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["branch-loan-groups-by-branch", parentBranchCode],
    queryFn: async (): Promise<LoanGroupByBranchItem[]> => {
      const result = await db.sql`
        SELECT 
          b.branch_code,
          COALESCE(b.branch_name, b.branch_code) AS branch_name,
          ROUND(SUM(CASE WHEN CAST(COALESCE(l.debt_group_bank, '1') AS INTEGER) = 1 THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END) / 1000000000.0, 2) AS group1,
          ROUND(SUM(CASE WHEN CAST(COALESCE(l.debt_group_bank, '1') AS INTEGER) = 2 THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END) / 1000000000.0, 2) AS group2,
          ROUND(SUM(CASE WHEN CAST(COALESCE(l.debt_group_bank, '1') AS INTEGER) = 3 THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END) / 1000000000.0, 2) AS group3,
          ROUND(SUM(CASE WHEN CAST(COALESCE(l.debt_group_bank, '1') AS INTEGER) = 4 THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) ELSE 0 END) / 1000000000.0, 2) AS group4
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY b.branch_code, b.branch_name
        ORDER BY b.branch_code
      `;

      return result.map((row) => ({
        branchCode: (row as { branch_code: string }).branch_code ?? "",
        branchName: (row as { branch_name: string }).branch_name ?? "",
        group1: (row as { group1: number }).group1 ?? 0,
        group2: (row as { group2: number }).group2 ?? 0,
        group3: (row as { group3: number }).group3 ?? 0,
        group4: (row as { group4: number }).group4 ?? 0,
      }));
    },
    enabled: !!parentBranchCode,
  });
}

export function useRateBullet(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["branch-rate-bullet", parentBranchCode],
    queryFn: async (): Promise<RateBullet> => {
      const result = await db.sql`
        SELECT 
          ROUND(AVG(l.interest_rate), 4) AS actual_rate,
          ROUND(AVG(COALESCE(l.floating_margin, 0)), 4) AS spread
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
      `;

      if (result.length > 0) {
        const row = result[0] as { actual_rate: number; spread: number };
        const actualRate = row.actual_rate ?? 0;
        const spread = row.spread ?? 0;
        return {
          actualRate,
          benchmarkRate: actualRate - spread,
          spread,
        };
      }

      return {
        actualRate: 0,
        benchmarkRate: 0,
        spread: 0,
      };
    },
    enabled: !!parentBranchCode,
  });
}

export function useMaturityCalendar(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["branch-maturity-calendar", parentBranchCode],
    queryFn: async (): Promise<MaturityCalendarItem[]> => {
      const result = await db.sql`
        SELECT 
          CASE 
            WHEN JULIANDAY(l.expiry_date) - JULIANDAY('now') <= 30 THEN '1M'
            WHEN JULIANDAY(l.expiry_date) - JULIANDAY('now') <= 90 THEN '3M'
            WHEN JULIANDAY(l.expiry_date) - JULIANDAY('now') <= 180 THEN '6M'
            ELSE '12M'
          END AS bucket,
          ROUND(SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)) / 1000000000.0, 2) AS principal_due,
          COUNT(DISTINCT l.contract_number) AS n_contracts,
          COUNT(DISTINCT CASE WHEN l.debt_group_bank IN ('3','4','5') THEN l.contract_number END) AS npl_contracts
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
          AND l.expiry_date IS NOT NULL
          AND JULIANDAY(l.expiry_date) - JULIANDAY('now') <= 365
        GROUP BY bucket
        ORDER BY 
          CASE bucket
            WHEN '1M' THEN 1
            WHEN '3M' THEN 2
            WHEN '6M' THEN 3
            WHEN '12M' THEN 4
          END
      `;

      return result.map((row) => ({
        bucket: (row as { bucket: string }).bucket ?? "",
        principalDue: (row as { principal_due: number }).principal_due ?? 0,
        nContracts: (row as { n_contracts: number }).n_contracts ?? 0,
        nplContracts: (row as { npl_contracts: number }).npl_contracts ?? 0,
      }));
    },
    enabled: !!parentBranchCode,
  });
}

export function useContracts(params: {
  parentBranchCode?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["branch-contracts", params],
    queryFn: async (): Promise<ContractsResp> => {
      const {
        parentBranchCode,
        sortBy = "principal_outstanding",
        sortDir = "desc",
      } = params;

      // Get all contracts without pagination
      const orderClause = `${sortBy} ${sortDir.toUpperCase()}`;

      const result = await db.sql`
        SELECT 
          l.contract_number AS contract_id,
          l.customer_code AS customer_id,
          l.sub_product_code,
          COALESCE(s.loan_purpose_code, 'N/A') AS purpose_code,
          l.currency,
          ROUND(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) / 1000000000.0, 2) AS eop_balance,
          CAST(COALESCE(l.debt_group_ku, '1') AS INTEGER) AS loan_group,
          l.interest_rate,
          l.expiry_date,
          'active' AS status
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        LEFT JOIN sectors s ON l.sector_code = s.sector_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
        ORDER BY ${orderClause}
      `;

      type ContractRowData = {
        contract_id: string;
        customer_id: string;
        sub_product_code: string;
        purpose_code: string;
        currency: string;
        eop_balance: number;
        loan_group: 1 | 2 | 3 | 4;
        interest_rate: number;
        expiry_date: string;
        status: "active" | "overdue" | "closed";
      };

      const rows = result.map((row) => {
        const r = row as ContractRowData;
        return {
          contractId: r.contract_id ?? "",
          customerId: r.customer_id ?? "",
          productCode: r.sub_product_code ?? "",
          purposeCode: r.purpose_code ?? "",
          currency: r.currency ?? "",
          eopBalance: r.eop_balance ?? 0,
          loanGroup: r.loan_group,
          interestRate: r.interest_rate ?? 0,
          maturityDate: r.expiry_date ?? "",
          status: r.status,
        };
      });

      return {
        rows,
      };
    },
    enabled: !!params.parentBranchCode,
  });
}
