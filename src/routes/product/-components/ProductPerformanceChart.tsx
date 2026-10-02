import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

interface ProductPerformance {
  product_name: string;
  avg_interest_rate: number;
  npl_ratio: number;
  total_outstanding: number;
}

export function ProductPerformanceChart({
  data,
}: {
  data: ProductPerformance[];
}) {
  const chartConfig = {
    avg_interest_rate: {
      label: "Lãi suất bình quân (%)",
      color: "var(--chart-1)",
    },
    npl_ratio: {
      label: "NPL (%)",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="product_name"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 11 }}
        />
        <YAxis label={{ value: "(%)", angle: -90, position: "insideLeft" }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        <Bar
          dataKey="avg_interest_rate"
          fill="var(--color-avg_interest_rate)"
          radius={[4, 4, 0, 0]}
          name={"Lãi xuất trung bình"}
        />
        <Bar
          dataKey="npl_ratio"
          fill="var(--color-npl_ratio)"
          radius={[4, 4, 0, 0]}
          name={"Tỉ lệ NPL"}
        />
      </BarChart>
    </ChartContainer>
  );
}
