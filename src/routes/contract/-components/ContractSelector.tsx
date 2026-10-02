"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { FileText } from "lucide-react";
import { useContractSearch } from "../-hook";

interface ContractSelectorProps {
  selectedContractNumber?: string;
  onContractChange: (contractNumber: string) => void;
}

export function ContractSelector({
  selectedContractNumber,
  onContractChange,
}: ContractSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { data: contracts = [] } = useContractSearch(searchQuery);

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardContent className="p-6">
        <div className="flex gap-4 justify-start items-center">
          <div className="flex gap-2 items-center text-lg font-semibold">
            <FileText className="w-5 h-5" />
            <span>Chọn hợp đồng</span>
          </div>
          <div className="flex-1">
            <Search
              options={contracts}
              selectedValue={selectedContractNumber}
              onValueChange={onContractChange}
              placeholder="Tìm kiếm Hợp đồng..."
              emptyMessage="Không tìm thấy Hợp đồng nào"
              emptySearchMessage="Nhập từ khóa để bắt đầu tìm kiếm"
              searchPlaceholder="Nhập số Hợp đồng hoặc mã khách hàng..."
              groupHeading="Kết quả tìm kiếm"
              triggerClassName="w-96"
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
