import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RTooltip,
} from "recharts";
import type { MaturityBucket } from "../-hook";

interface MaturityBucketsProps {
  data: MaturityBucket[];
}

export function MaturityBuckets({ data }: MaturityBucketsProps) {
  const src = data.map((d) => ({
    name: `${d.months}m`,
    principalDue: d.principalDue,
    nContracts: d.nContracts,
  }));

  return (
    <Card className="h-72 rounded-2xl border shadow-lg border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white">
          Lịch đáo hạn (1–3–6–12m)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={src}>
            <CartesianGrid stroke="var(--muted)" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              tick={{ fill: "var(--foreground)" }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fill: "var(--foreground)" }}
            />
            <Legend wrapperStyle={{ color: "var(--foreground)" }} />
            <RTooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--card-foreground)",
              }}
            />
            <Bar
              dataKey="principalDue"
              name="Tổng số tiền gốc"
              fill="#10B981"
            />
            <Bar
              dataKey="nContracts"
              name="Số lượng hợp đồng đến hạn"
              fill="#38BDF8"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
