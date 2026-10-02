"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";

interface BranchProductBenchmark {
  branch_code: string;
  branch_name: string;
  avg_interest_rate: number;
  npl_ratio: number;
  total_outstanding: number;
}

export function BranchBenchmarkRadarChart({
  data,
}: {
  data: BranchProductBenchmark[];
}) {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    const maxInterestRate = Math.max(
      ...data.map((d) => d.avg_interest_rate),
      1,
    );
    const maxNPL = Math.max(...data.map((d) => d.npl_ratio), 1);
    const maxOutstanding = Math.max(...data.map((d) => d.total_outstanding), 1);

    const metrics = [
      {
        metric: "Lãi suất BQ",
        ...data.reduce(
          (acc, branch) => {
            acc[branch.branch_code] =
              (branch.avg_interest_rate / maxInterestRate) * 100;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      {
        metric: "NPL % (Đảo ngược)",
        ...data.reduce(
          (acc, branch) => {
            acc[branch.branch_code] = 100 - (branch.npl_ratio / maxNPL) * 100;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      {
        metric: "Dư nợ",
        ...data.reduce(
          (acc, branch) => {
            acc[branch.branch_code] =
              (branch.total_outstanding / maxOutstanding) * 100;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
    ];

    return metrics;
  }, [data]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {
      metric: {
        label: "Chỉ số",
      },
    };

    const colors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];

    data.forEach((branch, index) => {
      config[branch.branch_code] = {
        label: `${branch.branch_code}`,
        color: colors[index % colors.length],
      };
    });

    return config;
  }, [data]);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>So sánh Chi nhánh</CardTitle>
        <CardDescription>
          Benchmark hiệu suất các chi nhánh (thang 100 điểm)
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[450px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid gridType="circle" />
            <PolarAngleAxis dataKey="metric" />
            <ChartLegend />
            {data.map((branch) => (
              <Radar
                key={branch.branch_code}
                name={`Chi nhánh ${branch.branch_code}  `}
                dataKey={branch.branch_code}
                fill={`var(--color-${branch.branch_code})`}
                fillOpacity={0.6}
                stroke={`var(--color-${branch.branch_code})`}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            ))}
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
