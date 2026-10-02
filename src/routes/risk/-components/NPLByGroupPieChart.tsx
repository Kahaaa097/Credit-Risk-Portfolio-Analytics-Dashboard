import { Label, Pie, PieChart } from "recharts";
import * as React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

interface NPLGroupData {
  name: string;
  value: number;
  count: number;
}

export function NPLByGroupPieChart({ data }: { data: NPLGroupData[] }) {
  const colors = ["#F59E0B", "#EF4444", "#991B1B"]; // amber, red, dark red

  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: colors[index % colors.length],
  }));

  const totalNPL = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const chartConfig: ChartConfig = {
    value: {
      label: "Nợ xấu (tỷ VND)",
    },
  };

  // Add dynamic chart config entries
  data.forEach((item, index) => {
    chartConfig[item.name] = {
      label: item.name,
      color: colors[index % colors.length],
    };
  });

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[350px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="text-3xl font-bold fill-foreground"
                    >
                      {totalNPL.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      tỷ VND
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
        <ChartLegend />
      </PieChart>
    </ChartContainer>
  );
}
