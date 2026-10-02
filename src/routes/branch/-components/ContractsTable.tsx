import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle, Download, Search } from "lucide-react";
import { fmt } from "./constants";
import type { ContractRow } from "../-hook";

interface ContractsTableProps {
  data: ContractRow[];
}

export function ContractsTable({ data }: ContractsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<ContractRow, unknown>[]>(
    () => [
      {
        accessorKey: "contractId",
        header: "Mã hợp đồng",
        cell: (info) => (
          <span className="font-mono">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "customerId",
        header: "Mã khách hàng",
        cell: (info) => (
          <span className="font-mono">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "productCode",
        header: "Mã sản phẩm",
      },
      {
        accessorKey: "purposeCode",
        header: "Mã mục đích",
      },
      {
        accessorKey: "currency",
        header: "Tiền",
      },
      {
        accessorKey: "eopBalance",
        header: "Dư nợ",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="text-right block">{fmt.money(value)}</span>
          );
        },
      },
      {
        accessorKey: "loanGroup",
        header: "Nhóm",
        cell: (info) => (
          <span className="text-center block">{info.getValue() as number}</span>
        ),
      },
      {
        accessorKey: "interestRate",
        header: "Lãi suất",
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="text-right block">{fmt.rate(value)}</span>
          );
        },
      },
      {
        accessorKey: "maturityDate",
        header: "Đáo hạn",
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: (info) => {
          const row = info.row.original;
          const risk = row.loanGroup >= 3;
          return (
            <div className="flex gap-1 items-center">
              {info.getValue() as string}{" "}
              {risk && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Nhóm {row.loanGroup} (Rủi ro)</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <TooltipProvider>
      <Card className="rounded-2xl border shadow-lg border-border bg-card">
        <CardHeader className="flex flex-row justify-between items-center pb-2">
          <CardTitle className="text-xl text-foreground">
            Bảng khế ước
          </CardTitle>
          <div className="flex gap-2 items-center">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute top-2 left-2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                className="pl-8 bg-transparent text-foreground border-border hover:border-accent focus-visible:ring-ring"
                placeholder="Tìm mã Hợp đồng, Khách hàng, Sản phẩm…"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </form>
            <Button
              variant="outline"
              size="sm"
              className="text-foreground border-border hover:bg-muted"
              type="button"
            >
              <Download className="mr-1 w-4 h-4" />
              CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/20 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="cursor-pointer select-none text-muted-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: " ▲",
                              desc: " ▼",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => {
                  const risk = row.original.loanGroup >= 3;
                  return (
                    <TableRow
                      key={row.id}
                      className={
                        risk
                          ? "bg-destructive/10 hover:bg-destructive/20"
                          : ""
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="text-sm text-muted-foreground">
              Tổng {table.getFilteredRowModel().rows.length.toLocaleString("vi-VN")} hợp đồng
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
