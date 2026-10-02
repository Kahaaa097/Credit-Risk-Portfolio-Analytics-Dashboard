import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/hooks/db";

export interface ParentBranchOption {
  value: string;
  label: string;
}

// Data for Stacked column chart - Outstanding by Product and Purpose
export interface OutstandingByProductPurpose {
  product_name: string;
  loan_purpose_name: string;
  principal_outstanding: number; // in billions VND
}

// Data for Bar chart - Average Interest Rate & NPL%
export interface ProductPerformance {
  product_name: string;
  avg_interest_rate: number;
  npl_ratio: number;
  total_outstanding: number; // for reference
}

// Data for Scatter chart - Interest Rate vs Risk (NPL%)
export interface ProductRiskCorrelation {
  product_name: string;
  interest_rate: number;
  npl_ratio: number;
  debt_group: string;
  principal_outstanding: number; // for bubble size
}

// Data for Radar chart - Branch comparison
export interface BranchProductBenchmark {
  branch_code: string;
  branch_name: string;
  avg_interest_rate: number;
  npl_ratio: number;
  total_outstanding: number; // in billions VND
}

// Hook to search for parent branches
export function useParentBranchSearch(searchQuery: string) {
  return useQuery({
    queryKey: ["parent-branch-search", searchQuery],
    queryFn: async (): Promise<ParentBranchOption[]> => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return [];
      }

      const searchPattern1 = `%${searchQuery.trim()}%`;
      const searchPattern2 = `%${searchQuery.trim()}%`;

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
    enabled: searchQuery.trim().length > 0,
  });
}

// Hook for Outstanding Structure by Product and Purpose
export function useOutstandingByProductPurpose(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["outstanding-by-product-purpose", parentBranchCode],
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<OutstandingByProductPurpose[]> => {
      const result = await db.sql`
        SELECT 
          COALESCE(p.sub_product_name, 'Khác') AS product_name,
          COALESCE(s.loan_purpose_name, 'Không xác định') AS loan_purpose_name,
          ROUND(
            SUM(
              COALESCE(
                l.principal_outstanding * 
                CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 
                0
              )
            ) / 1000000000.0, 
            2
          ) AS principal_outstanding
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        LEFT JOIN products p ON l.sub_product_code = p.sub_product_code
        LEFT JOIN sectors s ON l.sector_code = s.sector_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY p.sub_product_name, s.loan_purpose_name
        HAVING principal_outstanding > 0
        ORDER BY principal_outstanding DESC
      `;

      return result as OutstandingByProductPurpose[];
    },
  });
}

// Hook for Product Performance (Average Interest Rate & NPL%)
export function useProductPerformance(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["product-performance", parentBranchCode],
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<ProductPerformance[]> => {
      const result = await db.sql`
        SELECT 
          COALESCE(p.sub_product_name, 'Khác') AS product_name,
          ROUND(
            AVG(COALESCE(l.interest_rate, 0)), 
            2
          ) AS avg_interest_rate,
          ROUND(
            COALESCE(
              SUM(
                CASE WHEN l.debt_group_bank IN ('3', '4', '5') 
                THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) 
                ELSE 0 END
              ) * 100.0 / 
              NULLIF(
                SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)), 
                0
              ), 
              0
            ), 
            2
          ) AS npl_ratio,
          ROUND(
            SUM(
              COALESCE(
                l.principal_outstanding * 
                CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 
                0
              )
            ) / 1000000000.0, 
            2
          ) AS total_outstanding
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        LEFT JOIN products p ON l.sub_product_code = p.sub_product_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY p.sub_product_name
        HAVING total_outstanding > 0
        ORDER BY total_outstanding DESC
      `;

      return result as ProductPerformance[];
    },
  });
}

// Hook for Product Risk Correlation (Interest Rate vs NPL%)
export function useProductRiskCorrelation(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["product-risk-correlation", parentBranchCode],
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<ProductRiskCorrelation[]> => {
      const result = await db.sql`
        SELECT 
          COALESCE(p.sub_product_name, 'Khác') AS product_name,
          l.interest_rate,
          CASE 
            WHEN l.debt_group_bank IN ('1', '2') THEN 0
            WHEN l.debt_group_bank = '3' THEN 20
            WHEN l.debt_group_bank = '4' THEN 50
            WHEN l.debt_group_bank = '5' THEN 100
            ELSE 0
          END AS npl_ratio,
          COALESCE(l.debt_group_bank, '1') AS debt_group,
          ROUND(
            COALESCE(
              l.principal_outstanding * 
              CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 
              0
            ) / 1000000000.0, 
            2
          ) AS principal_outstanding
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        LEFT JOIN products p ON l.sub_product_code = p.sub_product_code
        WHERE (b.parent_branch_code = ${parentBranchCode} OR b.branch_code = ${parentBranchCode})
          AND COALESCE(l.principal_outstanding, 0) > 0
          AND l.interest_rate IS NOT NULL
          AND l.interest_rate > 0
        ORDER BY RANDOM()
        LIMIT 500
      `;

      return result as ProductRiskCorrelation[];
    },
  });
}

// Hook for Branch Product Benchmark (Radar chart)
export function useBranchProductBenchmark(parentBranchCode?: string) {
  return useQuery({
    queryKey: ["branch-product-benchmark", parentBranchCode],
    enabled: !!parentBranchCode,
    queryFn: async (): Promise<BranchProductBenchmark[]> => {
      const result = await db.sql`
        SELECT 
          l.branch_code,
          COALESCE(b.branch_name, l.branch_code) AS branch_name,
          ROUND(
            AVG(COALESCE(l.interest_rate, 0)), 
            2
          ) AS avg_interest_rate,
          ROUND(
            COALESCE(
              SUM(
                CASE WHEN l.debt_group_bank IN ('3', '4', '5') 
                THEN COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) 
                ELSE 0 END
              ) * 100.0 / 
              NULLIF(
                SUM(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0)), 
                0
              ), 
              0
            ), 
            2
          ) AS npl_ratio,
          ROUND(
            SUM(
              COALESCE(
                l.principal_outstanding * 
                CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 
                0
              )
            ) / 1000000000.0, 
            2
          ) AS total_outstanding
        FROM loans l
        INNER JOIN branches b ON l.branch_code = b.branch_code
        WHERE b.parent_branch_code = ${parentBranchCode}
          AND COALESCE(l.principal_outstanding, 0) > 0
        GROUP BY l.branch_code, b.branch_name
        HAVING total_outstanding > 0
        ORDER BY total_outstanding DESC
        LIMIT 10
      `;

      return result as BranchProductBenchmark[];
    },
  });
}
