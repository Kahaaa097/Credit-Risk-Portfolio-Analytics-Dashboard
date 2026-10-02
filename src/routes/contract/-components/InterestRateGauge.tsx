import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, TrendingUp, AlertCircle } from "lucide-react";
import { fmt } from "./constants";
import type { ContractInfo } from "../-hook";

interface InterestRateGaugeProps {
  contract?: ContractInfo | null;
}

export function InterestRateGauge({ contract }: InterestRateGaugeProps) {
  if (!contract) {
    return (
      <Card className="rounded-2xl border shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Percent className="w-5 h-5" />
            So sánh lãi suất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const interestRate = contract.interestRate * 100; // Convert to percentage
  const overdueRate = contract.overdueInterestRate * 100;
  const margin = contract.floatingMargin * 100;

  // Calculate max value for gauge scale
  const maxRate = Math.max(interestRate, overdueRate, margin) * 1.2;

  // Calculate percentages for bar widths
  const interestRatePercent = (interestRate / maxRate) * 100;
  const overdueRatePercent = (overdueRate / maxRate) * 100;
  const marginPercent = (margin / maxRate) * 100;

  const rates = [
    {
      icon: Percent,
      label: "Lãi suất hiện hành",
      value: interestRate,
      percent: interestRatePercent,
      color: "bg-green-500",
      textColor: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: AlertCircle,
      label: "Lãi suất quá hạn",
      value: overdueRate,
      percent: overdueRatePercent,
      color: "bg-red-500",
      textColor: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: TrendingUp,
      label: "Biên độ LS thả nổi",
      value: margin,
      percent: marginPercent,
      color: "bg-orange-500",
      textColor: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  // Calculate comparison differences
  const overdueDiff = overdueRate - interestRate;
  const marginDiff = margin - interestRate;

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <Percent className="w-5 h-5" />
          So sánh lãi suất
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Rate Bars */}
          {rates.map((rate, idx) => (
            <div key={idx} className={`rounded-lg p-4 ${rate.bgColor}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2 items-center">
                  <rate.icon className={`h-4 w-4 ${rate.textColor}`} />
                  <span className="text-sm font-medium">{rate.label}</span>
                </div>
                <span className={`text-lg font-bold ${rate.textColor}`}>
                  {fmt.rate(rate.value / 100)}
                </span>
              </div>
              <div className="overflow-hidden w-full h-3 rounded-full bg-secondary">
                <div
                  className={`h-full ${rate.color} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${rate.percent}%` }}
                />
              </div>
            </div>
          ))}

          {/* Comparison Summary */}
          <div className="pt-4 space-y-3 border-t border-border">
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
              Chênh lệch so với lãi suất hiện hành
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border bg-card/50 border-border">
                <p className="mb-1 text-xs text-muted-foreground">
                  Chênh lệch quá hạn
                </p>
                <p
                  className={`text-sm font-bold ${
                    overdueDiff > 0
                      ? "text-red-500"
                      : overdueDiff < 0
                        ? "text-green-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {overdueDiff > 0 ? "+" : ""}
                  {fmt.rate(overdueDiff / 100)}
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-card/50 border-border">
                <p className="mb-1 text-xs text-muted-foreground">
                  Chênh lệch biên độ
                </p>
                <p
                  className={`text-sm font-bold ${
                    marginDiff > 0
                      ? "text-orange-500"
                      : marginDiff < 0
                        ? "text-green-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {marginDiff > 0 ? "+" : ""}
                  {fmt.rate(marginDiff / 100)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
