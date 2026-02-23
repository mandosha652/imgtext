'use client';

import { useMemo } from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BatchStatusResponse, BatchStatus, ImageStatus } from '@/types';

interface BatchProgressProps {
  batchStatus: BatchStatusResponse;
  onCancel: () => void;
  isCancelling: boolean;
}

const statusConfig: Record<
  BatchStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: { label: 'Pending', variant: 'secondary', icon: Clock },
  processing: { label: 'Processing', variant: 'default', icon: Loader2 },
  completed: { label: 'Completed', variant: 'default', icon: CheckCircle2 },
  partially_completed: {
    label: 'Partially Completed',
    variant: 'secondary',
    icon: AlertCircle,
  },
  failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
  cancelled: { label: 'Cancelled', variant: 'outline', icon: Ban },
};

const imageStatusConfig: Record<
  ImageStatus,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  pending: { icon: Clock, color: 'text-muted-foreground' },
  processing: { icon: Loader2, color: 'text-primary' },
  completed: { icon: CheckCircle2, color: 'text-green-500' },
  failed: { icon: XCircle, color: 'text-destructive' },
};

export function BatchProgress({
  batchStatus,
  onCancel,
  isCancelling,
}: BatchProgressProps) {
  const { status, total_images, completed_count, failed_count, images } =
    batchStatus;

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const progressValue =
    total_images > 0
      ? Math.round(((completed_count + failed_count) / total_images) * 100)
      : 0;

  const isProcessing = status === 'pending' || status === 'processing';

  const estimatedTimeRemaining = useMemo(() => {
    if (!isProcessing) return null;
    const processed = completed_count + failed_count;
    if (processed === 0) return null;
    // Derive elapsed time purely from server timestamps to avoid Date.now() in render
    const updatedAt = batchStatus.updated_at
      ? Date.parse(batchStatus.updated_at)
      : null;
    const createdAt = Date.parse(batchStatus.created_at);
    const elapsedMs = updatedAt ? updatedAt - createdAt : 0;
    if (elapsedMs <= 0) return null;
    const msPerImage = elapsedMs / processed;
    const etaMs = msPerImage * (total_images - processed);
    if (etaMs < 5000) return 'almost done';
    const etaSec = Math.ceil(etaMs / 1000);
    if (etaSec < 60) return `~${etaSec}s remaining`;
    return `~${Math.ceil(etaSec / 60)}m remaining`;
  }, [
    isProcessing,
    completed_count,
    failed_count,
    total_images,
    batchStatus.created_at,
    batchStatus.updated_at,
  ]);
  const isFinished =
    status === 'completed' ||
    status === 'partially_completed' ||
    status === 'failed' ||
    status === 'cancelled';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <StatusIcon
            className={cn(
              'h-5 w-5 shrink-0',
              status === 'processing' && 'text-primary animate-spin',
              status === 'pending' && 'text-muted-foreground',
              status === 'completed' && 'text-green-500',
              status === 'partially_completed' && 'text-amber-500',
              status === 'failed' && 'text-destructive',
              status === 'cancelled' && 'text-muted-foreground'
            )}
          />
          <div>
            <h3 className="font-semibold">Batch Translation</h3>
            <p className="text-muted-foreground text-sm">
              {isProcessing
                ? `Processing ${completed_count + failed_count} of ${total_images} images...`
                : `${completed_count} of ${total_images} completed`}
            </p>
          </div>
        </div>
        <Badge variant={config.variant} className="shrink-0 gap-1.5">
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
          <span className="text-muted-foreground font-medium">
            {completed_count} completed · {failed_count} failed ·{' '}
            {total_images - completed_count - failed_count} remaining
            {estimatedTimeRemaining && (
              <span className="ml-2">· {estimatedTimeRemaining}</span>
            )}
          </span>
          <span className="font-semibold">{progressValue}%</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      {failed_count > 0 && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <XCircle className="h-4 w-4" />
          <span>{failed_count} image(s) failed</span>
        </div>
      )}

      <TooltipProvider>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {images.map(image => {
            const imgConfig = imageStatusConfig[image.status];
            const ImgIcon = imgConfig.icon;
            const isLong = image.original_filename.length > 30;

            return (
              <div
                key={image.image_id}
                className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <ImgIcon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      imgConfig.color,
                      image.status === 'processing' && 'animate-spin'
                    )}
                  />
                  {isLong ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default truncate text-sm">
                          {image.original_filename}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{image.original_filename}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="truncate text-sm">
                      {image.original_filename}
                    </span>
                  )}
                </div>
                {image.error && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-destructive ml-2 cursor-default truncate text-xs">
                        {image.error}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{image.error}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>
      </TooltipProvider>

      {isProcessing && (
        <Button
          variant="destructive"
          className="w-full"
          onClick={onCancel}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            'Cancel Batch'
          )}
        </Button>
      )}

      {isFinished && (
        <p className="text-muted-foreground text-center text-sm">
          Batch{' '}
          {status === 'cancelled' ? 'was cancelled' : 'processing finished'}
        </p>
      )}
    </div>
  );
}
