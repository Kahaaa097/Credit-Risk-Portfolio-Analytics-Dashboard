import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useParentBranchSearch,
  useBranchKPI,
  useCustomerMix,
  useLoanGroupsByBranch,
  useRateBullet,
  useMaturityCalendar,
  useContracts,
} from "./-hook";
import {
  KpiCards,
  CustomerMixPie,
  LoanGroupsBar,
  RateBullet,
  MaturityCalendar,
  ContractsTable,
} from "./-components";
import { ParentBranchSelector } from "@/components/ui/ParentBranchSelector";

export const Route = createFileRoute("/branch/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedParentBranch, setSelectedParentBranch] = useState<
    string | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: branchOptions = [] } = useParentBranchSearch(searchQuery);
  const { data: kpi } = useBranchKPI(selectedParentBranch);
  const { data: mixData } = useCustomerMix(selectedParentBranch);
  const { data: groupsData } = useLoanGroupsByBranch(selectedParentBranch);
  const { data: rateData } = useRateBullet(selectedParentBranch);
  const { data: matCalendarData } = useMaturityCalendar(selectedParentBranch);
  const { data: contractsData } = useContracts({
    parentBranchCode: selectedParentBranch,
  });

  return (
    <div className="p-6 space-y-8 bg-background">
      <h1 className="text-3xl font-bold text-white">Chi nhánh</h1>

      <ParentBranchSelector
        selectedBranchCode={selectedParentBranch}
        onBranchChange={setSelectedParentBranch}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        options={branchOptions}
      />

      {selectedParentBranch && (
        <>
          <KpiCards kpi={kpi} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomerMixPie data={mixData ?? []} />
            <RateBullet data={rateData} />
          </div>

          <MaturityCalendar data={matCalendarData ?? []} />

          <LoanGroupsBar data={groupsData ?? []} />

          <ContractsTable data={contractsData?.rows ?? []} />
        </>
      )}
    </div>
  );
}
