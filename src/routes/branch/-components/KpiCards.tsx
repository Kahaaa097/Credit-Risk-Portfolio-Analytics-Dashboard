import { Card, CardContent } from "@/components/ui/card";
import { fmt } from "./constants";
import type { BranchKpi } from "../-hook";

interface KpiCardsProps {
  kpi?: BranchKpi;
}

export function KpiCards({ kpi }: KpiCardsProps) {
  const items = [
    { label: "Dư nợ cuối kỳ", value: fmt.money(kpi?.eopBalance), unit: "tỷ" },
    { label: "Tỷ lệ nợ xấu", value: fmt.pct(kpi?.nplRatio), unit: "" },
    {
      label: "Số khách hàng",
      value: (kpi?.nCustomers ?? 0).toLocaleString("vi-VN"),
      unit: "",
    },
    {
      label: "Số khế ước",
      value: (kpi?.nContracts ?? 0).toLocaleString("vi-VN"),
      unit: "",
    },
    {
      label: "Giải ngân YTD",
      value: fmt.money(kpi?.disbursementYtd),
      unit: "tỷ",
    },
    {
      label: "Lãi suất bình quân",
      value: fmt.rate((kpi?.avgInterestRate ?? 0) / 100),
      unit: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-4 md:grid-cols-6">
      {items.map((it, idx) => (
        <Card
          key={idx}
          className="rounded-2xl border shadow-sm border-border bg-card"
        >
          <CardContent className="p-4 text-center">
            <div className="mb-2 text-sm text-muted-foreground">{it.label}</div>
            <div className="text-2xl font-bold text-foreground">
              {it.value}
              {it.unit && (
                <span className="ml-1 text-base text-muted-foreground">
                  {it.unit}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
