'use client';

import { useState } from 'react';
import {
  Users,
  Image,
  Layers,
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useAdminStats,
  useAdminCostSummary,
  useAdminCostByUser,
} from '@/hooks';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p
              className={`mt-1 text-3xl font-bold ${highlight ? 'text-orange-500' : ''}`}
            >
              {value.toLocaleString()}
            </p>
            {sub && <p className="text-muted-foreground mt-1 text-xs">{sub}</p>}
          </div>
          <div className="bg-muted rounded-lg p-2">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-muted-foreground mt-8 mb-3 text-xs font-semibold tracking-widest uppercase">
      {title}
    </h2>
  );
}

type CostPeriod = 'today' | 'week' | 'month' | 'alltime';

function fmt(val: number | null | undefined): string {
  if (val == null) return '—';
  return `$${val.toFixed(4)}`;
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading, error } = useAdminStats();
  const [costPeriod, setCostPeriod] = useState<CostPeriod>('month');
  const { data: costSummary, isLoading: costLoading } =
    useAdminCostSummary(costPeriod);
  const { data: userCosts } = useAdminCostByUser(costPeriod);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Loading platform stats...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <AlertTriangle className="text-destructive h-8 w-8" />
        <p className="text-destructive font-medium">Failed to load stats</p>
        <p className="text-muted-foreground text-sm">
          Check your admin key and try again
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground text-sm">
          Live metrics across all tenants
        </p>
      </div>

      <SectionHeader title="Users" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Tier Breakdown</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Free
                </Badge>
                <span className="font-semibold">
                  {stats.users_by_tier.free}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-blue-300 text-xs text-blue-600"
                >
                  Pro
                </Badge>
                <span className="font-semibold">{stats.users_by_tier.pro}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-purple-300 text-xs text-purple-600"
                >
                  Enterprise
                </Badge>
                <span className="font-semibold">
                  {stats.users_by_tier.enterprise}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="Batches" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Batches"
          value={stats.total_batches}
          icon={Layers}
        />
        <StatCard
          label="Batches Today"
          value={stats.batches_today}
          icon={Activity}
          highlight={stats.batches_today > 0}
        />
        <StatCard
          label="Pending"
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Images Processed"
          value={stats.total_images_processed}
          sub={`${stats.images_processed_today} today`}
          icon={Image}
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
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">API Calls Today</p>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">OCR</span>
                <span className="font-semibold">{stats.ocr_calls_today}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Translate</span>
                <span className="font-semibold">
                  {stats.translate_calls_today}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inpaint</span>
                <span className="font-semibold">
                  {stats.inpaint_calls_today}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Costs & Profitability ── */}
      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          Costs & Profitability
        </h2>
        <div className="flex gap-1">
          {(['today', 'week', 'month', 'alltime'] as CostPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setCostPeriod(p)}
              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                costPeriod === p
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'alltime'
                ? 'All time'
                : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {costLoading ? (
        <p className="text-muted-foreground animate-pulse text-sm">
          Loading cost data...
        </p>
      ) : costSummary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Spend</p>
                    <p className="mt-1 text-3xl font-bold text-emerald-600">
                      {fmt(costSummary.total_cost_usd)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      combined all providers
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">Google Vision</p>
                <p className="mt-1 text-3xl font-bold">
                  {fmt(costSummary.vision.cost_usd)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {costSummary.vision.calls.toLocaleString()} OCR calls
                </p>
              </CardContent>
            </Card>

            {/* OpenAI */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">OpenAI GPT-4o</p>
                {costSummary.openai.error ? (
                  <p className="mt-1 text-sm text-orange-500">
                    {costSummary.openai.error}
                  </p>
                ) : (
                  <p className="mt-1 text-3xl font-bold">
                    {fmt(costSummary.openai.cost_usd)}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  real data from OpenAI API
                </p>
              </CardContent>
            </Card>

            {/* Replicate */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm">Replicate LaMa</p>
                {costSummary.replicate.error ? (
                  <p className="mt-1 text-sm text-orange-500">
                    {costSummary.replicate.error}
                  </p>
                ) : (
                  <p className="mt-1 text-3xl font-bold">
                    {fmt(costSummary.replicate.cost_usd)}
                  </p>
                )}
                <p className="text-muted-foreground mt-1 text-xs">
                  {costSummary.replicate.predictions} predictions
                  {costSummary.replicate.total_seconds != null &&
                    ` · ${costSummary.replicate.total_seconds.toFixed(1)}s`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top users by cost */}
          {userCosts && userCosts.length > 0 && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-3 text-sm font-medium">
                  Top Users by Vision Spend
                </p>
                <div className="space-y-2">
                  {userCosts.slice(0, 5).map(row => (
                    <div
                      key={row.user_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground font-mono text-xs">
                        {row.user_id.slice(0, 8)}…
                      </span>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">
                          {row.images_processed.toLocaleString()} imgs
                        </span>
                        <span className="font-semibold">
                          {fmt(row.vision_cost_usd)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
