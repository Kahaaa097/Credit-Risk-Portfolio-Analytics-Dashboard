import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmt } from "./constants";

interface MaturityCalendarItem {
  bucket: string;
  principalDue: number;
  nContracts: number;
  nplContracts: number;
}

interface MaturityCalendarProps {
  data: MaturityCalendarItem[];
}

export function MaturityCalendar({ data }: MaturityCalendarProps) {
  const buckets = [
    { key: "1M", label: "1 tháng" },
    { key: "3M", label: "3 tháng" },
    { key: "6M", label: "6 tháng" },
    { key: "12M", label: "12 tháng" },
  ];

  const getBucketData = (key: string) => {
    return (
      data.find((d) => d.bucket === key) ?? {
        principalDue: 0,
        nContracts: 0,
        nplContracts: 0,
      }
    );
  };

  const maxValue = Math.max(...data.map((d) => d.principalDue), 1);

  return (
    <Card className="rounded-2xl border shadow-lg border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Lịch đáo hạn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {buckets.map((bucket) => {
            const bucketData = getBucketData(bucket.key);
            const intensity = (bucketData.principalDue / maxValue) * 100;
            const hasRisk = bucketData.nplContracts > 0;

            return (
              <div
                key={bucket.key}
                className="relative p-4 rounded-lg border transition-all hover:shadow-md"
                style={{
                  backgroundColor: hasRisk
                    ? `var(--destructive) / ${Math.max(0.1, intensity / 100)})`
                    : `var(--chart-1) / ${Math.max(0.1, intensity / 100)})`,
                  borderColor: hasRisk
                    ? "var(--destructive)"
                    : "var(--chart-1)",
                }}
              >
                <div className="mb-2 text-sm font-semibold">{bucket.label}</div>
                <div className="mb-1 text-2xl font-bold">
                  {fmt.money(bucketData.principalDue)} Tỷ
                </div>
                <div className="text-xs text-muted-foreground">
                  {bucketData.nContracts} khế ước
                </div>
                {hasRisk && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 text-xs"
                  >
                    {bucketData.nplContracts} NPL
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Màu đỏ: có khế ước nợ xấu (nhóm 3-5), Độ đậm: tỷ lệ với dư nợ cao nhất
        </div>
      </CardContent>
    </Card>
  );
}
