'use client';
import Link from 'next/link';
import {
  Image as ImageIcon,
  ArrowRight,
  Clock,
  CheckCircle2,
  Languages,
  Layers,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth, useUsageStats } from '@/hooks';
import { SUPPORTED_LANGUAGES } from '@/types';
import {
  isToday,
  isYesterday,
  formatDistanceToNowStrict,
  format,
} from 'date-fns';
import { UsageChart } from '@/components/features/dashboard/UsageChart';
import { OnboardingChecklist } from '@/components/features/dashboard/OnboardingChecklist';

function StatSkeleton() {
  return <div className="bg-muted h-9 w-16 animate-pulse rounded-md" />;
}

function formatLastActive(iso: string | null): string {
  if (!iso) return 'No activity yet';
  const date = new Date(iso);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  const distance = formatDistanceToNowStrict(date, { addSuffix: true });
  if (!distance.includes('month') && !distance.includes('year'))
    return distance;
  return format(date, 'MMM d, yyyy');
}

function getLanguageName(code: string): string {
  return (
    SUPPORTED_LANGUAGES.find(l => l.code === code)?.name ?? code.toUpperCase()
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: usage, isLoading, isError, refetch } = useUsageStats();

  const isNewUser =
    !isLoading && !isError && (usage?.all_time.translations_count ?? 0) === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isNewUser
            ? 'Start by translating your first image.'
            : 'Get started by translating an image or view your recent jobs.'}
        </p>
      </div>

      {/* Onboarding checklist — shown until all steps are complete */}
      {!isLoading && !isError && usage && <OnboardingChecklist usage={usage} />}

      {/* Top row: Quick Translate + Batch + usage chart */}
      <div
        className={`grid gap-6 ${isNewUser ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}
      >
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Quick Translate
            </CardTitle>
            <CardDescription>
              Upload an image and get instant translation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/translate">
              <Button className="w-full gap-2">
                Start Translating <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Batch Translate
            </CardTitle>
            <CardDescription>
              Translate multiple images across languages at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/batch">
              <Button variant="outline" className="w-full gap-2">
                Open Batch <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {!isNewUser && !isLoading && !isError && usage && (
          <UsageChart usage={usage} />
        )}

        {!isNewUser && (isLoading || isError) && (
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>This Month</CardDescription>
              {isLoading ? (
                <StatSkeleton />
              ) : (
                <CardTitle className="text-muted-foreground text-3xl">
                  —
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">images processed</p>
            </CardContent>
          </Card>
        )}

        {!isNewUser && (
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> All Time
              </CardDescription>
              {isLoading ? (
                <StatSkeleton />
              ) : isError ? (
                <CardTitle className="text-muted-foreground text-3xl">
                  —
                </CardTitle>
              ) : (
                <CardTitle className="text-3xl">
                  {usage?.all_time.translations_count ?? 0}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                total translations
              </p>
              {!isLoading &&
                !isError &&
                (usage?.all_time.images_processed ?? 0) > 0 && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {usage?.all_time.images_processed} images,{' '}
                    {usage?.all_time.batches_run} batches
                  </p>
                )}
            </CardContent>
          </Card>
        )}
      </div>

      {isError && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">
                Could not load usage stats
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Last Active — only for returning users */}
      {!isNewUser && !isError && (
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Last Active
            </CardDescription>
            {isLoading ? (
              <StatSkeleton />
            ) : (
              <CardTitle className="mt-1 text-lg">
                {formatLastActive(usage?.last_activity ?? null)}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">most recent job</p>
          </CardContent>
        </Card>
      )}

      {/* Top languages — only for returning users */}
      {!isNewUser &&
        !isError &&
        (isLoading || (usage?.most_used_languages.length ?? 0) > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Languages className="h-4 w-4" />
                Your Top Languages
              </CardTitle>
              <CardDescription>Most frequently translated to</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="bg-muted h-6 w-16 animate-pulse rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {usage?.most_used_languages.map(code => (
                    <Badge key={code} variant="secondary">
                      {getLanguageName(code)}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-sm">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Plan</p>
              <p className="font-medium capitalize">{user?.tier || 'Free'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Batches run</p>
              <p className="font-medium">
                {isLoading ? '—' : (usage?.all_time.batches_run ?? 0)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/settings">
              <Button variant="outline">Manage Account</Button>
            </Link>
            <Link href="/history">
              <Button variant="outline" className="gap-2">
                <Layers className="h-4 w-4" /> View History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
