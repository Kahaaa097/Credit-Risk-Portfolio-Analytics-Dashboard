import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/hooks/db";

// Type definitions
export interface ContractOption {
  value: string;
  label: string;
}

export interface ContractInfo {
  contractNumber: string;
  customerCode: string;
  customerName: string;
  contractStatus: string;
  effectiveDate: string;
  originalDisbursementDate: string;
  expiryDate: string;
  accountingTerm: string;
  contractTerm: string;
  currency: string;
  sectorCode: string;
  loanPurposeName: string;
  subProductCode: string;
  subProductName: string;
  interestRate: number;
  overdueInterestRate: number;
  floatingMargin: number;
  principalOutstanding: number;
  branchCode: string;
  branchName: string;
}

// Custom hook to search for contracts
export function useContractSearch(searchQuery: string) {
  return useQuery({
    queryKey: ["contract-search", searchQuery],
    queryFn: async (): Promise<ContractOption[]> => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        return [];
      }

      const searchPattern = `%${searchQuery.trim()}%`;

      const result = await db.sql`
        SELECT DISTINCT 
          l.contract_number AS value,
          l.contract_number || ' - ' || COALESCE(c.customer_type, l.customer_code) AS label
        FROM loans l
        LEFT JOIN customers c ON l.customer_code = c.customer_code
        WHERE l.contract_number IS NOT NULL
          AND l.contract_number != ''
          AND (
            l.contract_number LIKE ${searchPattern}
            OR l.customer_code LIKE ${searchPattern}
            OR c.customer_type LIKE ${searchPattern}
          )
        ORDER BY l.contract_number
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

// Custom hook to fetch contract information
export function useContractInfo(contractNumber?: string) {
  return useQuery({
    queryKey: ["contract-info", contractNumber],
    queryFn: async (): Promise<ContractInfo | null> => {
      if (!contractNumber) return null;

      const result = await db.sql`
        SELECT 
          l.contract_number,
          l.customer_code,
          COALESCE(c.customer_type, l.customer_code) AS customer_name,
          COALESCE(l.contract_status, 'N/A') AS contract_status,
          COALESCE(l.effective_date, '') AS effective_date,
          COALESCE(l.original_disbursement_date, '') AS original_disbursement_date,
          COALESCE(l.expiry_date, '') AS expiry_date,
          COALESCE(l.accounting_term, 'N/A') AS accounting_term,
          COALESCE(l.contract_term, 'N/A') AS contract_term,
          COALESCE(l.currency, 'VND') AS currency,
          COALESCE(l.sector_code, 'N/A') AS sector_code,
          COALESCE(s.loan_purpose_name, 'N/A') AS loan_purpose_name,
          COALESCE(l.sub_product_code, 'N/A') AS sub_product_code,
          COALESCE(p.sub_product_name, 'N/A') AS sub_product_name,
          COALESCE(l.interest_rate, 0) / 100.0 AS interest_rate,
          COALESCE(l.overdue_interest_rate, 0) / 100.0 AS overdue_interest_rate,
          COALESCE(l.floating_margin, 0) / 100.0 AS floating_margin,
          COALESCE(l.principal_outstanding * CASE WHEN l.currency != 'VND' THEN COALESCE(l.exchange_rate, 1) ELSE 1 END, 0) / 1000000000.0 AS principal_outstanding,
          COALESCE(l.branch_code, 'N/A') AS branch_code,
          COALESCE(b.branch_name, 'N/A') AS branch_name
        FROM loans l
        LEFT JOIN customers c ON l.customer_code = c.customer_code
        LEFT JOIN sectors s ON l.sector_code = s.sector_code
        LEFT JOIN products p ON l.sub_product_code = p.sub_product_code
        LEFT JOIN branches b ON l.branch_code = b.branch_code
        WHERE l.contract_number = ${contractNumber}
        LIMIT 1
      `;

      if (result.length === 0) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = result[0] as any;
      return {
        contractNumber: row.contract_number ?? contractNumber,
        customerCode: row.customer_code ?? "N/A",
        customerName: row.customer_name ?? "N/A",
        contractStatus: row.contract_status ?? "N/A",
        effectiveDate: row.effective_date ?? "",
        originalDisbursementDate: row.original_disbursement_date ?? "",
        expiryDate: row.expiry_date ?? "",
        accountingTerm: row.accounting_term ?? "N/A",
        contractTerm: row.contract_term ?? "N/A",
        currency: row.currency ?? "VND",
        sectorCode: row.sector_code ?? "N/A",
        loanPurposeName: row.loan_purpose_name ?? "N/A",
        subProductCode: row.sub_product_code ?? "N/A",
        subProductName: row.sub_product_name ?? "N/A",
        interestRate: row.interest_rate ?? 0,
        overdueInterestRate: row.overdue_interest_rate ?? 0,
        floatingMargin: row.floating_margin ?? 0,
        principalOutstanding: row.principal_outstanding ?? 0,
        branchCode: row.branch_code ?? "N/A",
        branchName: row.branch_name ?? "N/A",
      };
    },
    enabled: !!contractNumber,
  });
}

// Custom hook to get customer information by customer code
export function useCustomerInfo(customerCode?: string) {
  return useQuery({
    queryKey: ["customer-info-by-code", customerCode],
    queryFn: async (): Promise<{ customerName: string } | null> => {
      if (!customerCode) return null;

      const result = await db.sql`
        SELECT 
          COALESCE(c.customer_type, c.customer_code) AS customer_name
        FROM customers c
        WHERE c.customer_code = ${customerCode}
        LIMIT 1
      `;

      if (result.length === 0) return null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = result[0] as any;
      return {
        customerName: row.customer_name ?? customerCode,
      };
    },
    enabled: !!customerCode,
  });
}
