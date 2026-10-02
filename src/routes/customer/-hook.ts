import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/hooks/db";

// Type definitions
export interface CustomerOption {
  value: string;
  label: string;
}

export interface CustomerProfile {
  customerId: string;
  customerType: string;
  priorityCustomer: string;
  totalOutstanding: number;
  highestDebtGroup: string;
  activeContracts: number; // Always 1 - each customer has only one contract
  legalId: string;
  multipleKunn: string;
}

export interface CustomerContract {
  contractNumber: string;
  contractStatus: string;
  productCode: string;
  productName: string;
  loanPurpose: string;
  loanPurposeName: string;
  interestRate: number;
  principalOutstanding: number;
  debtGroup: string;
  effectiveDate: string;
  expiryDate: string;
  originalMaturityDate: string;
  currency: string;
  daysToMaturity: number;
  riskLevel: number; // 1-5 scale
}

export interface CustomerRiskIndicator {
  riskLevel: number; // 1-5
  nplRatio: number;
  overdueContracts: number;
  totalContracts: number;
  maxDebtGroup: string;
  riskColor: string;
  riskLabel: string;
}

// Custom hook to search for customers
export function useCustomerSearch(searchQuery: string) {
  return useQuery({
    queryKey: ["customer-search", searchQuery],
    queryFn: async (): Promise<CustomerOption[]> => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return [];
      }

      const searchPattern = `%${searchQuery.trim()}%`;

      const result = await db.sql`
        SELECT DISTINCT 
          l.customer_code AS value,
          COALESCE(c.customer_type || ' - ' || l.customer_code, l.customer_code) AS label
        FROM loans l
        LEFT JOIN customers c ON l.customer_code = c.customer_code
        WHERE l.customer_code IS NOT NULL
          AND l.customer_code != ''
          AND (
            l.customer_code LIKE ${searchPattern}
            OR c.customer_type LIKE ${searchPattern}
          )
        ORDER BY l.customer_code
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

// Custom hook to fetch customer profile
export function useCustomerProfile(customerId?: string) {
  return useQuery({
    queryKey: ["customer-profile", customerId],
    queryFn: async (): Promise<CustomerProfile | null> => {
      if (!customerId) return null;

      // Each customer has only ONE contract - get the first/only loan record
      const result = await db.sql`
        SELECT 
          c.customer_code AS customer_id,
          COALESCE(c.customer_type, 'N/A') AS customer_type,
          COALESCE(c.priority_customer, 'N/A') AS priority_customer,
          COALESCE(c.legal_id, 'N/A') AS legal_id,
          COALESCE(c.multiple_kunn, 'N/A') AS multiple_kunn,
          ROUND(COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) / 1000000000.0, 2) AS total_outstanding,
          CAST(COALESCE(l.debt_group_ku, '1') AS INTEGER) AS highest_debt_group,
          1 AS active_contracts
        FROM customers c
        LEFT JOIN loans l ON c.customer_code = l.customer_code
        WHERE c.customer_code = ${customerId}
          AND COALESCE(l.principal_outstanding, 0) > 0
        LIMIT 1
      `;

      if (result.length === 0) return null;

      const row = result[0] as any;
      return {
        customerId: row.customer_id || customerId,
        customerType: row.customer_type || "N/A",
        priorityCustomer: row.priority_customer || "N/A",
        legalId: row.legal_id || "N/A",
        multipleKunn: row.multiple_kunn || "N/A",
        totalOutstanding: row.total_outstanding || 0,
        highestDebtGroup: row.highest_debt_group?.toString() || "1",
        activeContracts: row.active_contracts || 1,
      };
    },
    enabled: !!customerId,
  });
}

// Custom hook to fetch customer contract (single contract per customer)
export function useCustomerContracts(customerId?: string) {
  return useQuery({
    queryKey: ["customer-contracts", customerId],
    enabled: !!customerId,
    queryFn: async (): Promise<CustomerContract[]> => {
      if (!customerId) return [];

      // Each customer has only ONE contract
      const result = await db.sql`
        SELECT 
          l.contract_number,
          COALESCE(l.contract_status, 'N/A') AS contract_status,
          COALESCE(l.sub_product_code, 'N/A') AS sub_product_code,
          COALESCE(p.sub_product_name, l.sub_product_code) AS product_name,
          COALESCE(l.sector_code, 'N/A') AS loan_purpose,
          COALESCE(s.loan_purpose_name, 'N/A') AS loan_purpose_name,
          COALESCE(l.interest_rate, 0) AS interest_rate,
          COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) / 1000000000.0 AS principal_outstanding,
          COALESCE(l.debt_group_ku, '1') AS debt_group,
          COALESCE(l.effective_date, '') AS effective_date,
          COALESCE(l.expiry_date, '') AS expiry_date,
          COALESCE(l.original_maturity_date, '') AS original_maturity_date,
          COALESCE(l.currency, 'VND') AS currency,
          CASE 
            WHEN l.original_maturity_date IS NOT NULL AND l.original_maturity_date != '' 
            THEN CAST((julianday(l.original_maturity_date) - julianday('now')) AS INTEGER)
            ELSE 9999
          END AS days_to_maturity
        FROM loans l
        LEFT JOIN products p ON l.sub_product_code = p.sub_product_code
        LEFT JOIN sectors s ON l.sector_code = s.sector_code
        WHERE l.customer_code = ${customerId}
          AND COALESCE(l.principal_outstanding, 0) > 0
        LIMIT 1
      `;

      console.log(result);
      console.log(result);
      console.log(result);
      console.log(result);
      console.log(result);

      return result.map((row: any) => {
        const debtGroup = parseInt(row.debt_group) || 1;
        const daysToMaturity = row.days_to_maturity;

        // Risk level is directly debt_group_ku (1-5)
        const riskLevel = debtGroup;

        return {
          contractNumber: row.contract_number || "N/A",
          contractStatus: row.contract_status || "N/A",
          productCode: row.sub_product_code || "N/A",
          productName: row.product_name || "N/A",
          loanPurpose: row.loan_purpose || "N/A",
          loanPurposeName: row.loan_purpose_name || "N/A",
          interestRate: row.interest_rate || 0,
          principalOutstanding: row.principal_outstanding || 0,
          debtGroup: row.debt_group || "1",
          effectiveDate: row.effective_date || "",
          expiryDate: row.expiry_date || "",
          originalMaturityDate: row.original_maturity_date || "",
          currency: row.currency || "VND",
          daysToMaturity: daysToMaturity,
          riskLevel: riskLevel,
        };
      });
    },
  });
}

// Custom hook to calculate customer risk indicator
export function useCustomerRiskIndicator(customerId?: string) {
  return useQuery({
    queryKey: ["customer-risk", customerId],
    queryFn: async (): Promise<CustomerRiskIndicator | null> => {
      if (!customerId) return null;

      // Each customer has only ONE contract
      const result = await db.sql`
        SELECT 
          COALESCE(l.debt_group_ku, 1) AS risk_level,
          1 AS total_contracts,
          CASE WHEN CAST(COALESCE(l.debt_group_ku, '1') AS INTEGER) >= 3 THEN 1 ELSE 0 END AS overdue_contracts,
          CAST(COALESCE(l.debt_group_ku, '1') AS INTEGER) AS max_debt_group,
          CASE 
            WHEN CAST(COALESCE(l.debt_group_ku, '1') AS INTEGER) >= 3 THEN 1.0
            ELSE 0.0
          END AS npl_ratio
        FROM loans l
        WHERE l.customer_code = ${customerId}
          AND COALESCE(l.principal_outstanding, 0) > 0
        LIMIT 1
      `;

      if (result.length === 0) return null;

      const row = result[0] as any;
      const maxDebtGroup = row.max_debt_group || 1;
      const nplRatio = row.npl_ratio || 0;
      const overdueContracts = row.overdue_contracts || 0;
      const totalContracts = 1; // Always 1 contract per customer
      const riskLevel = row.risk_level;

      // Determine color and label
      const riskMap = [
        { color: "#10B981", label: "Rất thấp" }, // green
        { color: "#22C55E", label: "Thấp" }, // light green
        { color: "#F59E0B", label: "Trung bình" }, // orange
        { color: "#F97316", label: "Cao" }, // dark orange
        { color: "#EF4444", label: "Rất cao" }, // red
      ];

      const risk = riskMap[riskLevel - 1];

      return {
        riskLevel,
        nplRatio,
        overdueContracts,
        totalContracts,
        maxDebtGroup: maxDebtGroup.toString(),
        riskColor: risk.color,
        riskLabel: risk.label,
      };
    },
    enabled: !!customerId,
  });
}
