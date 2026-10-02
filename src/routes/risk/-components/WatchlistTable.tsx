import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WatchlistItem } from "../-hook";

interface WatchlistTableProps {
  data: WatchlistItem[];
}

// Helper function to get alert badge variant
function getAlertBadgeVariant(reason: string): "destructive" | "default" | "secondary" {
  if (reason.includes("quá hạn")) return "destructive";
  if (reason.includes("lãi suất phạt")) return "default";
  return "secondary";
}

export function WatchlistTable({ data }: WatchlistTableProps) {
  return (
    <div className="space-y-1">
      <div className="flex gap-2 mb-4">
        <Badge variant="destructive" className="flex gap-1 items-center">
          <Clock className="w-3 h-3" />
          {data.filter((w) => w.alert_reason.includes("quá hạn")).length} Quá hạn
        </Badge>
        <Badge variant="default" className="flex gap-1 items-center">
          <AlertTriangle className="w-3 h-3" />
          {data.filter((w) => w.alert_reason.includes("Sắp đến hạn")).length} Sắp đến hạn
        </Badge>
        <Badge variant="secondary" className="flex gap-1 items-center">
          <TrendingUp className="w-3 h-3" />
          {data.filter((w) => w.alert_reason.includes("lãi suất phạt")).length} Có lãi phạt
        </Badge>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Mã KH</TableHead>
              <TableHead>Số khế ước</TableHead>
              <TableHead>Ngày hết hạn</TableHead>
              <TableHead>Còn lại (ngày)</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Dư nợ (tỷ)</TableHead>
              <TableHead className="text-right">Lãi phạt (tỷ)</TableHead>
              <TableHead>Cảnh báo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-sm">{item.customer_code}</TableCell>
                <TableCell className="font-mono text-sm">{item.contract_number}</TableCell>
                <TableCell>{item.expiry_date}</TableCell>
                <TableCell>
                  <Badge variant={item.days_to_expiry < 0 ? "destructive" : "secondary"}>
                    {item.days_to_expiry < 0
                      ? `Quá ${Math.abs(item.days_to_expiry)} ngày`
                      : `${item.days_to_expiry} ngày`}
                  </Badge>
                </TableCell>
                <TableCell>{item.contract_status}</TableCell>
                <TableCell className="text-right font-semibold">
                  {item.principal_outstanding.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {item.penalty_interest_total > 0
                    ? item.penalty_interest_total.toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={getAlertBadgeVariant(item.alert_reason)}>
                    {item.alert_reason}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
