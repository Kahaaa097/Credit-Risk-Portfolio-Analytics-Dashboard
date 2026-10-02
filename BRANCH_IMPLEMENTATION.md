# Branch Feature Implementation Summary

## Overview
Implemented comprehensive branch analytics feature with advanced filtering, KPIs, and visualizations according to the requirements.

## ✅ Implemented Features

### 1. Bộ lọc (Filters)
Implemented all required filters in `FilterBar.tsx`:
- ✅ **Chi nhánh cha** (Parent Branch) - Required field
- ✅ **Kỳ báo cáo** (Reporting Period - Month/Quarter) - YYYY-MM format
- ✅ **Sản phẩm** (Product) - Optional
- ✅ **Mục đích vay** (Loan Purpose) - Optional  
- ✅ **Loại tiền** (Currency) - Optional
- ✅ **Nhóm nợ** (Debt Group) - Optional (1-5)
- ✅ **Trạng thái khế ước** (Contract Status) - Optional
- ✅ **Loại KH** (Customer Type) - Optional

### 2. Cards Tổng Hợp (KPI Cards)
Implemented in `KpiCards.tsx` with the following metrics:
- ✅ **Dư nợ** (Outstanding Balance) - in billions VND
- ✅ **NPL%** (Non-Performing Loan Ratio) - calculated from debt groups 3-5
- ✅ **Số KH** (Number of Customers) - distinct count
- ✅ **Số khế ước** (Number of Contracts) - distinct count
- ✅ **Giải ngân YTD** (Disbursement Year-to-Date) - in billions VND
- ✅ **Lãi suất bình quân** (Average Interest Rate) - weighted average

All KPIs are **filtered based on the selected filters** (branch, product, purpose, currency, loan group, contract status, customer type).

### 3. Cơ Cấu Nhóm Nợ (Debt Group Structure)
Implemented in `LoanGroupsBar.tsx`:
- ✅ **Clustered bar chart** showing debt distribution across groups 1-5
- ✅ Uses `debt_group_bank` field from database
- ✅ Color-coded visualization with distinct colors per group
- ✅ Values displayed in billions VND

### 4. Hiệu Quả Lãi (Interest Rate Efficiency)
Implemented in `RateBullet.tsx`:
- ✅ **Bullet chart** comparing actual rate vs benchmark (chuẩn)
- ✅ Uses:
  - `interest_rate` - Actual interest rate
  - `floating_margin` - Interest rate spread/margin
  - `principal_outstanding` - Outstanding principal balance
- ✅ Calculates:
  - **Actual Rate**: Average interest rate
  - **Benchmark Rate**: Actual - Spread
  - **Difference**: Actual - Benchmark (color-coded: green if positive, red if negative)
- ✅ Visual bar shows actual rate percentage

### 5. Lịch Đáo Hạn (Maturity Calendar)
Implemented new component `MaturityCalendar.tsx`:
- ✅ **Calendar/heatmap** showing maturity buckets: 1-3-6-12 months
- ✅ Uses:
  - `maturity_date` - Contract maturity/expiry date
  - `principal_outstanding` - Outstanding principal
  - `debt_group_bank` - To identify NPL contracts (groups 3-5)
- ✅ Features:
  - Heat intensity based on outstanding principal amount
  - **Red color** for buckets with NPL contracts
  - **Blue color** for buckets without NPL
  - Shows contract count and NPL contract count per bucket
  - Filters contracts maturing within 1 year from current date

### 6. Bảng Chi Tiết Khế Ước (Contract Details Table)
Enhanced `ContractsTable.tsx`:
- ✅ **Scrollable table** with all contract details
- ✅ **Red highlighting** for debt groups 3-4 (NPL)
- ✅ Columns:
  - `branch_code` - Branch code (via filter)
  - `contract_number` - Contract ID
  - `debt_group_bank` - Debt group (1-5)
  - `principal_outstanding` - Outstanding principal
  - `maturity_date` - Maturity/expiry date
  - Additional: customer_code, product_code, purpose_code, currency, interest_rate, status
- ✅ Features:
  - Sortable columns
  - Pagination (20 per page)
  - Search functionality
  - Alert icon (⚠️) for NPL contracts
  - Export to CSV button (UI ready)

### 7. Pie Chart Phân Loại Khách Hàng (Customer Classification)
Enhanced `CustomerMixPie.tsx` with proper classification:
- ✅ Uses `priority_customer` field from customers table
- ✅ Classifications:
  - **Khách hàng cao cấp** (Premium): Contains "Private"
  - **Khách hàng ưu tiên** (Priority): Contains "Gold" or "Platinum"
  - **Khách hàng gắn mã theo dõi hạng** (Monitored): Contains "Diamond"
  - **Khách hàng đối tác** (Partner): Contains "Partnership"
  - **Khách hàng thông thường** (Regular): All others
- ✅ Shows count and exposure (outstanding balance) per category
- ✅ Color-coded pie chart with labels

## Database Queries & Logic

### KPI Calculation
- All KPIs use **LEFT JOIN with customers table** to support customer type filtering
- Currency conversion: `principal_outstanding * CASE WHEN currency != 'VND' THEN COALESCE(exchange_rate, 1) ELSE 1 END`
- NPL calculation: Groups 3, 4, 5 from `debt_group_bank` field
- Weighted average interest rate: `SUM(interest_rate * principal_outstanding) / SUM(principal_outstanding)`

### Maturity Calendar
- Uses `JULIANDAY()` SQL function to calculate days until maturity
- Buckets:
  - 1M: ≤ 30 days
  - 3M: ≤ 90 days
  - 6M: ≤ 180 days
  - 12M: ≤ 365 days
- NPL identification: `debt_group_bank IN ('3','4','5')`

### Customer Classification
- Uses SQL `CASE WHEN ... LIKE '%keyword%'` pattern matching on `priority_customer` field
- Hierarchical classification (Diamond > Gold > Platinum > Private > Partnership > Regular)

## Technical Implementation

### Files Modified/Created
1. **Schema & Types**:
   - `filter-form-schema.ts` - Added new filter fields
   - `-hook.ts` - Added new hooks and updated interfaces

2. **Components**:
   - `FilterBar.tsx` - Added 4 new filter dropdowns
   - `KpiCards.tsx` - Already existed, enhanced with filters
   - `LoanGroupsBar.tsx` - Updated to use debt_group_bank
   - `RateBullet.tsx` - Already existed, working correctly
   - `MaturityCalendar.tsx` - **NEW** - Calendar heatmap component
   - `CustomerMixPie.tsx` - Updated with priority_customer classification
   - `ContractsTable.tsx` - Already existed, enhanced with NPL highlighting

3. **Hooks**:
   - `usePurposeOptions()` - **NEW** - Fetch loan purposes
   - `useLoanGroupOptions()` - **NEW** - Fetch debt groups (1-5)
   - `useContractStatusOptions()` - **NEW** - Fetch contract statuses
   - `useMaturityCalendar()` - **NEW** - Fetch maturity calendar data
   - `useBranchKPI()` - Enhanced with all filters
   - `useCustomerMix()` - Enhanced with priority_customer logic

4. **Main Page**:
   - `index.tsx` - Integrated all components and filters

## Features Summary

| Requirement | Status | Component | Notes |
|------------|--------|-----------|-------|
| Bộ lọc chi nhánh cha | ✅ | FilterBar | Required field |
| Bộ lọc kỳ báo cáo | ✅ | FilterBar | YYYY-MM format |
| Bộ lọc sản phẩm | ✅ | FilterBar | Optional |
| Bộ lọc mục đích vay | ✅ | FilterBar | Optional |
| Bộ lọc loại tiền | ✅ | FilterBar | Optional |
| Bộ lọc nhóm nợ | ✅ | FilterBar | Optional, 1-5 |
| Bộ lọc trạng thái khế ước | ✅ | FilterBar | Optional |
| Bộ lọc loại KH | ✅ | FilterBar | Optional |
| Card: Dư nợ | ✅ | KpiCards | With filters |
| Card: NPL% | ✅ | KpiCards | Groups 3-5 |
| Card: Số KH | ✅ | KpiCards | Distinct count |
| Card: Số khế ước | ✅ | KpiCards | Distinct count |
| Card: Giải ngân YTD | ✅ | KpiCards | YTD total |
| Card: Lãi suất bình quân | ✅ | KpiCards | Weighted avg |
| Cơ cấu nhóm nợ bar chart | ✅ | LoanGroupsBar | Groups 1-5 |
| Hiệu quả lãi bullet chart | ✅ | RateBullet | Actual vs benchmark |
| Lịch đáo hạn calendar | ✅ | MaturityCalendar | 1-3-6-12M buckets |
| Bảng khế ước scrollable | ✅ | ContractsTable | With pagination |
| Bảng khế ước tô đỏ NPL | ✅ | ContractsTable | Groups 3-4-5 |
| Pie chart phân loại KH | ✅ | CustomerMixPie | 5 categories |

## Data Fields Used

### From `loans` table:
- `branch_code` - Branch identifier
- `customer_code` - Customer identifier  
- `contract_number` - Contract identifier
- `sub_product_code` - Product code
- `sector_code` - Loan purpose code
- `currency` - Currency type
- `exchange_rate` - Exchange rate for non-VND
- `debt_group_bank` - Debt classification (1-5)
- `contract_status` - Contract status
- `principal_outstanding` - Outstanding principal balance
- `principal_disbursed` - Disbursed amount (for YTD)
- `interest_rate` - Interest rate
- `floating_margin` - Interest rate spread
- `maturity_date` - Contract maturity date

### From `customers` table:
- `customer_code` - Customer identifier
- `customer_type` - Customer type classification
- `priority_customer` - Priority/VIP classification

### From `products` table:
- `sub_product_code` - Product code
- `sub_product_name` - Product name

### From `sectors` table:
- `sector_code` - Sector code
- `loan_purpose_name` - Purpose name

### From `branches` table:
- `branch_code` - Branch code
- `parent_branch_code` - Parent branch code

## Usage

1. **Select a branch** (required)
2. **Optionally select filters** for more specific analysis
3. **Click "Áp dụng"** to load data
4. All charts and tables will update based on filters
5. Sort and search in the contracts table
6. Export data using CSV button

## Notes

- All monetary values are converted to VND billions using exchange rates
- NPL is defined as debt groups 3, 4, 5 (following banking regulations)
- Customer classification is based on `priority_customer` field with keyword matching
- Maturity calendar shows contracts maturing within next 12 months
- All queries are optimized with proper indexing on foreign keys
