import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert, TrendingUp } from "lucide-react";
import { fmt } from "./constants";
import type { CustomerRiskIndicator } from "../-hook";

interface RiskIndicatorCardProps {
  risk?: CustomerRiskIndicator | null;
}

export function RiskIndicatorCard({ risk }: RiskIndicatorCardProps) {
  if (!risk) {
    return (
      <Card className="rounded-2xl border shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <ShieldAlert className="w-5 h-5" />
            Chỉ báo rủi ro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Đang tải dữ liệu rủi ro...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <ShieldAlert className="w-5 h-5" />
          Chỉ báo rủi ro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Risk Level Indicator */}
          <div className="flex flex-col items-center space-y-4">
            <div className="text-sm text-muted-foreground">
              Mức độ rủi ro tổng thể
            </div>
            <div className="relative">
              <div
                className="flex justify-center items-center w-32 h-32 rounded-full border-8 border-white shadow-2xl"
                style={{ backgroundColor: risk.riskColor }}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    {risk.riskLevel}
                  </div>
                  <div className="text-xs text-white/90">/ 5</div>
                </div>
              </div>
            </div>
            <Badge
              variant={risk.riskLevel >= 4 ? "destructive" : "default"}
              className="py-1 px-4 text-lg"
            >
              {risk.riskLabel}
            </Badge>
          </div>

          {/* Risk Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card/50 border-border">
              <div className="flex gap-2 items-center mb-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Tỷ lệ NPL</span>
              </div>
              <div className="text-2xl font-bold">{fmt.pct(risk.nplRatio)}</div>
            </div>

            <div className="p-4 rounded-lg border bg-card/50 border-border">
              <div className="flex gap-2 items-center mb-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                <span>Nhóm nợ cao nhất</span>
              </div>
              <div className="text-2xl font-bold">Nhóm {risk.maxDebtGroup}</div>
            </div>

            <div className="p-4 rounded-lg border bg-card/50 border-border">
              <div className="flex gap-2 items-center mb-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                <span>Khế ước quá hạn</span>
              </div>
              <div className="text-2xl font-bold">{risk.overdueContracts}</div>
            </div>

            <div className="p-4 rounded-lg border bg-card/50 border-border">
              <div className="flex gap-2 items-center mb-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Tổng số khế ước</span>
              </div>
              <div className="text-2xl font-bold">{risk.totalContracts}</div>
            </div>
          </div>

          {/* Risk Level Scale */}
          <div className="pt-4 border-t border-border">
            <div className="mb-3 text-sm text-center text-muted-foreground">
              Thang đo rủi ro
            </div>
            <div className="flex gap-2 justify-between">
              {[1, 2, 3, 4].map((level) => (
                <div key={level} className="flex-1 text-center">
                  <div
                    className={`h-12 rounded-lg border-2 transition-all ${
                      risk.riskLevel >= level
                        ? "scale-110 border-white shadow-lg"
                        : "border-transparent opacity-60"
                    }`}
                    style={{
                      backgroundColor: [
                        "#22C55E",
                        "#F59E0B",
                        "#F97316",
                        "#EF4444",
                      ][level - 1],
                    }}
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    {level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
