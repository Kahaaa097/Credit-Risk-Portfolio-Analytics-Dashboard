import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopExposure } from "../-hook";

interface TopExposureTableProps {
  data: TopExposure[];
}

export function TopExposureTable({ data }: TopExposureTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Hạng</TableHead>
            <TableHead>Mã khách hàng</TableHead>
            <TableHead>Số khế ước</TableHead>
            <TableHead>Nhóm nợ</TableHead>
            <TableHead className="text-right">Dư nợ (tỷ VND)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.ranking}>
              <TableCell className="font-medium">
                <div className="flex justify-center items-center w-8 h-8 font-bold text-white rounded-full bg-linear-to-br from-red-500 to-red-700">
                  {item.ranking}
                </div>
              </TableCell>
              <TableCell className="font-mono">{item.customer_code}</TableCell>
              <TableCell className="font-mono">{item.contract_number}</TableCell>
              <TableCell>
                <Badge variant={item.debt_group === "4" ? "destructive" : "default"}>
                  Nhóm {item.debt_group}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {item.principal_outstanding.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
