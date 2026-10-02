// Colors for charts
export const COLORS = [
  "#F59E0B", // amber
  "#38BDF8", // cyan
  "#10B981", // green
  "#8B5CF6", // violet
  "#06B6D4", // teal
  "#FBBF24", // yellow
];

// Interest rate gauge colors
export const INTEREST_RATE_COLORS = {
  current: "#10B981", // green - current rate
  overdue: "#EF4444", // red - overdue rate
  margin: "#F59E0B", // orange - margin
};

export const fmt = {
  money: (v?: number) =>
    (v ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 2 }),
  pct: (v?: number) => `${((v ?? 0) * 100).toFixed(2)}%`,
  rate: (v?: number) => `${((v ?? 0) * 100).toFixed(2)}%`,
  date: (d?: string) => {
    if (!d) return "N/A";
    try {
      const date = new Date(d);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return d;
    }
  },
};
