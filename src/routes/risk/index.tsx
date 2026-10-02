import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";
import {
  useRiskKPIData,
  useWatchlistData,
  useNPLByGroupData,
  useNPLByBranchData,
  useParentBranchSearch,
} from "./-hook";
import {
  KPICard,
  ChartCard,
  NPLByGroupPieChart,
  NPLByBranchBarChart,
  WatchlistTable,
} from "./-components";
import { ParentBranchSelector } from "@/components/ui/ParentBranchSelector";

export const Route = createFileRoute("/risk/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedParentBranch, setSelectedParentBranch] = useState<
    string | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: branchOptions = [] } = useParentBranchSearch(searchQuery);
  const { data: kpi } = useRiskKPIData(selectedParentBranch);
  const { data: watchlist = [] } = useWatchlistData(selectedParentBranch);
  const { data: nplByGroup = [] } = useNPLByGroupData(selectedParentBranch);
  const { data: nplByBranch = [] } = useNPLByBranchData(selectedParentBranch);

  return (
    <div className="flex overflow-y-auto flex-col p-6 space-y-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold">Quản lý Rủi ro</h1>

      {/* Parent Branch Selector */}
      <ParentBranchSelector
        selectedBranchCode={selectedParentBranch}
        onBranchChange={setSelectedParentBranch}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        options={branchOptions}
      />

      {selectedParentBranch && kpi && (
        <>
          {/* PHẦN 1: KPI RỦI RO */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Chỉ số rủi ro chính</h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <KPICard
                title="Tỷ lệ NPL (Nhóm 3-4)"
                value={(kpi.npl_ratio * 100).toFixed(2)}
                unit="%"
                alert={kpi.npl_ratio > 0.03}
                icon={<AlertTriangle className="w-5 h-5" />}
              />
              <KPICard
                title="Nợ xấu (NPL Stock)"
                value={kpi.npl_stock.toLocaleString()}
                unit="tỷ VND"
                alert={true}
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <KPICard
                title="Tổng dư nợ"
                value={kpi.total_outstanding.toLocaleString()}
                unit="tỷ VND"
                icon={<Shield className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* PHẦN 2: NPL BREAKDOWN BY GROUP & BRANCH */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* NPL by Debt Group */}

            <ChartCard title="Phân bổ nợ xấu theo nhóm">
              <NPLByGroupPieChart data={nplByGroup} />
            </ChartCard>

            {/* NPL by Branch */}
            <div className="col-span-2">
              <ChartCard title="Tỷ lệ nợ xấu của các chi nhánh con">
                <NPLByBranchBarChart data={nplByBranch} />
              </ChartCard>
            </div>
          </div>

          {/* PHẦN 4: WATCHLIST - Hợp đồng cần theo dõi */}
          <ChartCard title="Danh sách theo dõi (Watchlist) - Hợp đồng cần chú ý">
            <WatchlistTable data={watchlist} />
          </ChartCard>
        </>
      )}

      {!selectedParentBranch && (
        <div className="flex flex-col justify-center items-center py-16 space-y-4">
          <div className="text-6xl">🏢</div>
          <div className="text-xl text-muted-foreground">
            Vui lòng chọn chi nhánh cha để xem dữ liệu rủi ro
          </div>
        </div>
      )}
    </div>
  );
}
