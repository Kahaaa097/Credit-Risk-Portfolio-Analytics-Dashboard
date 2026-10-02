import csv
import sqlite3
from datetime import datetime
from pathlib import Path


def normalize_date(date_str):
    """
    Convert date from DD-MM-YYYY or DD/MM/YYYY to YYYY-MM-DD format.
    Returns None if the date is empty or invalid.
    """
    if not date_str or date_str.strip() == "":
        return None

    # Try different date formats
    date_formats = [
        "%d/%m/%Y",  # DD/MM/YYYY
        "%m/%d/%Y",  # MM/DD/YYYY (just in case)
        "%d-%m-%Y",  # DD-MM-YYYY
        "%Y-%m-%d",  # Already normalized
    ]

    for fmt in date_formats:
        try:
            date_obj = datetime.strptime(date_str.strip(), fmt)
            return date_obj.strftime("%Y-%m-%d")
        except ValueError:
            continue

    # If no format matches, return original value
    return date_str


def clean_numeric(value):
    """Clean numeric values by removing spaces and handling empty values."""
    if not value or value.strip() == "":
        return None
    try:
        return float(value.replace(",", "").replace(" ", ""))
    except ValueError:
        return None


def process_csv_and_create_db(csv_path, db_path):
    """
    Process CSV file, normalize dates, denormalize into multiple tables,
    and save to SQLite database.
    """
    # Read CSV file
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Read {len(rows)} rows from CSV")

    # Connect to database (will create if doesn't exist)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop existing tables if they exist
    cursor.execute("DROP TABLE IF EXISTS loans")
    cursor.execute("DROP TABLE IF EXISTS customers")
    cursor.execute("DROP TABLE IF EXISTS branches")
    cursor.execute("DROP TABLE IF EXISTS products")
    cursor.execute("DROP TABLE IF EXISTS sectors")

    # Create normalized tables

    # 1. Branches table
    cursor.execute("""
        CREATE TABLE branches (
            branch_code TEXT PRIMARY KEY,
            parent_branch_code TEXT,
            branch_name TEXT,
            region TEXT,
            area TEXT,
            department_code TEXT,
            department_name TEXT
        )
    """)

    # 2. Customers table
    cursor.execute("""
        CREATE TABLE customers (
            customer_code TEXT PRIMARY KEY,
            customer_type TEXT,
            priority_customer TEXT,
            multiple_kunn TEXT,
            legal_id TEXT
        )
    """)

    # 3. Products table
    cursor.execute("""
        CREATE TABLE products (
            sub_product_code TEXT PRIMARY KEY,
            sub_product_name TEXT,
            product_type TEXT
        )
    """)

    # 4. Sectors table
    cursor.execute("""
        CREATE TABLE sectors (
            sector_code TEXT PRIMARY KEY,
            loan_purpose_code TEXT,
            loan_purpose_name TEXT,
            disbursement_purpose_code TEXT,
            disbursement_purpose_name TEXT
        )
    """)

    # 5. Main loans table
    cursor.execute("""
        CREATE TABLE loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stt TEXT,
            branch_code TEXT,
            customer_code TEXT,
            sector_code TEXT,
            contract_number TEXT,
            contract_status TEXT,
            contract_count INTEGER,
            credit_contract_number TEXT,
            commitment_type TEXT,
            commitment_ccy TEXT,
            commitment_value REAL,
            contract_on_profile TEXT,
            effective_date TEXT,
            expiry_date TEXT,
            original_disbursement_date TEXT,
            original_maturity_date TEXT,
            debt_group_ku TEXT,
            debt_group_name_ku TEXT,
            debt_group_bank TEXT,
            debt_group_cic TEXT,
            debt_group_customer TEXT,
            accounting_term TEXT,
            contract_term TEXT,
            term_category TEXT,
            sub_product_code TEXT,
            interest_rate REAL,
            overdue_interest_rate REAL,
            floating_interest_rate REAL,
            floating_margin REAL,
            currency TEXT,
            exchange_rate REAL,
            principal_current REAL,
            principal_overdue REAL,
            principal_outstanding REAL,
            principal_disbursed REAL,
            interest_receivable REAL,
            interest_paid REAL,
            interest_outstanding REAL,
            penalty_interest_principal_receivable REAL,
            penalty_interest_principal_paid REAL,
            penalty_interest_principal_outstanding REAL,
            penalty_interest_on_interest_receivable REAL,
            penalty_interest_on_interest_paid REAL,
            penalty_interest_on_interest_outstanding REAL,
            adhoc_interest_receivable REAL,
            adhoc_interest_paid REAL,
            adhoc_interest_outstanding REAL,
            lc_payment_loan TEXT,
            slh_mortgage_loan TEXT,
            xln_block TEXT,
            limit_ref TEXT,
            old_core_contract_code TEXT,
            source TEXT,
            principal_collection_account TEXT,
            interest_collection_account TEXT,
            loan_project_code TEXT,
            loan_project_name TEXT,
            interest_calculation_basis TEXT,
            interest_payment_date TEXT,
            principal_payment_date TEXT,
            insurance_purchase TEXT,
            interest_rate_change_date TEXT,
            loan_program_code TEXT,
            loan_program_name TEXT,
            overdraft_program_code TEXT,
            overdraft_program_name TEXT,
            FOREIGN KEY (branch_code) REFERENCES branches(branch_code),
            FOREIGN KEY (customer_code) REFERENCES customers(customer_code),
            FOREIGN KEY (sub_product_code) REFERENCES products(sub_product_code),
            FOREIGN KEY (sector_code) REFERENCES sectors(sector_code)
        )
    """)

    # Prepare data for insertion
    branches = {}
    customers = {}
    products = {}
    sectors = {}
    loans_data = []

    print("Processing and normalizing data...")

    for row in rows:
        # Normalize dates
        effective_date = normalize_date(row.get("Ngày hiệu lực", ""))
        expiry_date = normalize_date(row.get("Ngày hết hạn", ""))
        original_disbursement_date = normalize_date(
            row.get("Ngày giải ngân ban đầu của khoản vay - orig_val_date", "")
        )
        original_maturity_date = normalize_date(
            row.get("Ngày hết hạn ban đầu của khoản vay-orig_mat_date", "")
        )
        interest_payment_date = normalize_date(row.get("Ngày trả Lãi", ""))
        principal_payment_date = normalize_date(row.get("Ngày trả Gốc", ""))
        interest_rate_change_date = normalize_date(
            row.get("Ngày thay đổi Lãi suất", "")
        )

        # Extract branch data
        branch_code = row.get("Mã chi nhánh", "")
        if branch_code and branch_code not in branches:
            branches[branch_code] = {
                "branch_code": branch_code,
                "parent_branch_code": row.get("Mã chi nhánh cha", ""),
                "branch_name": row.get("Tên phòng ban", ""),
                "region": row.get("Vùng", ""),
                "area": row.get("Khu vực", ""),
                "department_code": row.get("Mã phòng", ""),
                "department_name": row.get("Tên phòng ban", ""),
            }

        # Extract customer data
        customer_code = row.get("Mã khách hàng", "")
        if customer_code and customer_code not in customers:
            customers[customer_code] = {
                "customer_code": customer_code,
                "customer_type": row.get("Khách hàng ưu tiên", ""),
                "priority_customer": row.get("Khách hàng ưu tiên", ""),
                "multiple_kunn": row.get(" KH >1 KUNN", ""),
                "legal_id": row.get("Legal Id", ""),
            }

        # Extract product data
        sub_product_code = row.get("Mã sản phẩm (loan_subproduct)", "")
        if sub_product_code and sub_product_code not in products:
            products[sub_product_code] = {
                "sub_product_code": row.get("Mã sản phẩm (loan_subproduct)", ""),
                "sub_product_name": row.get("Sub product.Tên sản phẩm", ""),
                "product_type": row.get("Loại sản phẩm", ""),
            }

        # Extract sector data
        sector_code = row.get("Mã Sector", "")
        if sector_code and sector_code not in sectors:
            sectors[sector_code] = {
                "sector_code": sector_code,
                "loan_purpose_code": row.get("Mã mục đich vay", ""),
                "loan_purpose_name": row.get("Tên mục đích vay", ""),
                "disbursement_purpose_code": row.get("Mã mục đích giải ngân", ""),
                "disbursement_purpose_name": row.get("Tên mục đích giải ngân", ""),
            }

        # Prepare loan data
        loan = {
            "stt": row.get("STT", ""),
            "branch_code": branch_code,
            "customer_code": customer_code,
            "sector_code": sector_code,
            "contract_number": row.get("Số khế ước (distinct)", ""),
            "contract_status": row.get("Trạng thái khế ước", ""),
            "contract_count": clean_numeric(row.get("số lượng hđ", "")),
            "credit_contract_number": row.get("Số hợp đồng tín dụng", ""),
            "commitment_type": row.get("Commitment Type", ""),
            "commitment_ccy": row.get("Commitment Ccy", ""),
            "commitment_value": clean_numeric(row.get("Giá trị hợp đồng cam kết", "")),
            "contract_on_profile": row.get("Số hợp đồng trên hồ sơ", ""),
            "effective_date": effective_date,
            "expiry_date": expiry_date,
            "original_disbursement_date": original_disbursement_date,
            "original_maturity_date": original_maturity_date,
            "sub_product_code": sub_product_code,
            "debt_group_ku": row.get("Nhóm nợ KU", ""),
            "debt_group_name_ku": row.get("Tên nhóm nợ KU", ""),
            "debt_group_bank": row.get("Nhóm nợ NH ABCDEF", ""),
            "debt_group_cic": row.get("Nhóm nợ theo CIC", ""),
            "debt_group_customer": row.get("Nhóm nợ KH", ""),
            "accounting_term": row.get("Kỳ hạn kế toán", ""),
            "contract_term": row.get("Kỳ hạn hợp đồng", ""),
            "term_category": row.get("Phân theo kỳ hạn (NH,TD,DH)", ""),
            "sub_product_code": row.get("Mã sản phẩm (loan_subproduct)", ""),
            "interest_rate": clean_numeric(row.get("Lãi Suất", "")),
            "overdue_interest_rate": clean_numeric(row.get("LS quá hạn", "")),
            "floating_interest_rate": clean_numeric(row.get("Lãi suất thả nổi", "")),
            "floating_margin": clean_numeric(row.get("Biên độ LS thả nổi", "")),
            "currency": row.get("Loại tiền", ""),
            "exchange_rate": clean_numeric(row.get("Tỷ Giá", "")),
            "principal_current": clean_numeric(row.get("Gốc trong hạn", "")),
            "principal_overdue": clean_numeric(row.get("Gốc quá hạn", "")),
            "principal_outstanding": clean_numeric(
                row.get("Gốc vay còn lại (nợ trong hạn+ nợ quá hạn)", "")
            ),
            "principal_disbursed": clean_numeric(row.get("Gốc vay giải ngân", "")),
            "interest_receivable": clean_numeric(
                row.get("Lãi thông thường - Phải trả", "")
            ),
            "interest_paid": clean_numeric(row.get("Lãi thông thường - Đã trả", "")),
            "interest_outstanding": clean_numeric(
                row.get("Lãi vay thông thường còn lại", "")
            ),
            "penalty_interest_principal_receivable": clean_numeric(
                row.get("Lãi phạt trên gốc - Phải trả", "")
            ),
            "penalty_interest_principal_paid": clean_numeric(
                row.get("Lãi phạt trên gốc - Đã trả", "")
            ),
            "penalty_interest_principal_outstanding": clean_numeric(
                row.get("Lãi phạt trên gốc - Còn lại", "")
            ),
            "penalty_interest_on_interest_receivable": clean_numeric(
                row.get("Lãi phạt trên lãi - Phải trả", "")
            ),
            "penalty_interest_on_interest_paid": clean_numeric(
                row.get("Lãi phạt trên lãi - Đã trả", "")
            ),
            "penalty_interest_on_interest_outstanding": clean_numeric(
                row.get("Lãi phạt trên lãi - Còn lại", "")
            ),
            "adhoc_interest_receivable": clean_numeric(
                row.get("Lãi Adhoc - Phải trả", "")
            ),
            "adhoc_interest_paid": clean_numeric(row.get("Lãi Adhoc - Đã trả", "")),
            "adhoc_interest_outstanding": clean_numeric(
                row.get("Lãi Adhoc - Còn lại", "")
            ),
            "lc_payment_loan": row.get("Cho vay thanh toán L/C", ""),
            "slh_mortgage_loan": row.get("Cầm cố vay SLH", ""),
            "xln_block": row.get("Khối XLN", ""),
            "limit_ref": row.get("Limit ref", ""),
            "old_core_contract_code": row.get("Mã hợp đồng core cũ", ""),
            "source": row.get("Nguồn", ""),
            "principal_collection_account": row.get("TK Thu gốc", ""),
            "interest_collection_account": row.get("TK Thu Lãi", ""),
            "loan_project_code": row.get("Mã dự án cho vay", ""),
            "loan_project_name": row.get("Tên dự án cho vay", ""),
            "interest_calculation_basis": row.get("Cơ sở tính lãi", ""),
            "interest_payment_date": interest_payment_date,
            "principal_payment_date": principal_payment_date,
            "insurance_purchase": row.get("Mua BHNT", ""),
            "interest_rate_change_date": interest_rate_change_date,
            "loan_program_code": row.get("Mã CT cho vay", ""),
            "loan_program_name": row.get("Tên CT cho vay", ""),
            "overdraft_program_code": row.get("Mã CT cho vay thấu chi", ""),
            "overdraft_program_name": row.get("Tên CT cho vay thấu chi", ""),
        }

        loans_data.append(loan)

    # Insert branches
    print(f"Inserting {len(branches)} branches...")
    for branch in branches.values():
        cursor.execute(
            """
            INSERT INTO branches 
            (branch_code, parent_branch_code, branch_name, region, area, department_code, department_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
            (
                branch["branch_code"],
                branch["parent_branch_code"],
                branch["branch_name"],
                branch["region"],
                branch["area"],
                branch["department_code"],
                branch["department_name"],
            ),
        )

    # Insert customers
    print(f"Inserting {len(customers)} customers...")
    for customer in customers.values():
        cursor.execute(
            """
            INSERT INTO customers 
            (customer_code, customer_type, priority_customer, multiple_kunn, legal_id)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                customer["customer_code"],
                customer["customer_type"],
                customer["priority_customer"],
                customer["multiple_kunn"],
                customer["legal_id"],
            ),
        )

    # Insert products
    print(f"Inserting {len(products)} products...")
    for product in products.values():
        cursor.execute(
            """
            INSERT INTO products 
            (sub_product_code, sub_product_name, product_type)
            VALUES (?, ?, ?)
        """,
            (
                product["sub_product_code"],
                product["sub_product_name"],
                product["product_type"],
            ),
        )

    # Insert sectors
    print(f"Inserting {len(sectors)} sectors...")
    for sector in sectors.values():
        cursor.execute(
            """
            INSERT INTO sectors 
            (sector_code, loan_purpose_code, loan_purpose_name, disbursement_purpose_code, disbursement_purpose_name)
            VALUES (?, ?, ?, ?, ?)
        """,
            (
                sector["sector_code"],
                sector["loan_purpose_code"],
                sector["loan_purpose_name"],
                sector["disbursement_purpose_code"],
                sector["disbursement_purpose_name"],
            ),
        )

    # Insert loans
    print(f"Inserting {len(loans_data)} loans...")
    for loan in loans_data:
        cursor.execute(
            """
            INSERT INTO loans 
            (stt, branch_code, customer_code, sector_code, contract_number, contract_status,
             contract_count, credit_contract_number, commitment_type, commitment_ccy,
             commitment_value, contract_on_profile, effective_date, expiry_date,
             original_disbursement_date, original_maturity_date,
             debt_group_ku, debt_group_name_ku, debt_group_bank, debt_group_cic,
             debt_group_customer, accounting_term, contract_term, term_category,
             sub_product_code, interest_rate, overdue_interest_rate, floating_interest_rate,
             floating_margin, currency, exchange_rate, principal_current, principal_overdue,
             principal_outstanding, principal_disbursed, interest_receivable, interest_paid,
             interest_outstanding, penalty_interest_principal_receivable,
             penalty_interest_principal_paid, penalty_interest_principal_outstanding,
             penalty_interest_on_interest_receivable, penalty_interest_on_interest_paid,
             penalty_interest_on_interest_outstanding, adhoc_interest_receivable,
             adhoc_interest_paid, adhoc_interest_outstanding, lc_payment_loan,
             slh_mortgage_loan, xln_block, limit_ref, old_core_contract_code, source,
             principal_collection_account, interest_collection_account, loan_project_code,
             loan_project_name, interest_calculation_basis, interest_payment_date,
             principal_payment_date, insurance_purchase, interest_rate_change_date,
             loan_program_code, loan_program_name, overdraft_program_code, overdraft_program_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?)
        """,
            (
                loan["stt"],
                loan["branch_code"],
                loan["customer_code"],
                loan["sector_code"],
                loan["contract_number"],
                loan["contract_status"],
                loan["contract_count"],
                loan["credit_contract_number"],
                loan["commitment_type"],
                loan["commitment_ccy"],
                loan["commitment_value"],
                loan["contract_on_profile"],
                loan["effective_date"],
                loan["expiry_date"],
                loan["original_disbursement_date"],
                loan["original_maturity_date"],
                loan["debt_group_ku"],
                loan["debt_group_name_ku"],
                loan["debt_group_bank"],
                loan["debt_group_cic"],
                loan["debt_group_customer"],
                loan["accounting_term"],
                loan["contract_term"],
                loan["term_category"],
                loan["sub_product_code"],
                loan["interest_rate"],
                loan["overdue_interest_rate"],
                loan["floating_interest_rate"],
                loan["floating_margin"],
                loan["currency"],
                loan["exchange_rate"],
                loan["principal_current"],
                loan["principal_overdue"],
                loan["principal_outstanding"],
                loan["principal_disbursed"],
                loan["interest_receivable"],
                loan["interest_paid"],
                loan["interest_outstanding"],
                loan["penalty_interest_principal_receivable"],
                loan["penalty_interest_principal_paid"],
                loan["penalty_interest_principal_outstanding"],
                loan["penalty_interest_on_interest_receivable"],
                loan["penalty_interest_on_interest_paid"],
                loan["penalty_interest_on_interest_outstanding"],
                loan["adhoc_interest_receivable"],
                loan["adhoc_interest_paid"],
                loan["adhoc_interest_outstanding"],
                loan["lc_payment_loan"],
                loan["slh_mortgage_loan"],
                loan["xln_block"],
                loan["limit_ref"],
                loan["old_core_contract_code"],
                loan["source"],
                loan["principal_collection_account"],
                loan["interest_collection_account"],
                loan["loan_project_code"],
                loan["loan_project_name"],
                loan["interest_calculation_basis"],
                loan["interest_payment_date"],
                loan["principal_payment_date"],
                loan["insurance_purchase"],
                loan["interest_rate_change_date"],
                loan["loan_program_code"],
                loan["loan_program_name"],
                loan["overdraft_program_code"],
                loan["overdraft_program_name"],
            ),
        )

    # Commit and close
    conn.commit()
    print("\nDatabase created successfully!")
    print("Tables created:")
    print(f"  - branches: {len(branches)} records")
    print(f"  - customers: {len(customers)} records")
    print(f"  - products: {len(products)} records")
    print(f"  - sectors: {len(sectors)} records")
    print(f"  - loans: {len(loans_data)} records")

    conn.close()


if __name__ == "__main__":
    csv_path = Path(__file__).parent / "public" / "database.csv"
    db_path = Path(__file__).parent / "public" / "database.db"

    print(f"Processing CSV file: {csv_path}")
    print(f"Creating database: {db_path}")
    print("-" * 60)

    process_csv_and_create_db(csv_path, db_path)

    print("-" * 60)
    print("Done!")
