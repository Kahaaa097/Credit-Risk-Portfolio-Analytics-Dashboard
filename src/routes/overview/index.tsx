import { createFileRoute } from "@tanstack/react-router";
import { Label, Pie, PieChart } from "recharts";
import * as React from "react";
import {
  useKPIData,
  useTrendData,
  useLoanGroupsData,
  useAlertsData,
  useBranchHeatmapData,
  useCustomerTypeData,
  useCurrencyData,
  useTopBranchesByBalance,
} from "./-hook";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Building2 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

export const Route = createFileRoute("/overview/")({
  component: RouteComponent,
});

interface KPICardProps {
  title: string;
  value: string | number;
  unit: string;
  alert?: boolean;
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

// Beautiful color palette for dark theme
const COLORS = {
  primary: "#60A5FA", // blue-400
  secondary: "#34D399", // emerald-400
  accent: "#F59E0B", // amber-500
  danger: "#EF4444", // red-500
  purple: "#A78BFA", // violet-400
  teal: "#2DD4BF", // teal-400
  pink: "#F472B6", // pink-400
  indigo: "#818CF8", // indigo-400
  green: "#4ADE80", // green-400
  orange: "#FB923C", // orange-400
  border: "#334155", // slate-700
  muted: "#64748B", // slate-500
  card: "#1E293B", // slate-800
};

// Helper function to get color based on NPL ratio
function getNPLColor(nplRatio: number): string {
  if (nplRatio < 0.02) return "rgba(74, 222, 128, 0.2)"; // green - good
  if (nplRatio < 0.03) return "rgba(251, 146, 60, 0.2)"; // orange - warning
  return "rgba(239, 68, 68, 0.2)"; // red - danger
}

function RouteComponent() {
  const { data: kpi, isLoading: kpiLoading } = useKPIData();
  const { data: trend, isLoading: trendLoading } = useTrendData();
  const { data: loanGroups, isLoading: groupsLoading } = useLoanGroupsData();
  const { data: alerts, isLoading: alertsLoading } = useAlertsData();
  const { data: branchHeatmap, isLoading: heatmapLoading } =
    useBranchHeatmapData();
  const { data: customerType, isLoading: customerTypeLoading } =
    useCustomerTypeData();
  const { data: currency, isLoading: currencyLoading } = useCurrencyData();
  const { data: topBranches, isLoading: topBranchesLoading } =
    useTopBranchesByBalance();

  const loading =
    kpiLoading ||
    trendLoading ||
    groupsLoading ||
    alertsLoading ||
    heatmapLoading ||
    customerTypeLoading ||
    currencyLoading ||
    topBranchesLoading;

  if (
    loading ||
    !kpi ||
    !trend ||
    !loanGroups ||
    !alerts ||
    !branchHeatmap ||
    !customerType ||
    !currency ||
    !topBranches
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="flex overflow-y-auto flex-col p-6 space-y-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold">Tổng quan</h1>

      {/* PHẦN 1: KPI CARDS ĐẦY ĐỦ */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Chỉ số tổng quan</h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <KPICard
            title="Dư nợ cuối kỳ (EOP)"
            value={kpi.eop_balance}
            unit="tỷ VND"
          />
          <KPICard
            title="Số khách hàng đang vay"
            value={kpi.n_customers?.toLocaleString() ?? "0"}
            unit=""
          />
          <KPICard
            title="Số khế ước"
            value={kpi.n_contracts?.toLocaleString() ?? "0"}
            unit=""
          />
          <KPICard
            title="Tỷ lệ NPL (nhóm 3–4)"
            value={(kpi.npl_ratio * 100).toFixed(2)}
            unit="%"
            alert={kpi.npl_ratio > 0.03}
          />
          <KPICard
            title="Lãi suất bình quân"
            value={kpi.avg_interest_rate.toFixed(2)}
            unit="%"
          />
        </div>
      </div>

      {/* PHẦN 2: HEATMAP KHU VỰC - Phân bố dư nợ & NPL giữa các chi nhánh */}
      <ChartCard title="Heatmap khu vực - Phân bố dư nợ & NPL theo chi nhánh">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {branchHeatmap.map((branch, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border transition-all cursor-pointer hover:shadow-lg"
              style={{
                backgroundColor: getNPLColor(branch.npl_ratio),
                borderColor: COLORS.border,
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3
                  className="flex gap-2 mb-1 text-sm font-semibold truncate"
                  title={branch.branch_id}
                >
                  <Building2 className="w-5 h-5" />
                  {branch.branch_id}
                </h3>
                <Badge
                  variant={
                    branch.npl_ratio > 0.03 ? "destructive" : "secondary"
                  }
                >
                  NPL: {(branch.npl_ratio * 100).toFixed(2)}%
                </Badge>
              </div>
              <p className="text-lg font-bold">
                {branch.eop_balance.toLocaleString()} tỷ
              </p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* PHẦN 3: CƠ CẤU NHÓM NỢ (PIE CHART) */}
      <ChartCard title="Cơ cấu nhóm nợ toàn hệ thống">
        <LoanGroupsPieChart data={loanGroups} />
      </ChartCard>

      {/* PHẦN 4: TOP ALERTS - 5 chi nhánh có NPL cao nhất và 5 chi nhánh có dư nợ cao nhất */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top 5 NPL Risk */}
        <ChartCard title="Top 5 Chi nhánh - NPL Rủi ro cao nhất">
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 rounded-lg border transition-colors bg-card/50 hover:bg-card"
              >
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-8 h-8 text-red-500 rounded-full bg-red-500/20">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    Chi nhánh
                    <p className="font-semibold">{alert.branch_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="mb-1">
                    NPL: {(alert.npl_ratio * 100).toFixed(2)}%
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {alert.eop_balance.toLocaleString()} tỷ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Top 5 by Outstanding Balance */}
        <ChartCard title="Top 5 Chi nhánh - Dư nợ cao nhất">
          <div className="space-y-3">
            {topBranches.map((branch) => (
              <div
                key={branch.ranking}
                className="flex justify-between items-center p-4 rounded-lg border transition-colors bg-card/50 hover:bg-card"
              >
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-8 h-8 font-bold text-blue-500 rounded-full bg-blue-500/20">
                    {branch.ranking}
                  </div>
                  <div>
                    Chi nhánh
                    <p className="font-semibold">Mã: {branch.branch_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {branch.eop_balance.toLocaleString()} tỷ
                  </p>
                  <Badge
                    variant={
                      branch.npl_ratio > 0.03 ? "destructive" : "secondary"
                    }
                  >
                    NPL: {(branch.npl_ratio * 100).toFixed(2)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* PHẦN 5: PIE CHARTS - Customer Type & Currency Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Customer Type Distribution */}
        <ChartCard title="Phân loại khách hàng">
          <CustomerTypePieChart data={customerType} />
        </ChartCard>

        {/* Currency Distribution */}
        <ChartCard title="Tỷ lệ VND và Ngoại tệ">
          <CurrencyPieChart data={currency} />
        </ChartCard>
      </div>
    </div>
  );
}

// Component KPICard
function KPICard({ title, value, unit, alert }: KPICardProps) {
  return (
    <div
      className={`bg-card border-border rounded-2xl border p-4 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl ${alert ? "ring-2 ring-red-500" : ""}`}
    >
      <div className="flex gap-2 justify-center items-center mb-2">
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        {alert && <AlertTriangle className="w-4 h-4 text-red-500" />}
      </div>
      <p className="text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value} {unit}
      </p>
    </div>
  );
}

// Component ChartCard
function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="p-6 rounded-2xl border shadow-lg bg-card border-border">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

// Loan Groups Pie Chart Component
function LoanGroupsPieChart({ data }: { data: any[] }) {
  const colors = ["#4ADE80", "#3B82F6", "#F59E0B", "#EF4444"];

  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: colors[index % colors.length],
  }));

  const totalContracts = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const chartConfig = {
    value: {
      label: "Hợp đồng",
    },
    ...data.reduce(
      (acc, item, index) => {
        acc[item.name] = {
          label: item.name,
          color: colors[index % colors.length],
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>,
    ),
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[400px]"
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
                      {totalContracts.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Hợp đồng
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

// Customer Type Pie Chart Component
function CustomerTypePieChart({ data }: { data: any[] }) {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: colors[index % colors.length],
  }));

  const totalCustomers = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const chartConfig = {
    value: {
      label: "Khách hàng",
    },
    ...data.reduce(
      (acc, item, index) => {
        acc[item.name] = {
          label: item.name,
          color: colors[index % colors.length],
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>,
    ),
  } satisfies ChartConfig;

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
                      {totalCustomers.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Khách hàng
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

// Currency Pie Chart Component
function CurrencyPieChart({ data }: { data: any[] }) {
  const colors = ["var(--chart-1)", "var(--chart-2)"];

  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: colors[index % colors.length],
  }));

  const totalBalance = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const chartConfig = {
    value: {
      label: "Dư nợ",
    },
    ...data.reduce(
      (acc, item, index) => {
        acc[item.name] = {
          label: item.name,
          color: colors[index % colors.length],
        };
        return acc;
      },
      {} as Record<string, { label: string; color: string }>,
    ),
  } satisfies ChartConfig;

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
                      {totalBalance.toLocaleString()}
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
