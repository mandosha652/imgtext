'use client';

import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  Trash2,
  XCircle,
  RotateCcw,
  Globe,
  Calendar,
  Clock,
  Layers,
  Image as ImageIcon,
  Languages,
  Webhook,
  UserCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useRouter } from 'next/navigation';
import {
  useAdminBatch,
  useAdminDeleteBatch,
  useAdminCancelBatch,
  useAdminRetryBatch,
  useAdminRetryImage,
} from '@/hooks';

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    className:
      'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  processing: {
    label: 'Processing',
    className:
      'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    dot: 'bg-blue-500 animate-pulse',
  },
  completed: {
    label: 'Completed',
    className:
      'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  partially_completed: {
    label: 'Partial',
    className:
      'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  failed: {
    label: 'Failed',
    className:
      'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-400',
    dot: 'bg-red-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-border text-muted-foreground',
    dot: 'bg-muted-foreground/30',
  },
};

const IMAGE_STATUS_CONFIG: Record<string, { className: string; dot: string }> =
  {
    pending: {
      className: 'border-yellow-300 text-yellow-600',
      dot: 'bg-yellow-500',
    },
    processing: {
      className: 'border-blue-300 text-blue-600',
      dot: 'bg-blue-500 animate-pulse',
    },
    completed: {
      className: 'border-emerald-300 text-emerald-600',
      dot: 'bg-emerald-500',
    },
    failed: { className: 'border-red-300 text-red-600', dot: 'bg-red-500' },
  };

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-xs ${config?.className ?? ''}`}>
      {config?.label ?? status}
    </Badge>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-2 text-sm last:border-0">
      <div className="text-muted-foreground flex w-28 shrink-0 items-center gap-1.5 sm:w-36">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="min-w-0 flex-1 text-right">{value}</div>
    </div>
  );
}

export default function AdminBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: batch, isLoading, error, refetch } = useAdminBatch(id);
  const deleteBatch = useAdminDeleteBatch();
  const cancelBatch = useAdminCancelBatch();
  const retryBatch = useAdminRetryBatch();
  const retryImage = useAdminRetryImage();

  const handleDelete = async () => {
    try {
      await deleteBatch.mutateAsync(id);
      toast.success('Batch deleted');
      router.push('/admin/batches');
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBatch.mutateAsync(id);
      toast.success('Batch cancelled');
      refetch();
    } catch {
      toast.error('Failed to cancel batch');
    }
  };

  const handleRetry = async () => {
    try {
      await retryBatch.mutateAsync(id);
      toast.success('Batch queued for retry');
    } catch {
      toast.error('Failed to retry batch');
    }
  };

  const handleRetryImage = async (imageId: string) => {
    try {
      await retryImage.mutateAsync(imageId);
      toast.success('Image queued for retry');
      refetch();
    } catch {
      toast.error('Failed to retry image');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
          <div>
            <div className="bg-muted mb-1.5 h-6 w-48 animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-80 animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="bg-destructive/10 rounded-full p-3">
          <AlertTriangle className="text-destructive h-5 w-5" />
        </div>
        <p className="text-destructive font-semibold">Batch not found</p>
        <Link href="/admin/batches">
          <Button variant="outline" size="sm">
            Back to Batches
          </Button>
        </Link>
      </div>
    );
  }

  const canCancel = batch.status === 'pending' || batch.status === 'processing';
  const canRetry =
    batch.status === 'failed' ||
    batch.status === 'partially_completed' ||
    batch.status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/admin/batches" className="mt-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Batch Detail</h1>
            <StatusBadge status={batch.status} />
          </div>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs break-all">
            {batch.id}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={cancelBatch.isPending}
              className="gap-1.5 border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
            >
              <XCircle className="h-3.5 w-3.5" />
              {cancelBatch.isPending ? 'Cancelling...' : 'Cancel'}
            </Button>
          )}
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retryBatch.isPending}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {retryBatch.isPending ? 'Queuing...' : 'Retry'}
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteBatch.isPending}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
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
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Images', value: batch.total_images, icon: ImageIcon },
          { label: 'Completed', value: batch.completed_count, icon: Layers },
          {
            label: 'Failed',
            value: batch.failed_count,
            icon: AlertTriangle,
            highlight: batch.failed_count > 0,
          },
          {
            label: 'Languages',
            value: batch.target_languages.length,
            icon: Languages,
          },
        ].map(({ label, value, icon: Icon, highlight }) => (
          <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
            <Icon
              className={`mx-auto mb-1 h-4 w-4 ${highlight ? 'text-red-500' : 'text-muted-foreground'}`}
            />
            <p
              className={`text-xl font-bold tabular-nums ${highlight ? 'text-red-500' : ''}`}
            >
              {value}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Batch metadata */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Batch Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow
              label="Tenant ID"
              icon={UserCircle2}
              value={
                <Link
                  href={`/admin/users/${batch.tenant_id}`}
                  className="text-muted-foreground hover:text-foreground font-mono text-xs break-all transition-colors"
                >
                  {batch.tenant_id}
                </Link>
              }
            />
            <InfoRow
              label="Source Language"
              icon={Globe}
              value={
                <span className="font-medium">{batch.source_language}</span>
              }
            />
            <InfoRow
              label="Target Languages"
              icon={Languages}
              value={
                <div className="flex flex-wrap justify-end gap-1">
                  {batch.target_languages.map(lang => (
                    <span
                      key={lang}
                      className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              }
            />
            {batch.webhook_url && (
              <InfoRow
                label="Webhook"
                icon={Webhook}
                value={
                  <span className="text-muted-foreground max-w-40 min-w-0 truncate font-mono text-xs sm:max-w-60">
                    {batch.webhook_url}
                  </span>
                }
              />
            )}
            <InfoRow
              label="Created"
              icon={Calendar}
              value={format(new Date(batch.created_at), 'MMM d, yyyy HH:mm')}
            />
            <InfoRow
              label="Updated"
              icon={Clock}
              value={format(new Date(batch.updated_at), 'MMM d, yyyy HH:mm')}
            />
          </CardContent>
        </Card>

        {/* Progress breakdown if partial/failed */}
        {(batch.failed_count > 0 || batch.status === 'partially_completed') && (
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-600">
                Processing Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                    <span>Progress</span>
                    <span>
                      {batch.completed_count} / {batch.total_images}
                    </span>
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${batch.total_images > 0 ? (batch.completed_count / batch.total_images) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                {batch.failed_count > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                      <span>Failed</span>
                      <span className="text-red-500">
                        {batch.failed_count} / {batch.total_images}
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-red-500 transition-all"
                        style={{
                          width: `${batch.total_images > 0 ? (batch.failed_count / batch.total_images) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Images */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Images{' '}
            <span className="text-muted-foreground font-normal">
              ({batch.images.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {batch.images.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <ImageIcon className="text-muted-foreground/40 h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                No images in this batch
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {batch.images.map(img => {
                const imgConfig = IMAGE_STATUS_CONFIG[img.status];
                return (
                  <div
                    key={img.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${img.status === 'failed' ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' : ''}`}
                  >
                    {/* Status dot */}
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${imgConfig?.dot ?? 'bg-muted-foreground/30'}`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {img.original_filename}
                      </p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {img.id.slice(0, 16)}…
                      </p>
                      {img.error && (
                        <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                          {img.error}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-muted-foreground hidden text-xs tabular-nums sm:inline">
                        {img.translation_count} translation
                        {img.translation_count !== 1 ? 's' : ''}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${imgConfig?.className ?? ''}`}
                      >
                        {img.status}
                      </Badge>
                      {img.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground h-7 w-7 hover:text-blue-500"
                          title="Retry image"
                          disabled={retryImage.isPending}
                          onClick={() => handleRetryImage(img.id)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
