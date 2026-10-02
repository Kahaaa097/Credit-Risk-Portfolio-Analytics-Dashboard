import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, DollarSign, Target, Package } from "lucide-react";
import type { ContractInfo } from "../-hook";

interface ContractTermsCardProps {
  contract?: ContractInfo | null;
}

export function ContractTermsCard({ contract }: ContractTermsCardProps) {
  if (!contract) {
    return (
      <Card className="rounded-2xl border shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <FileText className="w-5 h-5" />
            Điều khoản chính
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const terms = [
    {
      icon: Clock,
      label: "Kỳ hạn kế toán",
      value: contract.accountingTerm,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Clock,
      label: "Kỳ hạn hợp đồng",
      value: contract.contractTerm,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: DollarSign,
      label: "Loại tiền",
      value: contract.currency,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Target,
      label: "Mã mục đích vay",
      value: contract.sectorCode,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Target,
      label: "Tên mục đích vay",
      value: contract.loanPurposeName,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      fullWidth: true,
    },
    {
      icon: Package,
      label: "Mã sản phẩm",
      value: contract.subProductCode,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      icon: Package,
      label: "Tên sản phẩm",
      value: contract.subProductName,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      fullWidth: true,
    },
  ];

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <FileText className="w-5 h-5" />
          Điều khoản chính
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {terms.map((term, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border border-border ${term.bgColor} ${
                term.fullWidth ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <term.icon className={`w-5 h-5 ${term.color} mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">
                    {term.label}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-sm font-semibold max-w-full"
                  >
                    <span className="truncate" title={term.value}>
                      {term.value}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
