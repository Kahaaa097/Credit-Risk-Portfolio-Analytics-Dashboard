Data: File trong gmail, NHƯNG ĐỔI SANG CSV CHO PYTHON DỄ ĐỌC.
Mục tiêu: Giúp lãnh đạo ngân hàng nắm được toàn cảnh dư nợ, cơ cấu cho vay, rủi ro, và hiệu quả lãi suất - từ tổng quan đến chi nhánh, sản phẩm, khách hàng
- Theo dõi tổng dư nợ, tăng trưởng, chất lượng tín dụng, hiệu quả lãi suất
- So sánh giữa chi nhánh, sản phẩm, loại khách hàng, loại tiền.
- Cảnh báo nợ xấu, khế ước rủi ro, chi nhánh vượt ngưỡng NPL.
- Cung cấp khả năng drill-down từ tổng quan → chi nhánh → sản phẩm → khách hàng/khế ước.
Cấu trúc Dashboard + Chức năng cần có:
1. Trang tổng quan (Executive Overview)
Nắm toàn cảnh hoạt động tín dụng của toàn hệ thống
Chức năng cần có:
- KPI Cards:
Tổng dư nợ cuối kỳ (EOP):  
Cách tính 
Nguồn trong excel: Gốc vay còn lại (nợ trong hạn + nợ quá hạn)
Ghi chú: Tổng toàn bộ EOP (sum theo chi nhánh hoặc toàn hệ thống)
Số khách hàng đang vay
Cách tính
Nguồn: Mã khách hàng (F)
Ghi chú: COUNT DISTINCT theo Mã chi nhánh
Số khế ước hoạt động
Cách tính:
Nguồn: Số khế ước (distinct)
Ghi chú: COUNT DISTINCT theo chi nhánh
Tỷ lệ NPL (nhóm 3–4) 
Cách tính: 
Nguồn: Gốc vay còn lại (nợ trong hạn + nợ quá hạn) và Nhóm nợ NH ABCDE
Cách lấy:
Lọc các khoản có Nhóm nợ = 3 hoặc 4
Tỷ lệ NPL (3–4) = Tổng dư nợ nhóm 3–4 / Tổng dư nợ toàn bộ
Lãi suất bình quân, Biên độ bình quân
Cách tính:
Nguồn: Cột lãi suất
Cách lấy: AVERAGE theo Mã sản phẩm
Ghi chú: Lấy trung bình
Tỷ trọng dư nợ ngoại tệ
Cách tính:
Cách tính:


Nguồn: Cột Lãi Suất, Biên độ LS thả nổi, và Gốc vay còn lại (nợ trong hạn + nợ quá hạn)
Cách lấy:
Lãi suất bình quân: =SUMPRODUCT(Lãi Suất,Gốc vay còn lại) / SUM(Gốc vay còn lại)
Biên độ bình quân: =SUMPRODUCT(Biên độ LS thả nổi,Gốc vay còn lại) / SUM(Gốc vay còn lại)
- Heatmap khu vực: Phân bố dư nợ & NPL giữa các chi nhánh cha (click để chọn) 
Nguồn: Vùng, Mã chi nhánh, Gốc vay còn lại, Nhóm nợ NH ABCDE
Cách lấy:
Tổng dư nợ (SUM Gốc vay còn lại) theo từng Vùng hoặc Chi nhánh cha
Tính tỷ lệ NPL (Nhóm nợ 3–5) cho từng vùng
Ghi chú:
Có thể tạo heatmap động (click drill-down) trong Power BI hoặc Excel Pivot Chart.
Hiển thị màu theo tỷ lệ NPL (xanh → đỏ).
- Cơ cấu nhóm nợ: Stacked column thể hiện nhóm 1–4 
Nguồn: Nhóm nợ NH ABCDE, Gốc vay còn lại
Cách lấy:
Tổng Gốc vay còn lại theo từng nhóm nợ (1–4)
Biểu đồ cột chồng (stacked column) thể hiện tỷ trọng.
- Top Alerts: 5 chi nhánh có NPL rủi ro cao và Top 5 chi nhánh có dư nợ cao nhất
Nguồn: Mã chi nhánh, Gốc vay còn lại (nợ trong hạn + nợ quá hạn), Nhóm nợ NH ABCDE
Công thức:
- Tính Tổng dư nợ mỗi chi nhánh:
 =SUMIFS([Gốc vay còn lại], [Mã chi nhánh], <mã chi nhánh>)
Tính Tổng dư nợ nhóm 3–5 mỗi chi nhánh (nợ xấu):
 =SUMIFS([Gốc vay còn lại], [Mã chi nhánh], <mã chi nhánh>, [Nhóm nợ NH ABCDE], ">=3")
Tính Tỷ lệ NPL (%):
 = [Tổng nợ nhóm 3–5] / [Tổng dư nợ toàn chi nhánh]
Sắp xếp theo NPL% giảm dần → lấy Top 5 chi nhánh có tỷ lệ cao nhất.
Ghi chú:
- Phần “rủi ro cao nhất” = chi nhánh có NPL ratio lớn nhất.
- Chưa thể tính “tăng mạnh” do thiếu dữ liệu kỳ trước.
- Có thể hiển thị bằng biểu đồ cột ngang hoặc bảng xếp hạng (kèm tô màu đỏ cảnh báo nếu NPL > 3%).
- Pie chart phân loại khách hàng tổng quan: cột Khách hàng ưu tiên 
Khách hàng cao cấp: KH cao cấp - Private
Khách hàng ưu tiên: KH ưu tiên - Gold, KH ưu tiên - Platinum
Khách hàng gắn mã theo dõi hạn: KH gắn mã theo dõi hạng - Diamond (rồi đến Gold - Platinum - Private)
Khách hàng thông thường: Khách hàng thông thường, Khách hàng thông thường ngoài PVN
Khách hàng đối tác: Partnership 1, Partnership 2
- Pie chart tỉ lệ VND và Ngoại tệ: cột Loại tiền

2. Trang Chi nhánh (Branch Overview)
Mục tiêu: Cho phép phân tích chi tiết hoạt động từng chi nhánh cha
Chức năng cần có
- Bộ lọc: Chi nhánh cha, kỳ báo cáo (tháng/quý), sản phẩm, mục đích vay, loại tiền, nhóm nợ, trạng thái khế ước, loại KH.
- Cards tổng hợp: Dư nợ, NPL%, số KH, số khế ước, giải ngân YTD, lãi suất bình quân.
- Cơ cấu nhóm nợ của từng chi nhánh: Clustered bar (1–4).
- Hiệu quả lãi: Bullet chart so sánh lãi suất thực tế với chuẩn. 
Cột cần: Lãi Suất, Biên độ LS thả nổi, Gốc vay còn lại
Ghi chú: Tính lãi suất bình quân và so với chuẩn (VD: 10%). Có thể hiển thị bằng bullet chart.
- Lịch đáo hạn: Calendar hoặc heatmap 1–3–6–12 tháng tới. 
Cột cần: Ngày hết hạn, Gốc vay còn lại, Nhóm nợ
Ghi chú: Có thể lập lịch đáo hạn cho 1–3–6–12 tháng tới (lọc theo ngày hết hạn).
- Bảng chi tiết khế ước của từng chi nhánh: cuộn được, tô màu đỏ nhóm 3–4. 
Cột cần: Mã chi nhánh, Số khế ước, Nhóm nợ, Gốc vay còn lại, Ngày hết hạn
Ghi chú: Hiển thị danh sách khế ước có thể cuộn; tô đỏ nhóm 3–4 (nợ xấu).
- Pie chart phân loại khách hàng theo từng chi nhánh: cột Khách hàng ưu tiên 
Khách hàng cao cấp: KH cao cấp - Private
Khách hàng ưu tiên: KH ưu tiên - Gold, KH ưu tiên - Platinum
Khách hàng gắn mã theo dõi hạn: KH gắn mã theo dõi hạng - Diamond (rồi đến Gold - Platinum - Private)
Khách hàng thông thường: Khách hàng thông thường, Khách hàng thông thường ngoài PVN
Khách hàng đối tác: Partnership 1, Partnership 2

3. Trang Rủi ro & Nợ xấu (Risk / NPL)
Mục tiêu: Theo dõi chất lượng danh mục tín dụng và cảnh báo rủi ro
Chức năng cần có:
- KPI rủi ro:
- NPL ratio
Cách tính:
Nguồn từ excel: Gốc vay còn lại (nợ trong hạn + nợ quá hạn), Nhóm nợ NH ABCDE
Ghi chú: Nợ xấu = nhóm nợ 3, 4, 5.
→ Công thức: =SUMIFS([Gốc vay còn lại], [Nhóm nợ NH ABCDE], {3,4,5}) / SUM([Gốc vay còn lại])
      - NPL stock
Cách tính:
Nguồn từ excel: Gốc vay còn lại, Nhóm nợ NH ABCDE
Ghi chú: Tổng số tiền thuộc nhóm nợ 3–5.
Công thức: =SUMIFS([Gốc vay còn lại], [Nhóm nợ NH ABCDE], {3,4,5})

- Delinquency buckets: PAR30/60/90 (biểu đồ cột). 
Cột cần: Ngày hết hạn, Gốc vay còn lại, Ngày báo cáo
Ghi chú: Tính ngày quá hạn = ngày báo cáo – ngày hết hạn.
- Top exposure: Top 20 khách hàng hoặc khế ước nhóm 3–4 có dư nợ lớn. 
Cột cần: Mã KH, Số khế ước, Nhóm nợ, Gốc vay còn lại
Ghi chú: Lọc nhóm nợ 3–4, sắp xếp giảm dần theo dư nợ.
- Watchlist: Hợp đồng sắp đến hạn, quá hạn, hoặc áp LS phạt. 
Cột cần: Ngày hết hạn, Lãi phạt, Trạng thái khế ước
Ghi chú: Lọc hợp đồng hết hạn trong 30 ngày hoặc có lãi phạt.
- Biểu đồ đề xuất: Gauge (NPL% vs mục tiêu <3%), Bar (NPL theo chi nhánh), Scatter (Dư nợ – NPL%, kích cỡ = số KH). 
Cột cần: Mã chi nhánh, Gốc vay còn lại, Nhóm nợ, Mã KH
Ghi chú: Gauge: NPL% vs <3%; Bar: NPL theo CN; Scatter: Dư nợ–NPL%–số KH.
4. Trang Sản phẩm & Mục đích vay (Product / Purpose Mix)
Mục tiêu: Đánh giá danh mục tín dụng theo sản phẩm và mục đích vay.
Chức năng cần có:
Cơ cấu dư nợ: Treemap hoặc stacked column theo sản phẩm, mục đích vay. 
Cột cần dùng: Gốc vay còn lại, Tên sản phẩm, Tên mục đích vay
Hiệu quả sản phẩm: Bar chart lãi suất bình quân & NPL% 
Cột cần dùng: Lãi Suất, Gốc vay còn lại, Nhóm nợ NH ABCDE, Tên sản phẩm
Phân tích tương quan: Scatter chart lãi suất – rủi ro (NPL%). 
Cột cần dùng: Lãi Suất, Nhóm nợ, Tên sản phẩm
Benchmark giữa chi nhánh: Radar chart so sánh hiệu suất sản phẩm giữa các chi nhánh cha. 
Cột cần dùng: Mã chi nhánh, Lãi suất, NPL%, Gốc vay còn lại
Top tăng trưởng / rủi ro: Bảng 5 sản phẩm tăng dư nợ mạnh, 5 sản phẩm có NPL cao
5. Trang Khách hàng (Customer View)
Mục tiêu: Theo dõi hành vi và rủi ro của khách hàng vay vốn.
Chức năng cần có:
- Tóm tắt hồ sơ KH: ID, loại khách hàng, tổng dư nợ, nhóm nợ cao nhất, số khế ước hoạt động.
- Danh mục khế ước: Trạng thái, sản phẩm, mục đích, lãi suất, đáo hạn. 
- 
- Lịch sử nhóm nợ: Line chart nhóm nợ theo thời gian.
- Phân loại KH: Donut chart Ưu tiên vs Thông thường. 
+ Cột cần: Khách hàng ưu tiên (có 2 giá trị chính: “Khách hàng ưu tiên”, “Khách hàng thông thường”)
- Chỉ báo rủi ro: Heat indicator (1–5, xanh→đỏ).
      + Cột cần: Nhóm nợ NH ABCDE (1→5). Có thể quy đổi thang màu: 1 = xanh, 5 = đỏ.
6. Trang Hợp đồng / Khế ước (Contract Lens)
Mục tiêu: Cho phép tra cứu và xem chi tiết từng hợp đồng tín dụng.
Chức năng cần có:
- Tìm kiếm: theo mã khế ước, số hợp đồng, hoặc tên KH. 
Cột liên quan: Số khế ước (distinct), Số hợp đồng tín dụng, Tên KH
- Timeline: từ ngày hiệu lực → giải ngân → hết hạn. 
Cột liên quan: Ngày hiệu lực, Ngày giải ngân ban đầu, Ngày hết hạn
- Chi tiết lãi suất: hiện hành, quá hạn, thả nổi, biên độ; lịch sử điều chỉnh.
- Điều khoản chính: kỳ hạn kế toán vs hợp đồng, loại tiền, mục đích, sản phẩm. 
Cột liên quan: Kỳ hạn kế toán, Kỳ hạn hợp đồng, Loại tiền, Mã mục đích vay, Tên mục đích vay, Mã sản phẩm, Tên sản phẩm
- Bảng chi tiết: có biểu tượng ✔ (đang hoạt động) / ⚠ (quá hạn).
- Mini gauge: So sánh lãi suất hiện hành – quá hạn – biên độ. 
Cột liên quan: Dùng Lãi Suất, LS quá hạn, Biên độ LS thả nổi để vẽ thanh gauge hoặc icon chênh lệch

