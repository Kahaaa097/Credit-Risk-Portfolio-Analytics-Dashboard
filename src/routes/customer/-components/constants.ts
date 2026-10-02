// Colors for charts
export const COLORS = [
  "#F59E0B", // amber
  "#38BDF8", // cyan
  "#10B981", // green
  "#8B5CF6", // violet
  "#06B6D4", // teal
  "#FBBF24", // yellow
];

// Risk level colors
export const RISK_COLORS = [
  "#10B981", // green - level 1 (very low)
  "#22C55E", // light green - level 2 (low)
  "#F59E0B", // orange - level 3 (medium)
  "#F97316", // dark orange - level 4 (high)
  "#EF4444", // red - level 5 (very high)
];

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
