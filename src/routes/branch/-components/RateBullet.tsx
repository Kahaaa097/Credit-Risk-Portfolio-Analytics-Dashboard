import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { RateBullet as RateBulletType } from "../-hook";

interface RateBulletProps {
  data?: RateBulletType;
}

export function RateBullet({ data }: RateBulletProps) {
  const actual = data?.actualRate ?? 0;
  const bench = data?.benchmarkRate ?? 0;
  const spread = actual - bench;

  // Create ranges for the qualitative scale
  const maxRange = Math.max(actual, bench, 10) * 1.2;
  const poorRange = maxRange * 0.33;
  const satisfactoryRange = maxRange * 0.67;
  const goodRange = maxRange;

  const chartData = [
    {
      name: "Lãi suất",
      poor: poorRange,
      satisfactory: satisfactoryRange - poorRange,
      good: goodRange - satisfactoryRange,
      actual: actual,
    },
  ];

  const chartConfig = {
    actual: {
      label: "Thực tế",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-2xl border shadow-lg border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Hiệu quả lãi (Bullet Chart)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center py-4 space-y-4">
        <ChartContainer config={chartConfig} className="w-full h-[120px]">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, Math.round(goodRange) + 1]} />
            <YAxis type="category" dataKey="name" width={80} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "actual") {
                      return [`${(value as number).toFixed(2)}%`, "Thực tế"];
                    }
                    return null;
                  }}
                />
              }
            />
            {/* Background qualitative ranges */}
            <Bar dataKey="poor" stackId="a" fill="var(--destructive)" />
            <Bar dataKey="satisfactory" stackId="a" fill="var(--chart-2)" />
            <Bar dataKey="good" stackId="a" fill="var(--chart-3)" />

            {/* Benchmark reference line */}
            <ReferenceLine
              x={bench}
              stroke="var(--muted-foreground)"
              strokeWidth={3}
              strokeDasharray="5 5"
              label={{
                value: `Chuẩn: ${bench.toFixed(2)}%`,
                position: "top",
                fill: "var(--foreground)",
                fontSize: 12,
              }}
            />

            {/* Actual value bar */}
            <Bar dataKey="actual" fill="var(--chart-1)" barSize={20}>
              <Cell fill="var(--chart-1)" />
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="flex justify-between items-center px-2 text-sm">
          <div className="text-muted-foreground">
            Thực tế:{" "}
            <span className="font-semibold text-foreground">
              {actual.toFixed(2)}%
            </span>
          </div>
          <div className="text-muted-foreground">
            Chuẩn so sánh:{" "}
            <span className="font-semibold text-foreground">
              {bench.toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-2 items-center text-muted-foreground">
            <span>Chênh lệch:</span>
            <Badge
              variant={spread >= 0 ? "default" : "destructive"}
              className="font-semibold"
            >
              {spread >= 0 ? "+" : ""}
              {spread.toFixed(2)}%
            </Badge>
          </div>
        </div>

        {/* Updated Colorful Description with proper line breaks */}
        <div className="flex flex-col items-center p-2 text-xs text-center rounded-lg border bg-muted/50 border-border">
          <div className="flex flex-col gap-y-1 gap-x-3 justify-center items-center w-full">
            {/* Qualitative Ranges */}
            <div className="flex items-center">
              <span
                className="font-semibold"
                style={{ color: "var(--destructive)" }}
              >
                Nền màu
              </span>
              : Thể hiện cấp độ
              <span className="ml-1 font-semibold text-destructive">Kém</span>,
              <span className="ml-1 font-semibold text-chart-2">
                Trung Bình
              </span>
              ,<span className="ml-1 font-semibold text-chart-3">Tốt</span>.
            </div>

            <br />

            {/* Benchmark */}
            <div className="flex items-center">
              <span className="font-semibold text-muted-foreground">
                Đường đứt nét
              </span>
              :
              <span className="ml-1 font-semibold text-foreground">
                Chuẩn So Sánh
              </span>{" "}
              (Benchmark).
            </div>

            {/* Actual Value */}
            <div className="flex items-center">
              <span className="font-semibold text-chart-1">
                Thanh ngang đậm
              </span>
              :
              <span className="ml-1 font-semibold text-foreground">
                Giá Trị Thực Tế
              </span>
              .
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
