import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { fmt } from "./constants";
import type { DisbPoint } from "../-hook";

interface DisbursementTrendProps {
  data: DisbPoint[];
}

export function DisbursementTrend({ data }: DisbursementTrendProps) {
  const chartConfig = {
    amount: {
      label: "Số tiền giải ngân",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-2xl border shadow-lg border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Giải ngân theo sản phẩm</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => fmt.money(value as number) + " tỷ"}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="var(--color-amount)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
