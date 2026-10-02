# Executive Overview Dashboard - Visual Layout

## Page Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Executive Overview                                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Chỉ số tổng quan                                                     │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────┤
│ Dư nợ cuối kỳ│ Số khách hàng│  Số khế ước  │  Tỷ lệ NPL   │ Lãi suất│
│   (EOP)      │   đang vay   │              │  (nhóm 3-4)  │ bình    │
│              │              │              │    ⚠️ ALERT  │ quân    │
│  XXX.XX tỷ   │   X,XXX      │    X,XXX     │   X.XX%      │ X.XX%   │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Heatmap khu vực - Phân bố dư nợ & NPL theo chi nhánh                │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────┤
│   🏢    │   🏢    │   🏢    │   🏢    │   🏢    │   🏢    │  🏢    │
│ Branch1 │ Branch2 │ Branch3 │ Branch4 │ Branch5 │ Branch6 │Branch7 │
│ NPL:X.X%│ NPL:X.X%│ NPL:X.X%│ NPL:X.X%│ NPL:X.X%│ NPL:X.X%│NPL:X.X%│
│ XXX.XX tỷ│ XX.XX tỷ│ XX.XX tỷ│ XX.XX tỷ│ XX.XX tỷ│ XX.XX tỷ│XX.XX tỷ│
│ [Green] │[Orange] │  [Red]  │ [Green] │[Orange] │ [Green] │[Green] │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Cơ cấu nhóm nợ toàn hệ thống                                        │
│                                                                      │
│                          ╱─────╲                                    │
│                     ╱───         ───╲                               │
│                 ╱───                   ───╲                         │
│             ╱───   Nhóm 1 (Chuẩn)          ───╲                    │
│          ╱──                                     ──╲                │
│        ╱─     Nhóm 2                                ─╲             │
│       │                                                 │           │
│       │  Nhóm 4        PIE CHART           Nhóm 3      │           │
│        ╲─                                              ─╱           │
│          ╲──                                         ──╱            │
│             ╲───                                 ───╱               │
│                 ╲───                         ───╱                   │
│                     ╲───                 ───╱                       │
│                          ╲─────────────╱                            │
│                                                                      │
│  ■ Nhóm 1 (Chuẩn)  ■ Nhóm 2 (Cần chú ý)                           │
│  ■ Nhóm 3 (Dưới chuẩn)  ■ Nhóm 4 (Nghi ngờ)                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────────────┐
│ Top 5 Chi nhánh                  │ Top 5 Chi nhánh                  │
│ NPL Rủi ro cao nhất              │ Dư nợ cao nhất                   │
├──────────────────────────────────┼──────────────────────────────────┤
│ ⚠️  Branch Code 1                │ 1️⃣  Branch Name 1                │
│     NPL cao nhất trong hệ thống  │     XXX.XX tỷ                    │
│     [NPL: XX.XX%] XX.XX tỷ       │     [NPL: X.XX%]                 │
│                                  │                                  │
│ ⚠️  Branch Code 2                │ 2️⃣  Branch Name 2                │
│     NPL cao nhất trong hệ thống  │     XXX.XX tỷ                    │
│     [NPL: XX.XX%] XX.XX tỷ       │     [NPL: X.XX%]                 │
│                                  │                                  │
│ ⚠️  Branch Code 3                │ 3️⃣  Branch Name 3                │
│     [NPL: XX.XX%] XX.XX tỷ       │     XXX.XX tỷ                    │
│                                  │     [NPL: X.XX%]                 │
│ ⚠️  Branch Code 4                │ 4️⃣  Branch Name 4                │
│     [NPL: XX.XX%] XX.XX tỷ       │     XXX.XX tỷ                    │
│                                  │     [NPL: X.XX%]                 │
│ ⚠️  Branch Code 5                │ 5️⃣  Branch Name 5                │
│     [NPL: XX.XX%] XX.XX tỷ       │     XXX.XX tỷ                    │
│                                  │     [NPL: X.XX%]                 │
└──────────────────────────────────┴──────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────────────────┐
│ Phân loại khách hàng             │ Tỷ lệ VND và Ngoại tệ            │
├──────────────────────────────────┼──────────────────────────────────┤
│                                  │                                  │
│         ╱────────╲              │          ╱─────╲                 │
│     ╱──            ──╲          │      ╱──         ──╲             │
│   ╱─  KH cao cấp      ─╲        │    ╱─               ─╲           │
│  │                       │       │   │                   │          │
│  │  KH ưu tiên     KH   │       │   │                   │          │
│  │           thông       │       │   │   VND     Ngoại   │          │
│  │           thường      │       │   │            tệ     │          │
│   ╲─                    ─╱       │    ╲─               ─╱           │
│     ╲──  KH đối tác  ──╱         │      ╲──         ──╱             │
│         ╲────────╱               │          ╲─────╱                 │
│                                  │                                  │
│ ■ KH cao cấp                     │ ■ VND                            │
│ ■ KH ưu tiên                     │ ■ Ngoại tệ                       │
│ ■ KH gắn mã theo dõi hạng        │                                  │
│ ■ KH thông thường                │                                  │
│ ■ KH đối tác                     │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

## Color Coding Legend

### NPL Ratio Color Coding:
- 🟢 **Green** (Good): NPL < 2%
- 🟠 **Orange** (Warning): 2% ≤ NPL < 3%
- 🔴 **Red** (Danger): NPL ≥ 3%

### Debt Group Colors:
- 🟢 **Green**: Nhóm 1 (Chuẩn)
- 🔵 **Teal**: Nhóm 2 (Cần chú ý)
- 🟠 **Orange**: Nhóm 3 (Dưới chuẩn)
- 🔴 **Red**: Nhóm 4 (Nghi ngờ)

### Customer Type Colors:
- 🟣 **Purple**: Khách hàng cao cấp
- 🔵 **Blue**: Khách hàng ưu tiên
- 🔷 **Teal**: Khách hàng gắn mã theo dõi hạng
- 🟠 **Orange**: Khách hàng đối tác
- 🟢 **Green**: Khách hàng thông thường

## Interactive Features

### Hover Effects:
- All cards have shadow and scale animation on hover
- Tooltips show detailed information on charts
- Branch heatmap cards are clickable (ready for drill-down)

### Visual Alerts:
- Red ring border on KPI cards when thresholds exceeded
- Alert triangle icon for NPL > 3%
- Color-coded badges throughout the dashboard

### Responsive Design:
- **Mobile** (< 640px): Single column layout
- **Tablet** (640px - 1024px): 2 columns
- **Desktop** (1024px+): 3-5 columns depending on section
- All charts automatically resize to container

## Typography & Spacing:
- **Headers**: Bold, 3xl for page title, xl for section titles
- **KPI Values**: 2xl, bold, with formatted numbers
- **Cards**: Rounded corners (2xl), consistent padding (4-6)
- **Spacing**: 8 units between sections, 3-6 units between cards
