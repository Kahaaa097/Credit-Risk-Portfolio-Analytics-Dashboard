import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { fmt } from "./constants";
import type { ContractInfo } from "../-hook";

interface ContractTimelineCardProps {
  contract?: ContractInfo | null;
}

export function ContractTimelineCard({ contract }: ContractTimelineCardProps) {
  if (!contract) {
    return (
      <Card className="rounded-2xl border shadow-lg bg-card border-border">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-lg font-semibold">
            <Calendar className="w-5 h-5 text-primary" />
            Dòng thời gian hợp đồng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            Không có dữ liệu
          </div>
        </CardContent>
      </Card>
    );
  }

  const timelineEvents = [
    {
      label: "Ngày hiệu lực",
      date: contract.effectiveDate,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/50",
      borderColor: "border-blue-300 dark:border-blue-700",
    },
    {
      label: "Ngày giải ngân ban đầu",
      date: contract.originalDisbursementDate,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/50",
      borderColor: "border-green-300 dark:border-green-700",
    },
    {
      label: "Ngày hết hạn",
      date: contract.expiryDate,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/50",
      borderColor: "border-orange-300 dark:border-orange-700",
    },
  ];

  // Calculate days between dates
  const calculateDaysBetween = (date1: string, date2: string) => {
    if (!date1 || !date2) return null;
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const daysToMaturity = contract.expiryDate
    ? calculateDaysBetween(new Date().toISOString(), contract.expiryDate)
    : null;

  return (
    <Card className="rounded-2xl border shadow-lg bg-card border-border">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center text-lg font-semibold">
          <Calendar className="w-5 h-5 text-primary" />
          Dòng thời gian hợp đồng
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline Display */}
          <div className="flex justify-between items-start">
            {timelineEvents.map((event, idx) => (
              <>
                {/* Event Marker (Fixed width for centering content) */}
                <div
                  key={idx}
                  className="flex flex-col flex-1 items-center min-w-0"
                >
                  <div
                    className={`h-12 w-12 rounded-full ${event.bgColor} ${event.borderColor} flex items-center justify-center border-2 ${event.color} mb-2`}
                  >
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      {event.label}
                    </p>
                    <p className={`text-xs ${event.color} font-medium`}>
                      {fmt.date(event.date)}
                    </p>
                  </div>
                </div>

                {/* Arrow Separator (Flex-1 ensures it takes the space between events) */}
                {idx < timelineEvents.length - 1 && (
                  <div
                    key={`arrow-${idx}`}
                    className="flex flex-1 items-center self-center mx-2"
                  >
                    <div className="relative w-full h-0.5 bg-muted-foreground/30">
                      <ArrowRight className="absolute right-0 top-1/2 w-5 h-5 translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </>
            ))}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 gap-4 pt-4 border-t md:grid-cols-2 border-border">
            {daysToMaturity !== null && (
              <div className="p-3 rounded-lg border bg-primary-100/20 border-primary/50 dark:bg-primary-900/20">
                <p className="mb-1 text-sm text-muted-foreground">
                  Số ngày đến khi đáo hạn
                </p>
                <p className="text-xl font-bold text-primary">
                  {daysToMaturity} ngày
                </p>
              </div>
            )}
            <div className="p-3 rounded-lg border bg-secondary/20 border-border">
              <p className="mb-1 text-sm text-muted-foreground">
                Trạng thái hợp đồng
              </p>
              <p className="text-xl font-bold text-foreground">
                {contract.contractStatus}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
