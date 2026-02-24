'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminCostDaily } from '@/hooks';

function fmt(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${val.toFixed(4)}`;
}

export function DailyCostChart() {
  const { data: daily, isLoading } = useAdminCostDaily(30);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Daily Cost Trend (last 30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-36 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  if (!daily || daily.length === 0) return null;

  const max = Math.max(...daily.map(d => d.total_cost_usd), 0.0001);
  const total = daily.reduce((s, d) => s + d.total_cost_usd, 0);
  const nonZero = daily.filter(d => d.total_cost_usd > 0);
  const avg = nonZero.length > 0 ? total / nonZero.length : 0;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium">
            Daily Cost Trend (last 30 days)
          </CardTitle>
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span>
              Total:{' '}
              <span className="text-foreground font-semibold">
                {fmt(total)}
              </span>
            </span>
            <span>
              Avg/day:{' '}
              <span className="text-foreground font-semibold">{fmt(avg)}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-36 items-end gap-0.5">
          {daily.map(d => {
            const heightPct = (d.total_cost_usd / max) * 100;
            return (
              <div
                key={d.date}
                className="group relative flex flex-1 flex-col items-center justify-end"
              >
                <div
                  className={`w-full rounded-t transition-colors ${d.total_cost_usd > 0 ? 'bg-primary/60 hover:bg-primary' : 'bg-muted'}`}
                  style={{
                    height: `${Math.max(heightPct, d.total_cost_usd > 0 ? 4 : 1)}%`,
                  }}
                />
                <div className="bg-popover pointer-events-none absolute bottom-full mb-2 hidden rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md group-hover:block">
                  <p className="font-medium">{d.date}</p>
                  <p className="text-muted-foreground">
                    {fmt(d.total_cost_usd)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-muted-foreground mt-2 flex justify-between text-xs">
          <span>{daily[0]?.date}</span>
          <span>{daily[daily.length - 1]?.date}</span>
        </div>
      </CardContent>
    </Card>
  );
}
