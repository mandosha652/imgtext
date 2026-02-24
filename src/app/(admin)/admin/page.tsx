'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Image as ImageIcon,
  Layers,
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useAdminStats,
  useAdminCostSummary,
  useAdminCostByUser,
} from '@/hooks';
import { StatCard, SectionHeader } from './_components/stat-card';
import { DailyCostChart } from './_components/daily-cost-chart';
import { ServiceHealthSection } from './_components/service-health-section';
import { BrokerHealthCard } from './_components/broker-health-card';
import { CleanupSection } from './_components/cleanup-section';

type CostPeriod = 'today' | 'week' | 'month' | 'alltime';

const PERIOD_LABELS: Record<CostPeriod, string> = {
  today: 'Today',
  week: 'Week',
  month: 'Month',
  alltime: 'All time',
};

function fmt(val: number | null | undefined): string {
  if (val == null) return '\u2014';
  return `$${val.toFixed(4)}`;
}

function StatsSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-muted h-[72px] animate-pulse rounded-xl" />
      ))}
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading, error } = useAdminStats();
  const [costPeriod, setCostPeriod] = useState<CostPeriod>('month');
  const { data: costSummary, isLoading: costLoading } =
    useAdminCostSummary(costPeriod);
  const { data: userCosts } = useAdminCostByUser(costPeriod);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="bg-muted mb-1 h-8 w-48 animate-pulse rounded" />
          <div className="bg-muted h-4 w-64 animate-pulse rounded" />
        </div>
        <StatsSkeleton />
        <StatsSkeleton />
        <StatsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="bg-destructive/10 rounded-full p-3">
          <AlertTriangle className="text-destructive h-6 w-6" />
        </div>
        <p className="font-semibold">Failed to load stats</p>
        <p className="text-muted-foreground text-sm">
          Check your admin key and try again
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Platform Overview</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Live metrics across all tenants
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Users
              <ArrowRight className="text-muted-foreground h-3 w-3" />
            </Button>
          </Link>
          <Link href="/admin/batches">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Batches
              <ArrowRight className="text-muted-foreground h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      <SectionHeader title="Users" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats.total_users} icon={Users} />
        <StatCard
          label="Active Users"
          value={stats.active_users}
          sub={`${stats.verified_users} verified`}
          icon={CheckCircle}
        />
        <StatCard
          label="New Today"
          value={stats.new_users_today}
          sub={`${stats.new_users_this_month} this month`}
          icon={TrendingUp}
          highlight={stats.new_users_today > 0}
        />
        <Card className="overflow-hidden">
          <CardContent className="px-4 py-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Tier Breakdown
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Free
                </Badge>
                <span className="text-sm font-semibold tabular-nums">
                  {stats.users_by_tier.free}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-blue-300 bg-blue-50 text-xs text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                >
                  Pro
                </Badge>
                <span className="text-sm font-semibold tabular-nums">
                  {stats.users_by_tier.pro}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-purple-300 bg-purple-50 text-xs text-purple-700 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                >
                  Enterprise
                </Badge>
                <span className="text-sm font-semibold tabular-nums">
                  {stats.users_by_tier.enterprise}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="Batches" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Batches"
          value={stats.total_batches}
          icon={Layers}
        />
        <StatCard
          label="Today"
          value={stats.batches_today}
          icon={Activity}
          highlight={stats.batches_today > 0}
        />
        <StatCard
          label="Pending / Processing"
          value={stats.pending_batches}
          sub={`${stats.processing_batches} processing`}
          icon={Clock}
          highlight={stats.pending_batches > 10}
        />
        <StatCard
          label="Failed Today"
          value={stats.failed_batches_today}
          icon={AlertTriangle}
          highlight={stats.failed_batches_today > 0}
        />
      </div>

      <SectionHeader title="Usage" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Images Processed"
          value={stats.total_images_processed}
          sub={`${stats.images_processed_today} today`}
          icon={ImageIcon}
        />
        <StatCard
          label="Total Translations"
          value={stats.total_translations}
          sub={`${stats.translations_today} today`}
          icon={TrendingUp}
        />
        <StatCard
          label="OCR Calls Today"
          value={stats.ocr_calls_today}
          icon={Activity}
        />
        <Card className="overflow-hidden">
          <CardContent className="px-4 py-4">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              API Calls Today
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">OCR</span>
                <span className="font-semibold tabular-nums">
                  {stats.ocr_calls_today.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Translate</span>
                <span className="font-semibold tabular-nums">
                  {stats.translate_calls_today.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inpaint</span>
                <span className="font-semibold tabular-nums">
                  {stats.inpaint_calls_today.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Costs &amp; Profitability
        </h2>
        <div className="flex rounded-lg border p-0.5">
          {(Object.keys(PERIOD_LABELS) as CostPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setCostPeriod(p)}
              className={`focus-visible:ring-ring/50 cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:px-3 ${
                costPeriod === p
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {costLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-muted h-[72px] animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : costSummary ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div className="flex w-12 shrink-0 items-center justify-center bg-emerald-500/10">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 px-4 py-4">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Total Spend
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600 tabular-nums">
                      {fmt(costSummary.total_cost_usd)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      all providers combined
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="px-4 py-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Google Vision
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {fmt(costSummary.vision.cost_usd)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {costSummary.vision.calls.toLocaleString()} OCR calls
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="px-4 py-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  OpenAI GPT-4o
                </p>
                {costSummary.openai.error ? (
                  <p className="mt-1 text-sm text-orange-500">
                    {costSummary.openai.error}
                  </p>
                ) : (
                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {fmt(costSummary.openai.cost_usd)}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  via OpenAI billing API
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="px-4 py-4">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Replicate LaMa
                </p>
                {costSummary.replicate.error ? (
                  <p className="mt-1 text-sm text-orange-500">
                    {costSummary.replicate.error}
                  </p>
                ) : (
                  <p className="mt-1 text-2xl font-bold tabular-nums">
                    {fmt(costSummary.replicate.cost_usd)}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {costSummary.replicate.predictions} predictions
                  {costSummary.replicate.total_seconds != null &&
                    ` \u00b7 ${costSummary.replicate.total_seconds.toFixed(1)}s`}
                </p>
              </CardContent>
            </Card>
          </div>

          <DailyCostChart />

          {userCosts && userCosts.length > 0 && (
            <Card className="mt-4">
              <CardContent className="pt-5 pb-4">
                <p className="mb-3 text-sm font-medium">
                  Top Users by Vision Spend
                </p>
                <div className="space-y-2">
                  {userCosts.slice(0, 5).map((row, i) => (
                    <div
                      key={row.user_id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="text-muted-foreground w-4 shrink-0 text-xs tabular-nums">
                        {i + 1}
                      </span>
                      <Link
                        href={`/admin/users/${row.user_id}`}
                        className="text-muted-foreground hover:text-foreground min-w-0 flex-1 truncate font-mono text-xs transition-colors"
                      >
                        {row.user_id}
                      </Link>
                      <span className="text-muted-foreground hidden shrink-0 text-xs sm:inline">
                        {row.images_processed.toLocaleString()} imgs
                      </span>
                      <span className="w-16 shrink-0 text-right font-semibold tabular-nums sm:w-20">
                        {fmt(row.vision_cost_usd)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      <SectionHeader title="System" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ServiceHealthSection />
        <BrokerHealthCard />
        <CleanupSection />
      </div>
    </div>
  );
}
