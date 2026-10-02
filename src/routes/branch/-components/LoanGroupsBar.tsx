import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  type TooltipProps,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { fmt } from "./constants";
import type { LoanGroupByBranchItem } from "../-hook";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface LoanGroupsBarProps {
  data: LoanGroupByBranchItem[];
}

// Define a custom tooltip component that uses the formatter
const CustomChartTooltipContent = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    // payload[0].payload is the entire data object for the branch
    const branchName = label;

    return (
      <div className="p-3 bg-white rounded-lg border shadow-md dark:bg-gray-800 dark:border-gray-700">
        <p className="mb-1 font-bold text-gray-900 dark:text-gray-100">
          {branchName}
        </p>
        {payload.map((item, index) => (
          <p key={index} style={{ color: item.color }} className="text-sm">
            {/* item.name is "Nhóm n" */}
            <span className="font-semibold">{item.name}:</span>{" "}
            {/* Format the value */}
            {fmt.money(item.value as number) + " tỷ"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function LoanGroupsBar({ data }: LoanGroupsBarProps) {
  const chartData = data.map((d) => ({
    name: d.branchCode,
    "Nhóm 1": d.group1,
    "Nhóm 2": d.group2,
    "Nhóm 3": d.group3,
    "Nhóm 4": d.group4,
  }));

  const chartConfig = {
    "Nhóm 1": {
      label: "Nhóm 1",
      color: "var(--chart-1)",
    },
    "Nhóm 2": {
      label: "Nhóm 2",
      color: "var(--chart-2)",
    },
    "Nhóm 3": {
      label: "Nhóm 3",
      color: "var(--chart-3)",
    },
    "Nhóm 4": {
      label: "Nhóm 4",
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="rounded-2xl border shadow-lg border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Cơ cấu nhóm nợ theo chi nhánh</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <ChartTooltip content={<CustomChartTooltipContent />} />
            <Legend />
            <Bar dataKey="Nhóm 1" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Nhóm 2" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Nhóm 3" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Nhóm 4" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
