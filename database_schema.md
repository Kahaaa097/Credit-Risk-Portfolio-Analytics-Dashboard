# Database Schema - Entity Relationship Diagram

```mermaid
erDiagram
    BRANCHES ||--o{ LOANS : "has"
    CUSTOMERS ||--|| LOANS : "has one"
    PRODUCTS ||--o{ LOANS : "categorizes"
    SECTORS ||--o{ LOANS : "defines purpose"
    
    BRANCHES {
        string branch_code PK
        string parent_branch_code
        string branch_name
        string region
        string area
        string department_code
        string department_name
    }
    
    CUSTOMERS {
        string customer_code PK
        string customer_type
        string priority_customer
        string multiple_kunn
        string legal_id
    }
    
    PRODUCTS {
        string sub_product_code PK
        string product_name
        string sub_product_name
        string product_type
    }
    
    SECTORS {
        string sector_code PK
        string loan_purpose_code
        string loan_purpose_name
        string disbursement_purpose_code
        string disbursement_purpose_name
    }
    
    LOANS {
        integer id PK
        string stt
        string branch_code FK
        string customer_code FK
        string sector_code FK
        string sub_product_code FK
        string contract_number
        string contract_status
        integer contract_count
        string credit_contract_number
        string commitment_type
        string commitment_ccy
        float commitment_value
        string contract_on_profile
        date effective_date
        date expiry_date
        date original_disbursement_date
        date original_maturity_date
        string debt_group_ku
        string debt_group_name_ku
        string debt_group_bank
        string debt_group_cic
        string debt_group_customer
        string accounting_term
        string contract_term
        string term_category
        string sub_product_code
        float interest_rate
        float overdue_interest_rate
        float floating_interest_rate
        float floating_margin
        string currency
        float exchange_rate
        float principal_current
        float principal_overdue
        float principal_outstanding
        float principal_disbursed
        float interest_receivable
        float interest_paid
        float interest_outstanding
        float penalty_interest_principal_receivable
        float penalty_interest_principal_paid
        float penalty_interest_principal_outstanding
        float penalty_interest_on_interest_receivable
        float penalty_interest_on_interest_paid
        float penalty_interest_on_interest_outstanding
        float adhoc_interest_receivable
        float adhoc_interest_paid
        float adhoc_interest_outstanding
        string lc_payment_loan
        string slh_mortgage_loan
        string xln_block
        string limit_ref
        string old_core_contract_code
        string source
        string principal_collection_account
        string interest_collection_account
        string loan_project_code
        string loan_project_name
        string interest_calculation_basis
        date interest_payment_date
        date principal_payment_date
        string insurance_purchase
        date interest_rate_change_date
        string loan_program_code
        string loan_program_name
        string overdraft_program_code
        string overdraft_program_name
    }
```

## Entity Descriptions

### 1. **BRANCHES**
- Stores branch/department information
- Each branch can have multiple loans
- Hierarchical structure with parent branches

### 2. **CUSTOMERS**
- Customer master data
- Priority and type classifications
- Each customer has exactly one loan/contract (1:1 relationship)

### 3. **PRODUCTS**
- Loan product catalog
- Product types and sub-products
- Linked to loan records

### 4. **SECTORS**
- Economic sectors and loan purposes
- Disbursement purpose classifications
- Used for loan categorization

### 5. **LOANS** (Main Transaction Table)
- Central table containing all loan transactions
- Foreign keys to: branches, customers, products, sectors
- Contains financial data:
  - Principal amounts (current, overdue, outstanding, disbursed)
  - Interest details (receivable, paid, outstanding)
  - Penalty interest (on principal and on interest)
  - Interest rates (base, overdue, floating)
  - Date information (normalized to YYYY-MM-DD format)
  - Contract and commitment details
  - Account and payment information

## Relationships

- **One-to-Many**: Each branch, product, and sector can have multiple loans
- **One-to-One**: Each customer has exactly one loan/contract
- **Foreign Keys**: Loans table references all four master tables
- **Referential Integrity**: Ensures data consistency across tables
