**Data: File trong gmail, NHƯNG ĐỔI SANG CSV CHO PYTHON DỄ ĐỌC.**  
**Mục tiêu:** Giúp lãnh đạo ngân hàng nắm được toàn cảnh dư nợ, cơ cấu cho vay, rủi ro, và hiệu quả lãi suất \- từ tổng quan đến chi nhánh, sản phẩm, khách hàng  
\- Theo dõi tổng dư nợ, tăng trưởng, chất lượng tín dụng, hiệu quả lãi suất  
\- So sánh giữa chi nhánh, sản phẩm, loại khách hàng, loại tiền.  
\- Cảnh báo nợ xấu, khế ước rủi ro, chi nhánh vượt ngưỡng NPL.  
\- Cung cấp khả năng drill-down từ tổng quan → chi nhánh → sản phẩm → khách hàng/khế ước.  
**Cấu trúc Dashboard \+ Chức năng cần có:**  
**1\. Trang tổng quan (Executive Overview)**  
Nắm toàn cảnh hoạt động tín dụng của toàn hệ thống  
Chức năng cần có:  
**\- KPI Cards:**

- Tổng dư nợ cuối kỳ (EOP)  
- Dư nợ bình quân  
- Tăng/giảm so tháng trước (MoM) và từ đầu năm (YTD)  
- Số khách hàng đang vay  
- Số khế ước hoạt động  
- Tỷ lệ NPL (nhóm 3–4)  
- PAR30/60/90  
- Lãi suất bình quân, Biên độ bình quân  
- Tỷ trọng dư nợ ngoại tệ

**\- Heatmap khu vực:** Phân bố dư nợ & NPL giữa các chi nhánh cha (click để chọn)  
**\- Biểu đồ xu hướng:** Dư nợ & NPL qua thời gian (cột – đường)  
**\- Cơ cấu nhóm nợ:** Stacked column thể hiện nhóm 1–4, tô đỏ nhóm 3–4  
**\- Top Alerts:** 3–5 chi nhánh có NPL tăng mạnh nhất hoặc rủi ro cao  
**2\. Trang Chi nhánh (Branch Overview)**  
Mục tiêu: Cho phép phân tích chi tiết hoạt động từng chi nhánh cha  
Chức năng cần có  
**\- Bộ lọc:** Chi nhánh cha, kỳ báo cáo (tháng/quý), sản phẩm, mục đích vay, loại tiền, nhóm nợ, trạng thái khế ước, loại KH.  
**\- Cards tổng hợp:** Dư nợ, NPL%, số KH, số khế ước, giải ngân YTD, lãi suất bình quân.  
**\- Cơ cấu khách hàng:** Pie chart (Ưu tiên vs Thông thường).  
**\- Cơ cấu nhóm nợ:** Clustered bar (1–4).  
**\- Hiệu quả lãi:** Bullet chart so sánh lãi suất thực tế với chuẩn.  
**\- Giải ngân theo thời gian:** Line chart (MoM).  
**\- Lịch đáo hạn:** Calendar hoặc heatmap 1–3–6–12 tháng tới.  
**\- Bảng chi tiết khế ước:** cuộn được, tô màu đỏ nhóm 3–4.  
**3\. Trang Rủi ro & Nợ xấu (Risk / NPL)**  
Mục tiêu: Theo dõi chất lượng danh mục tín dụng và cảnh báo rủi ro  
Chức năng cần có:  
\- **KPI rủi ro:**  
\- NPL ratio, NPL stock  
\- NPL formation (mới phát sinh)  
\- Cure rate  
\- Write-off (nếu có)  
\- **Cơ cấu nhóm nợ theo thời gian:** Stacked area 1→4.  
**\- Migration matrix:** Bảng chuyển dịch nhóm nợ (1→2→3→4).  
**\- Delinquency buckets:** PAR30/60/90 (biểu đồ cột).  
**\- Top exposure:** Top 20 khách hàng hoặc khế ước nhóm 3–4 có dư nợ lớn.  
**\- Watchlist:** Hợp đồng sắp đến hạn, quá hạn, hoặc áp LS phạt.  
**\- Biểu đồ đề xuất:** Gauge (NPL% vs mục tiêu \<3%), Bar (NPL theo chi nhánh), Scatter (Dư nợ – NPL%, kích cỡ \= số KH).  
**4\. Trang Sản phẩm & Mục đích vay (Product / Purpose Mix)**

**Mục tiêu:** Đánh giá danh mục tín dụng theo sản phẩm và mục đích vay.

Chức năng cần có:

- **Cơ cấu dư nợ:** Treemap hoặc stacked column theo sản phẩm, mục đích vay.  
- **Hiệu quả sản phẩm:** Bar chart lãi suất bình quân & NPL%.  
- **Phân tích tương quan:** Scatter chart lãi suất – rủi ro (NPL%).  
- **Benchmark giữa chi nhánh:** Radar chart so sánh hiệu suất sản phẩm giữa các chi nhánh cha.  
- **Top tăng trưởng / rủi ro:** Bảng 5 sản phẩm tăng dư nợ mạnh, 5 sản phẩm có NPL cao

**5\. Trang Khách hàng (Customer View)**  
**Mục tiêu:** Theo dõi hành vi và rủi ro của khách hàng vay vốn.

**Chức năng cần có:**

**\- Tóm tắt hồ sơ KH:** ID, loạphân i (Ưu tiên/Thông thường), tổng dư nợ, nhóm nợ cao nhất, số khế ước hoạt động.  
\- **Danh mục khế ước:** Trạng thái, sản phẩm, mục đích, lãi suất, đáo hạn.  
\- **Lịch sử nhóm nợ:** Line chart nhóm nợ theo thời gian.  
\- **Phân loại KH:** Donut chart Ưu tiên vs Thông thường.  
\- **Chỉ báo rủi ro:** Heat indicator (1–5, xanh→đỏ).

**6\. Trang Hợp đồng / Khế ước (Contract Lens)**

**Mục tiêu:** Cho phép tra cứu và xem chi tiết từng hợp đồng tín dụng.

**Chức năng cần có:**

**\- Tìm kiếm:** theo mã khế ước, số hợp đồng, hoặc tên KH.

**\- Timeline:** từ ngày hiệu lực → giải ngân → hết hạn.

**\- Chi tiết lãi suất:** hiện hành, quá hạn, thả nổi, biên độ; lịch sử điều chỉnh.

**\- Điều khoản chính:** kỳ hạn kế toán vs hợp đồng, loại tiền, mục đích, sản phẩm.

**\- Bảng chi tiết:** có biểu tượng ✔ (đang hoạt động) / ⚠ (quá hạn).

**\- Mini gauge:** So sánh lãi suất hiện hành – quá hạn – biên độ.

