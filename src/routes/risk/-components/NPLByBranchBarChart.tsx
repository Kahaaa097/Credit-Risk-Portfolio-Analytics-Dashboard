import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

interface NPLBranchData {
  branch_code: string;
  branch_name: string;
  npl_amount: number;
  total_outstanding: number;
  npl_ratio: number;
}

export function NPLByBranchBarChart({ data }: { data: NPLBranchData[] }) {
  const chartConfig = {
    npl_amount: {
      label: "Nợ xấu",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[350px]">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <XAxis type="number" />
        <YAxis
          dataKey="branch_code"
          type="category"
          width={80}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="npl_amount" fill="var(--color-npl_amount)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
