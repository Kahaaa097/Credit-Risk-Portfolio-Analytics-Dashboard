import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useCustomerProfile,
  useCustomerContracts,
  useCustomerRiskIndicator,
} from "./-hook";
import {
  CustomerSelector,
  CustomerProfileCard,
  ContractsTable,
  RiskIndicatorCard,
} from "./-components";

export const Route = createFileRoute("/customer/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);

  const { data: profile } = useCustomerProfile(selectedCustomerId);
  const { data: contracts = [] } = useCustomerContracts(selectedCustomerId);
  const { data: riskIndicator } = useCustomerRiskIndicator(selectedCustomerId);

  return (
    <div className="overflow-y-auto p-6 space-y-6 h-full bg-background">
      <h1 className="text-3xl font-bold text-white">Thông tin khách hàng</h1>

      {/* Customer Selector */}
      <CustomerSelector
        selectedCustomerId={selectedCustomerId}
        onCustomerChange={setSelectedCustomerId}
      />

      {selectedCustomerId && (
        <div className="flex overflow-y-auto flex-col gap-2">
          {/* Customer Profile Summary */}
          <CustomerProfileCard profile={profile} />

          {/* Risk Indicator and Contract Details */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Risk Indicator - Takes 1 column */}
            <div className="lg:col-span-1">
              <RiskIndicatorCard risk={riskIndicator} />
            </div>

            {/* Contract Details - Takes 2 columns */}
            <div className="lg:col-span-2">
              <ContractsTable contracts={contracts} />
            </div>
          </div>
        </div>
      )}

      {!selectedCustomerId && (
        <div className="flex flex-col justify-center items-center py-16 space-y-4">
          <div className="text-6xl">👤</div>
          <div className="text-xl text-muted-foreground">
            Vui lòng chọn khách hàng để xem thông tin chi tiết
          </div>
        </div>
      )}
    </div>
  );
}
