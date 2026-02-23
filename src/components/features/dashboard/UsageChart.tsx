'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from '@/components/ui/card';
import type { UsageStatsResponse } from '@/types';

interface Props {
  usage: UsageStatsResponse;
}

function pct(value: number, max: number | null): number {
  if (max === null || max === 0) return 0;
  return Math.min(100, Math.round((value / max) * 100));
}

function delta(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

function DeltaBadge({ current, prev }: { current: number; prev: number }) {
  const d = delta(current, prev);
  if (d === null) return null;

  if (d === 0) {
    return (
      <span className="text-muted-foreground flex items-center gap-0.5 text-xs">
        <Minus className="h-3 w-3" /> Same as last month
      </span>
    );
  }

  const up = d > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-medium ${
        up ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
      }`}
    >
      {up ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {up ? '+' : ''}
      {d}% vs last month
    </span>
  );
}

interface BarProps {
  value: number;
  max: number | null;
  label: string;
}

function UsageBar({ value, max, label }: BarProps) {
  const isUnlimited = max === null;
  const percent = pct(value, max);
  const barColor =
    percent >= 90
      ? 'bg-destructive'
      : percent >= 70
        ? 'bg-yellow-500'
        : 'bg-primary';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value.toLocaleString()}
          {!isUnlimited && (
            <span className="text-muted-foreground font-normal">
              {' '}
              / {max!.toLocaleString()}
            </span>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
      {isUnlimited && (
        <p className="text-muted-foreground text-xs">Unlimited</p>
      )}
    </div>
  );
}

export function UsageChart({ usage }: Props) {
  const { current_month, last_month, quota } = usage;

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          This Month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          <UsageBar
            value={quota ? quota.images_used : current_month.images_processed}
            max={quota ? quota.images_limit : null}
            label="Images processed"
          />
          <UsageBar
            value={quota ? quota.batches_used : current_month.batches_run}
            max={quota ? quota.batches_limit : null}
            label="Batches run"
          />
          {quota && (
            <UsageBar
              value={quota.translations_used}
              max={quota.translations_limit}
              label="Translations"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <DeltaBadge
            current={current_month.images_processed}
            prev={last_month.images_processed}
          />
          <DeltaBadge
            current={current_month.batches_run}
            prev={last_month.batches_run}
          />
        </div>
      </CardContent>
    </Card>
  );
}
