import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, AlertTriangle } from "lucide-react";
import { fmt, RISK_COLORS } from "./constants";
import type { CustomerContract } from "../-hook";

interface ContractsTableProps {
  contracts: CustomerContract[];
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  const getRiskIndicator = (level: number) => {
    return (
      <div
        className="inline-block w-5 h-5 rounded-full border-2 border-white shadow-lg"
        style={{ backgroundColor: RISK_COLORS[level - 1] }}
        title={`Mức độ rủi ro: ${level}/5`}
      />
    );
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("active") || statusLower.includes("hoạt động")) {
      return <Badge variant="default">Hoạt động</Badge>;
    }
    if (statusLower.includes("overdue") || statusLower.includes("quá hạn")) {
      return <Badge variant="destructive">Quá hạn</Badge>;
    }
    if (statusLower.includes("closed") || statusLower.includes("đóng")) {
      return <Badge variant="secondary">Đã đóng</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getDebtGroupBadge = (group: string) => {
    const g = parseInt(group);
    if (g >= 4) return <Badge variant="destructive">Nhóm {group}</Badge>;
    if (g === 3) return <Badge variant="default">Nhóm {group}</Badge>;
    if (g === 2) return <Badge variant="secondary">Nhóm {group}</Badge>;
    return <Badge variant="outline">Nhóm {group}</Badge>;
  };

  const getDaysToMaturityColor = (days: number) => {
    if (days < 0) return "text-red-500 font-bold";
    if (days < 30) return "text-orange-500 font-semibold";
    if (days < 90) return "text-yellow-500";
    return "text-muted-foreground";
  };

  if (contracts.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <FileText className="w-5 h-5" />
            Thông tin khế ước
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Không có khế ước nào
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 justify-between items-center">
          <div className="flex gap-2 items-center">
            <FileText className="w-5 h-5" />
            Thông tin khế ước
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rủi ro</TableHead>
              <TableHead>Số khế ước</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Nhóm nợ</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Mục đích</TableHead>
              <TableHead className="text-right">Dư nợ (tỷ VND)</TableHead>
              <TableHead>Tiền tệ</TableHead>
              <TableHead className="text-right">Lãi suất</TableHead>
              <TableHead>Ngày hiệu lực</TableHead>
              <TableHead>Ngày đáo hạn</TableHead>
              <TableHead className="text-right">Đến hạn (ngày)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract, idx) => {
              const isHighRisk = contract.riskLevel >= 4;
              return (
                <TableRow
                  key={idx}
                  className={isHighRisk ? "bg-red-950/30" : ""}
                >
                  <TableCell className="text-center">
                    {getRiskIndicator(contract.riskLevel)}
                  </TableCell>
                  <TableCell className="font-mono font-medium">
                    {contract.contractNumber}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(contract.contractStatus)}
                  </TableCell>
                  <TableCell>
                    {getDebtGroupBadge(contract.debtGroup)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div
                        className="font-medium truncate"
                        title={contract.productName}
                      >
                        {contract.productName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contract.productCode}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <div
                        className="truncate"
                        title={contract.loanPurposeName}
                      >
                        {contract.loanPurposeName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contract.loanPurpose}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {fmt.money(contract.principalOutstanding)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{contract.currency}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {fmt.rate(contract.interestRate)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmt.date(contract.effectiveDate)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmt.date(contract.originalMaturityDate)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${getDaysToMaturityColor(contract.daysToMaturity)}`}
                  >
                    {contract.daysToMaturity === 9999 ? (
                      "N/A"
                    ) : contract.daysToMaturity < 0 ? (
                      <div className="flex gap-1 items-center justify-end">
                        <AlertTriangle className="w-4 h-4" />
                        {Math.abs(contract.daysToMaturity)} (quá hạn)
                      </div>
                    ) : (
                      contract.daysToMaturity
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
