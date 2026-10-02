import { AlertTriangle } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  unit: string;
  alert?: boolean;
  icon?: React.ReactNode;
}

export function KPICard({ title, value, unit, alert, icon }: KPICardProps) {
  return (
    <div
      className={`bg-card border-border rounded-2xl border p-4 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl ${alert ? "ring-2 ring-red-500" : ""}`}
    >
      <div className="flex gap-2 justify-center items-center mb-2">
        {icon && <div className={alert ? "text-red-500" : "text-blue-400"}>{icon}</div>}
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        {alert && <AlertTriangle className="w-4 h-4 text-red-500" />}
      </div>
      <p className="text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value} {unit}
      </p>
    </div>
  );
}
