import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useContractInfo, useCustomerInfo } from "./-hook";
import {
  ContractSelector,
  ContractInfoCard,
  ContractTimelineCard,
  ContractTermsCard,
  InterestRateGauge,
} from "./-components";

export const Route = createFileRoute("/contract/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedContractNumber, setSelectedContractNumber] = useState<
    string | undefined
  >(undefined);

  const { data: contract } = useContractInfo(selectedContractNumber);
  const { data: customerInfo } = useCustomerInfo(contract?.customerCode);

  return (
    <div className="overflow-y-auto p-6 space-y-6 h-full bg-background">
      <h1 className="text-3xl font-bold text-white">Thông tin hợp đồng</h1>

      {/* Contract Selector */}
      <ContractSelector
        selectedContractNumber={selectedContractNumber}
        onContractChange={setSelectedContractNumber}
      />

      {selectedContractNumber && (
        <div className="flex overflow-y-auto flex-col gap-6">
          {/* Contract Information */}
          <ContractInfoCard
            contract={contract}
            customerName={customerInfo?.customerName}
          />

          {/* Timeline */}
          <ContractTimelineCard contract={contract} />

          {/* Main Terms and Interest Rate Gauge */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Contract Terms */}
            <div className="lg:col-span-1">
              <ContractTermsCard contract={contract} />
            </div>

            {/* Interest Rate Gauge */}
            <div className="lg:col-span-1">
              <InterestRateGauge contract={contract} />
            </div>
          </div>
        </div>
      )}

      {!selectedContractNumber && (
        <div className="flex flex-col justify-center items-center py-16 space-y-4">
          <div className="text-6xl">📄</div>
          <div className="text-xl text-muted-foreground">
            Vui lòng chọn hợp đồng để xem thông tin chi tiết
          </div>
        </div>
      )}
    </div>
  );
}
