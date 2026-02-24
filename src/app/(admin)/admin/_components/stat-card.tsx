'use client';

import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  highlight?: boolean;
  trend?: { value: number; label: string };
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight,
  trend,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div
            className={`flex w-12 shrink-0 items-center justify-center ${highlight ? 'bg-orange-500/10' : 'bg-muted/60'}`}
          >
            <Icon
              className={`h-5 w-5 ${highlight ? 'text-orange-500' : 'text-muted-foreground'}`}
            />
          </div>
          <div className="flex-1 px-4 py-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {label}
            </p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${highlight ? 'text-orange-500' : ''}`}
            >
              {Number(value).toLocaleString()}
            </p>
            {(sub || trend) && (
              <div className="mt-1 flex items-center gap-2">
                {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
                {trend && (
                  <span
                    className={`text-xs font-medium ${trend.value > 0 ? 'text-emerald-600' : trend.value < 0 ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '–'}{' '}
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-muted-foreground mt-8 mb-3 text-xs font-semibold tracking-widest uppercase">
      {title}
    </h2>
  );
}
