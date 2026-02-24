'use client';

import { useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trash2,
  ExternalLink,
  XCircle,
  RotateCcw,
  Zap,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  useAdminBatches,
  useAdminDeleteBatch,
  useAdminCancelBatch,
  useAdminRetryBatch,
  useAdminResumeStuckBatches,
} from '@/hooks';
import type { AdminBatchSummary } from '@/types';

const PAGE_SIZE = 20;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className:
      'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  },
  processing: {
    label: 'Processing',
    className:
      'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  },
  completed: {
    label: 'Completed',
    className:
      'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  partially_completed: {
    label: 'Partial',
    className:
      'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
  },
  failed: {
    label: 'Failed',
    className:
      'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-border text-muted-foreground',
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-xs ${config?.className ?? ''}`}>
      {config?.label ?? status}
    </Badge>
  );
}

function BatchRow({
  batch,
  onDelete,
  isDeleting,
  onCancel,
  isCancelling,
  onRetry,
  isRetrying,
}: {
  batch: AdminBatchSummary;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onCancel: (id: string) => void;
  isCancelling: boolean;
  onRetry: (id: string) => void;
  isRetrying: boolean;
}) {
  const canCancel = batch.status === 'pending' || batch.status === 'processing';
  const canRetry =
    batch.status === 'failed' ||
    batch.status === 'partially_completed' ||
    batch.status === 'cancelled';

  return (
    <div className="hover:bg-muted/30 flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors">
      {/* Status indicator dot */}
      <div
        className={`h-2 w-2 shrink-0 rounded-full ${
          batch.status === 'completed'
            ? 'bg-emerald-500'
            : batch.status === 'processing'
              ? 'animate-pulse bg-blue-500'
              : batch.status === 'pending'
                ? 'bg-yellow-500'
                : batch.status === 'failed'
                  ? 'bg-red-500'
                  : batch.status === 'partially_completed'
                    ? 'bg-orange-500'
                    : 'bg-muted-foreground/30'
        }`}
      />

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground truncate font-mono text-xs">
            {batch.id}
          </p>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-sm">
            {batch.source_language} →{' '}
            {batch.target_languages.slice(0, 3).join(', ')}
            {batch.target_languages.length > 3 &&
              ` +${batch.target_languages.length - 3}`}
          </span>
          <span className="text-muted-foreground text-xs">
            {batch.total_images} img · {batch.completed_count} done
            {batch.failed_count > 0 && (
              <span className="text-red-500">
                {' '}
                · {batch.failed_count} failed
              </span>
            )}
          </span>
          <Link
            href={`/admin/users/${batch.tenant_id}`}
            className="text-muted-foreground hover:text-foreground font-mono text-xs transition-colors"
            title="View user"
          >
            {batch.tenant_id.slice(0, 8)}…
          </Link>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-1.5">
        <StatusBadge status={batch.status} />
        <span className="text-muted-foreground hidden text-xs tabular-nums sm:block">
          {format(new Date(batch.created_at), 'MMM d, yyyy')}
        </span>

        {/* Action buttons */}
        <div className="flex items-center">
          <Link href={`/admin/batches/${batch.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
              title="View detail"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {canCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8 hover:text-orange-500"
              title="Cancel batch"
              disabled={isCancelling}
              onClick={() => onCancel(batch.id)}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          )}
          {canRetry && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8 hover:text-blue-500"
              title="Retry batch"
              disabled={isRetrying}
              onClick={() => onRetry(batch.id)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this batch?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the batch and all its image results.
                  Cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(batch.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function BatchRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      <div className="bg-muted h-2 w-2 shrink-0 animate-pulse rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="bg-muted h-3 w-64 animate-pulse rounded" />
        <div className="bg-muted h-3.5 w-48 animate-pulse rounded" />
      </div>
      <div className="flex gap-2">
        <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
        <div className="bg-muted hidden h-3.5 w-20 animate-pulse rounded sm:block" />
      </div>
    </div>
  );
}

export default function AdminBatchesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [offset, setOffset] = useState(0);

  const params = {
    status: status !== 'all' ? status : undefined,
    tenant_id: search || undefined,
    limit: PAGE_SIZE,
    offset,
  };

  const { data, isLoading, error } = useAdminBatches(params);
  const deleteBatch = useAdminDeleteBatch();
  const cancelBatch = useAdminCancelBatch();
  const retryBatch = useAdminRetryBatch();
  const resumeStuck = useAdminResumeStuckBatches();

  const handleDelete = async (batchId: string) => {
    try {
      await deleteBatch.mutateAsync(batchId);
      toast.success('Batch deleted');
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const handleCancel = async (batchId: string) => {
    try {
      await cancelBatch.mutateAsync(batchId);
      toast.success('Batch cancelled');
    } catch {
      toast.error('Failed to cancel batch');
    }
  };

  const handleRetry = async (batchId: string) => {
    try {
      await retryBatch.mutateAsync(batchId);
      toast.success('Batch queued for retry');
    } catch {
      toast.error('Failed to retry batch');
    }
  };

  const handleResumeStuck = async () => {
    try {
      await resumeStuck.mutateAsync();
      toast.success('Resume task queued for all stuck batches');
    } catch {
      toast.error('Failed to resume stuck batches');
    }
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Batches</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {data?.total != null
              ? `${data.total.toLocaleString()} total batches`
              : 'All platform batches'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResumeStuck}
          disabled={resumeStuck.isPending}
          className="gap-1.5"
        >
          <Zap
            className={`h-3.5 w-3.5 ${resumeStuck.isPending ? 'animate-pulse text-yellow-500' : ''}`}
          />
          {resumeStuck.isPending ? 'Queuing...' : 'Resume Stuck'}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Filter by tenant ID..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setOffset(0);
                }}
                className="pl-9"
                autoComplete="off"
              />
            </div>
            <Select
              value={status}
              onValueChange={v => {
                setStatus(v);
                setOffset(0);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="partially_completed">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <BatchRowSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <div className="bg-destructive/10 rounded-full p-3">
                <AlertTriangle className="text-destructive h-5 w-5" />
              </div>
              <p className="text-destructive font-medium">
                Failed to load batches
              </p>
              <p className="text-muted-foreground text-sm">
                Check your admin key and try again
              </p>
            </div>
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <Layers className="text-muted-foreground/40 h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                No batches found matching your filters
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data?.items?.map(batch => (
                <BatchRow
                  key={batch.id}
                  batch={batch}
                  onDelete={handleDelete}
                  isDeleting={deleteBatch.isPending}
                  onCancel={handleCancel}
                  isCancelling={cancelBatch.isPending}
                  onRetry={handleRetry}
                  isRetrying={retryBatch.isPending}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
                {data && (
                  <span className="ml-1">
                    ({data.total.toLocaleString()} total)
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={!data || offset + PAGE_SIZE >= data.total}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
