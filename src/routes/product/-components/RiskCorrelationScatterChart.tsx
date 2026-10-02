import {
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ZAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { useMemo } from "react";

interface ProductRiskCorrelation {
  product_name: string;
  interest_rate: number;
  npl_ratio: number;
  debt_group: string;
  principal_outstanding: number;
}

export function RiskCorrelationScatterChart({
  data,
}: {
  data: ProductRiskCorrelation[];
}) {
  // Group data by product for better visualization
  const groupedData = useMemo(() => {
    const groups: Record<string, ProductRiskCorrelation[]> = {};
    data.forEach((item) => {
      groups[item.product_name] ??= [];
      groups[item.product_name].push(item);
    });
    return groups;
  }, [data]);

  const productNames = Object.keys(groupedData).slice(0, 5); // Top 5 products

  const colors = useMemo(
    () => [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ],
    [],
  );

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    productNames.forEach((name, index) => {
      config[name] = {
        label: name,
        color: colors[index],
      };
    });
    return config;
  }, [productNames, colors]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px]">
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="interest_rate"
          name="Lãi suất"
          unit="%"
          label={{
            value: "Lãi suất (%)",
            position: "insideBottom",
            offset: -10,
          }}
        />
        <YAxis
          type="number"
          dataKey="npl_ratio"
          name="NPL"
          unit="%"
          label={{ value: "NPL (%)", angle: -90, position: "insideLeft" }}
        />
        <ZAxis
          type="number"
          dataKey="principal_outstanding"
          range={[50, 400]}
          name="Dư nợ"
        />
        <ChartTooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={<ChartTooltipContent />}
        />
        <ChartLegend />
        {productNames.map((productName) => (
          <Scatter
            key={productName}
            name={productName}
            data={groupedData[productName]}
            fill={chartConfig[productName]?.color ?? colors[0]}
          />
        ))}
      </ScatterChart>
    </ChartContainer>
  );
}
