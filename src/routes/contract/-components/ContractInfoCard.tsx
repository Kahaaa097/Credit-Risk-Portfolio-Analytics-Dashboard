import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Building, TrendingUp } from "lucide-react";
import { fmt } from "./constants";
import type { ContractInfo } from "../-hook";

interface ContractInfoCardProps {
  contract?: ContractInfo | null;
  customerName?: string;
}

export function ContractInfoCard({
  contract,
  customerName,
}: ContractInfoCardProps) {
  if (!contract) {
    return (
      <Card className="rounded-2xl border shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <FileText className="w-5 h-5" />
            Thông tin hợp đồng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Vui lòng chọn hợp đồng để xem thông tin
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = [
    {
      icon: FileText,
      label: "Số hợp đồng",
      value: contract.contractNumber,
    },
    {
      icon: User,
      label: "Khách hàng",
      value: customerName ?? contract.customerName,
    },
    {
      icon: FileText,
      label: "Trạng thái hợp đồng",
      value: contract.contractStatus,
      badge: true,
    },
    {
      icon: Building,
      label: "Chi nhánh",
      value: contract.branchCode,
    },
    {
      icon: TrendingUp,
      label: "Dư nợ gốc",
      value: `${fmt.money(contract.principalOutstanding)} tỷ ${contract.currency}`,
      highlight: true,
    },
  ];

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <FileText className="w-5 h-5" />
          Thông tin hợp đồng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-4 ${
                item.highlight
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="flex gap-3 items-start">
                <item.icon className="mt-0.5 w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {item.label}
                  </p>
                  {item.badge ? (
                    <Badge variant="secondary" className="text-sm">
                      {item.value}
                    </Badge>
                  ) : (
                    <p
                      className={`truncate font-semibold ${
                        item.highlight ? "text-primary text-lg" : ""
                      }`}
                      title={item.value}
                    >
                      {item.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
