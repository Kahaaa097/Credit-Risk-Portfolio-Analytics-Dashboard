"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Building2 } from "lucide-react";

interface ParentBranchOption {
  value: string;
  label: string;
}

interface ParentBranchSelectorProps {
  selectedBranchCode?: string;
  onBranchChange: (branchCode: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  options: ParentBranchOption[];
}

export function ParentBranchSelector({
  selectedBranchCode,
  onBranchChange,
  searchQuery,
  onSearchQueryChange,
  options,
}: ParentBranchSelectorProps) {
  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardContent className="p-6">
        <div className="flex gap-4 justify-start items-center">
          <div className="flex gap-2 items-center text-lg font-semibold">
            <Building2 className="w-5 h-5" />
            <span>Chọn chi nhánh cha</span>
          </div>
          <div className="flex-1">
            <Search
              options={options}
              selectedValue={selectedBranchCode}
              onValueChange={onBranchChange}
              placeholder="Tìm kiếm chi nhánh cha..."
              emptyMessage="Không tìm thấy chi nhánh nào"
              emptySearchMessage="Nhập từ khóa để bắt đầu tìm kiếm"
              searchPlaceholder="Nhập mã hoặc tên chi nhánh..."
              groupHeading="Kết quả tìm kiếm"
              triggerClassName="w-96"
              searchQuery={searchQuery}
              onSearchQueryChange={onSearchQueryChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
