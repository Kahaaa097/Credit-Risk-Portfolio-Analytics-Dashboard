"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Users } from "lucide-react";
import { useCustomerSearch } from "../-hook";

interface CustomerSelectorProps {
  selectedCustomerId?: string;
  onCustomerChange: (customerId: string) => void;
}

export function CustomerSelector({
  selectedCustomerId,
  onCustomerChange,
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { data: customers = [] } = useCustomerSearch(searchQuery);

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardContent className="p-6">
        <div className="flex gap-4 justify-start items-center">
          <div className="flex gap-2 items-center text-lg font-semibold">
            <Users className="w-5 h-5" />
            <span>Chọn khách hàng</span>
          </div>
          <div className="flex-1">
            <Search
              options={customers}
              selectedValue={selectedCustomerId}
              onValueChange={onCustomerChange}
              placeholder="Tìm kiếm Khách hàng..."
              emptyMessage="Không tìm thấy Khách hàng nào"
              emptySearchMessage="Nhập từ khóa để bắt đầu tìm kiếm"
              searchPlaceholder="Nhập mã hoặc loại Khách hàng..."
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
