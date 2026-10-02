export const fmt = {
  money: (v?: number) =>
    (v ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }),
  pct: (v?: number) => `${((v ?? 0) * 100).toFixed(2)}%`,
  rate: (v?: number) => `${((v ?? 0) * 100).toFixed(2)}%`,
};
