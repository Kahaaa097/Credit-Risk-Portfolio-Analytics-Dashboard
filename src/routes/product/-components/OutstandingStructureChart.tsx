import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { useMemo } from "react";

interface OutstandingByProductPurpose {
  product_name: string;
  loan_purpose_name: string;
  principal_outstanding: number;
}

// Define the available shadcn chart colors
// We'll use up to var(--chart-6) which is a common set in shadcn chart examples.
// If more colors are needed, the user should define them in their CSS.
const SHADCN_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function OutstandingStructureChart({
  data,
}: {
  data: OutstandingByProductPurpose[];
}) {
  // Transform data for stacked column chart
  const chartData = useMemo(() => {
    // Group by product_name and aggregate by loan_purpose_name
    const grouped = data.reduce(
      (acc, item) => {
        acc[item.product_name] ??= { product_name: item.product_name };
        // Ensure outstanding is treated as a number in the chart data for calculation/rendering
        acc[item.product_name][item.loan_purpose_name] =
          item.principal_outstanding;
        return acc;
      },
      {} as Record<string, Record<string, number | string>>,
    );

    return Object.values(grouped);
  }, [data]);

  // Get all unique loan purposes for config
  const loanPurposes = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.loan_purpose_name)));
  }, [data]);

  // Create chart config
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};

    loanPurposes.forEach((purpose, index) => {
      // Use only SHADCN_CHART_COLORS, rotating through them
      config[purpose] = {
        label: purpose,
        color: SHADCN_CHART_COLORS[index % SHADCN_CHART_COLORS.length],
      };
    });

    return config;
  }, [loanPurposes]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
      <BarChart
        data={chartData}
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
        <YAxis
          label={{
            value: "Dư nợ (tỷ VND)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ paddingTop: "10px" }} />
        {loanPurposes.map((purpose) => (
          <Bar
            key={purpose}
            dataKey={purpose}
            stackId="a"
            fill={chartConfig[purpose]?.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
