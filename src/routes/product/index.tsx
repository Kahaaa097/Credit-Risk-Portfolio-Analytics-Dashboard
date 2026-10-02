import { createFileRoute } from "@tanstack/react-router";
import { Package, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useState, useMemo } from "react";
import {
  useParentBranchSearch,
  useOutstandingByProductPurpose,
  useProductPerformance,
  useProductRiskCorrelation,
  useBranchProductBenchmark,
} from "./-hook";
import {
  KPICard,
  ChartCard,
  OutstandingStructureChart,
  ProductPerformanceChart,
  RiskCorrelationScatterChart,
  BranchBenchmarkRadarChart,
} from "./-components";
import { ParentBranchSelector } from "@/components/ui/ParentBranchSelector";

export const Route = createFileRoute("/product/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedParentBranch, setSelectedParentBranch] = useState<
    string | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: branchOptions = [] } = useParentBranchSearch(searchQuery);
  const { data: outstandingData = [] } =
    useOutstandingByProductPurpose(selectedParentBranch);
  const { data: performanceData = [] } =
    useProductPerformance(selectedParentBranch);
  const { data: correlationData = [] } =
    useProductRiskCorrelation(selectedParentBranch);
  const { data: benchmarkData = [] } =
    useBranchProductBenchmark(selectedParentBranch);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (performanceData.length === 0) {
      return {
        totalOutstanding: 0,
        avgInterestRate: 0,
        avgNPL: 0,
        productCount: 0,
      };
    }

    const totalOutstanding = performanceData.reduce(
      (sum, item) => sum + item.total_outstanding,
      0,
    );
    const avgInterestRate =
      performanceData.reduce((sum, item) => sum + item.avg_interest_rate, 0) /
      performanceData.length;
    const avgNPL =
      performanceData.reduce(
        (sum, item) => sum + item.npl_ratio * item.total_outstanding,
        0,
      ) / totalOutstanding;

    return {
      totalOutstanding,
      avgInterestRate,
      avgNPL,
      productCount: performanceData.length,
    };
  }, [performanceData]);

  return (
    <div className="flex overflow-y-auto flex-col p-6 space-y-8 bg-background text-foreground">
      <h1 className="text-3xl font-bold">Quản lý Sản phẩm</h1>

      {/* Parent Branch Selector */}
      <ParentBranchSelector
        selectedBranchCode={selectedParentBranch}
        onBranchChange={setSelectedParentBranch}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        options={branchOptions}
      />

      {selectedParentBranch && performanceData.length > 0 && (
        <>
          {/* PHẦN 1: KPI TỔNG QUAN */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Chỉ số hiệu suất sản phẩm
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Tổng dư nợ"
                value={kpis.totalOutstanding.toFixed(2)}
                unit="tỷ VND"
                icon={<Package className="w-5 h-5" />}
              />
              <KPICard
                title="Lãi suất bình quân"
                value={kpis.avgInterestRate.toFixed(2)}
                unit="%"
                icon={<TrendingUp className="w-5 h-5" />}
              />
              <KPICard
                title="NPL trung bình"
                value={kpis.avgNPL.toFixed(2)}
                unit="%"
                alert={kpis.avgNPL > 3}
                icon={<BarChart3 className="w-5 h-5" />}
              />
              <KPICard
                title="Số lượng sản phẩm"
                value={kpis.productCount}
                unit="sản phẩm"
                icon={<PieChart className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* PHẦN 2: CƠ CẤU DƯ NỢ THEO SẢN PHẨM VÀ MỤC ĐÍCH VAY */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ChartCard title="Cơ cấu dư nợ theo sản phẩm và mục đích vay">
              <OutstandingStructureChart data={outstandingData} />
            </ChartCard>
          </div>

          {/* PHẦN 3: HIỆU QUẢ SẢN PHẨM & PHÂN TÍCH TƯƠNG QUAN */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Product Performance */}
            <ChartCard title="Hiệu quả sản phẩm: Lãi suất bình quân & NPL%">
              <ProductPerformanceChart data={performanceData} />
            </ChartCard>

            {/* Risk Correlation */}
            <ChartCard title="Phân tích tương quan: Lãi suất - Rủi ro (NPL%)">
              <RiskCorrelationScatterChart data={correlationData} />
            </ChartCard>
          </div>
        </>
      )}

      {/* PHẦN 4: BENCHMARK GIỮA CÁC CHI NHÁNH */}
      {benchmarkData.length > 0 && (
        <ChartCard title="Benchmark giữa chi nhánh: So sánh hiệu suất sản phẩm">
          <BranchBenchmarkRadarChart data={benchmarkData} />
        </ChartCard>
      )}

      {!selectedParentBranch && (
        <div className="flex flex-col justify-center items-center py-16 space-y-4">
          <div className="text-6xl">📦</div>
          <div className="text-xl text-muted-foreground">
            Vui lòng chọn chi nhánh cha để xem dữ liệu sản phẩm
          </div>
        </div>
      )}

      {selectedParentBranch && performanceData.length === 0 && (
        <div className="flex flex-col justify-center items-center py-16 space-y-4">
          <div className="text-6xl">📊</div>
          <div className="text-xl text-muted-foreground">
            Không có dữ liệu sản phẩm cho chi nhánh này
          </div>
        </div>
      )}
    </div>
  );
}
