'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  ImageIcon,
  Ban,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  useBatchStatus,
  useCancelBatch,
  useRetryBatchImage,
  useBatchStream,
} from '@/hooks';
import { BatchImageTile } from '@/components/features/history/BatchImageTile';
import { getLangName } from '@/components/features/history/utils';
import { getErrorMessage } from '@/lib/utils';
import type { BatchStatusResponse, BatchStatus } from '@/types';

const statusConfig: Record<
  BatchStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'default' },
  completed: { label: 'Completed', variant: 'default' },
  partially_completed: { label: 'Partially Completed', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
};

function BatchDetailContent({ batchId }: { batchId: string }) {
  const queryClient = useQueryClient();
  const cancelBatch = useCancelBatch();
  const retryImage = useRetryBatchImage();

  const { data: batch, isLoading, isError } = useBatchStatus(batchId);

  const isActive =
    batch?.status === 'pending' || batch?.status === 'processing';
  const { progress } = useBatchStream(batchId, !!isActive);

  const onDoneRef = useRef(() => {
    queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
  });

  useEffect(() => {
    if (progress?.done) {
      onDoneRef.current();
    }
  }, [progress?.done]);

  const merged: BatchStatusResponse | undefined = batch
    ? progress
      ? {
          ...batch,
          status: progress.status as BatchStatusResponse['status'],
          completed_count: progress.completed_count,
          failed_count: progress.failed_count,
        }
      : batch
    : undefined;

  const handleCancel = async () => {
    try {
      await cancelBatch.mutateAsync(batchId);
      toast.success('Batch cancelled');
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to cancel batch'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !merged) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <AlertCircle className="text-muted-foreground h-8 w-8" />
        <p className="text-muted-foreground text-sm">Failed to load batch</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/history">Back to history</Link>
        </Button>
      </div>
    );
  }

  const cfg = statusConfig[merged.status];
  const completedImages = merged.images.filter(i => i.status === 'completed');
  const failedImages = merged.images.filter(i => i.status === 'failed');
  const pendingImages = merged.images.filter(
    i => i.status === 'pending' || i.status === 'processing'
  );

  const progressValue =
    merged.total_images > 0
      ? Math.round(
          ((merged.completed_count + merged.failed_count) /
            merged.total_images) *
            100
        )
      : 0;

  const isExpired = merged.is_expired;
  const isProcessing =
    merged.status === 'pending' || merged.status === 'processing';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            {isExpired && <Badge variant="destructive">Results expired</Badge>}
          </div>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <Clock className="h-3.5 w-3.5" />
            Created {format(new Date(merged.created_at), 'PPp')}
          </p>
          <p className="text-muted-foreground text-sm">
            Languages:{' '}
            <span className="text-foreground font-medium">
              {merged.target_languages.map(getLangName).join(', ')}
            </span>
          </p>
        </div>

        {isProcessing && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={cancelBatch.isPending}
          >
            {cancelBatch.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Cancelling…
              </>
            ) : (
              <>
                <Ban className="mr-1.5 h-3.5 w-3.5" />
                Cancel Batch
              </>
            )}
          </Button>
        )}
      </div>

      {/* Progress bar (active batches) */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {merged.completed_count} completed · {merged.failed_count} failed
              ·{' '}
              {merged.total_images -
                merged.completed_count -
                merged.failed_count}{' '}
              remaining
            </span>
            <span className="font-semibold">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      )}

      {/* Expired state */}
      {isExpired && (
        <div className="text-muted-foreground flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Image results have expired and are no longer available for download.
        </div>
      )}

      {/* In-progress images */}
      {isProcessing && pendingImages.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            In Progress ({pendingImages.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {pendingImages.map(img => (
              <div
                key={img.image_id}
                className="bg-card flex flex-col items-center justify-center gap-2 rounded-xl border p-4"
              >
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                  <ImageIcon className="text-muted-foreground h-5 w-5" />
                </div>
                <p
                  className="text-muted-foreground max-w-full truncate text-xs"
                  title={img.original_filename}
                >
                  {img.original_filename}
                </p>
                <Loader2 className="text-primary h-4 w-4 animate-spin" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Completed images */}
      {!isExpired && completedImages.length > 0 && (
        <section className="space-y-3">
          {(failedImages.length > 0 || isProcessing) && (
            <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Completed ({completedImages.length})
            </h2>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {completedImages.map(img => (
              <BatchImageTile
                key={img.image_id}
                image={img}
                onRetry={() =>
                  retryImage.mutate({ batchId, imageId: img.image_id })
                }
                isRetrying={
                  retryImage.isPending &&
                  retryImage.variables?.imageId === img.image_id
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Failed images */}
      {!isExpired && failedImages.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Failed ({failedImages.length})
            </h2>
            {failedImages.length > 1 && (
              <button
                onClick={() =>
                  failedImages.forEach(img =>
                    retryImage.mutate({ batchId, imageId: img.image_id })
                  )
                }
                disabled={retryImage.isPending}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              >
                Retry all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {failedImages.map(img => (
              <BatchImageTile
                key={img.image_id}
                image={img}
                onRetry={() =>
                  retryImage.mutate({ batchId, imageId: img.image_id })
                }
                isRetrying={
                  retryImage.isPending &&
                  retryImage.variables?.imageId === img.image_id
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Expired placeholder grid */}
      {isExpired && merged.images.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Images ({merged.images.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {merged.images.map(img => (
              <div
                key={img.image_id}
                className="bg-card overflow-hidden rounded-xl border"
              >
                <div className="bg-muted flex aspect-square items-center justify-center">
                  <ImageIcon className="text-muted-foreground/40 h-8 w-8" />
                </div>
                <div className="p-2.5">
                  <p
                    className="truncate text-xs font-medium"
                    title={img.original_filename}
                  >
                    {img.original_filename}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">Expired</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function BatchDetailPage() {
  const params = useParams<{ id: string }>();
  const batchId = params.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/history">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Batch Details</h1>
          <p className="text-muted-foreground font-mono text-xs">{batchId}</p>
        </div>
      </div>

      <BatchDetailContent batchId={batchId} />
    </div>
  );
}
