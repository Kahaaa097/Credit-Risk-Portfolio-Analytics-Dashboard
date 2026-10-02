import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, TrendingUp, AlertCircle } from "lucide-react";
import { fmt } from "./constants";
import type { CustomerProfile } from "../-hook";

interface CustomerProfileCardProps {
  profile?: CustomerProfile | null;
}

export function CustomerProfileCard({ profile }: CustomerProfileCardProps) {
  if (!profile) {
    return (
      <Card className="rounded-2xl border shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <User className="w-5 h-5" />
            Tóm tắt hồ sơ KH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Vui lòng chọn khách hàng để xem thông tin
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDebtGroupColor = (group: string) => {
    const g = parseInt(group);
    if (g >= 4) return "destructive";
    if (g === 3) return "default";
    if (g === 2) return "secondary";
    return "outline";
  };

  const items = [
    {
      icon: User,
      label: "Mã khách hàng",
      value: profile.customerId,
    },
    {
      icon: FileText,
      label: "Loại khách hàng",
      value: profile.customerType,
      badge: true,
    },
    {
      icon: AlertCircle,
      label: "Khách hàng ưu tiên",
      value: profile.priorityCustomer,
      badge: true,
    },
    {
      icon: FileText,
      label: "Số giấy tờ pháp lý",
      value: profile.legalId,
    },
    {
      icon: TrendingUp,
      label: "Tổng dư nợ",
      value: `${fmt.money(profile.totalOutstanding)} tỷ VND`,
      highlight: true,
    },
    {
      icon: AlertCircle,
      label: "Nhóm nợ cao nhất",
      value: `Nhóm ${profile.highestDebtGroup}`,
      badge: true,
      badgeVariant: getDebtGroupColor(profile.highestDebtGroup),
    },
    {
      icon: FileText,
      label: "Số khế ước hoạt động",
      value: profile.activeContracts.toString(),
      highlight: true,
    },
  ];

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <User className="w-5 h-5" />
          Tóm tắt hồ sơ KH
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                item.highlight
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-card/50"
              }`}
            >
              <div className="flex gap-2 items-center mb-2 text-sm text-muted-foreground">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              <div className="text-lg font-semibold">
                {item.badge ? (
                  <Badge
                    variant={
                      (item.badgeVariant as any) ||
                      (item.value === "VIP" ? "default" : "secondary")
                    }
                  >
                    {item.value}
                  </Badge>
                ) : (
                  item.value
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
