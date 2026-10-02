export interface RiskKpiData {
  nplRatio: number | null;
  nplStock: number | null;
  formationRate: number | null;
  cureRate: number | null;
  writeOffAmount: number | null;
}

export interface DebtTrendDataPoint {
  period: string; // "2024-01", "2024-02", ...
  group1: number;
  group2: number;
  group3: number;
  group4: number;
}

export interface MigrationDataPoint {
  fromGroup: string;
  toGroup1: number;
  toGroup2: number;
  toGroup3: number;
  toGroup4: number;
  toGroup5: number;
}

export interface TopExposureItem {
  id: string; // ID khách hàng hoặc hợp đồng
  name: string; // Tên khách hàng hoặc mô tả hợp đồng
  exposure: number; // Giá trị dư nợ/rủi ro
  group: number; // Nhóm nợ hiện tại
}

export interface WatchlistItem {
  id: string; // ID khách hàng/hợp đồng
  name: string; // Tên khách hàng/hợp đồng
  reason: string; // Lý do đưa vào watchlist
  assignedOfficer?: string; // Cán bộ phụ trách (tùy chọn)
  addedDate?: string; // Ngày thêm (tùy chọn)
}