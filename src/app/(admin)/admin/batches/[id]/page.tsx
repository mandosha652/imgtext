'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Trash2 } from 'lucide-react';
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
import { useAdminBatch, useAdminDeleteBatch } from '@/hooks';

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-yellow-300 text-yellow-600',
  processing: 'border-blue-300 text-blue-600',
  completed: 'border-green-300 text-green-600',
  partially_completed: 'border-orange-300 text-orange-600',
  failed: 'border-red-300 text-red-600',
  cancelled: '',
};

const IMAGE_STATUS_COLORS: Record<string, string> = {
  pending: 'border-yellow-300 text-yellow-600',
  processing: 'border-blue-300 text-blue-600',
  completed: 'border-green-300 text-green-600',
  failed: 'border-red-300 text-red-600',
};

export default function AdminBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: batch, isLoading, error } = useAdminBatch(id);
  const deleteBatch = useAdminDeleteBatch();

  const handleDelete = async () => {
    try {
      await deleteBatch.mutateAsync(id);
      toast.success('Batch deleted');
      router.push('/admin/batches');
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading batch...</p>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <AlertTriangle className="text-destructive h-8 w-8" />
        <p className="text-destructive font-medium">Batch not found</p>
        <Link href="/admin/batches">
          <Button variant="outline" size="sm">
            Back to Batches
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/admin/batches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">Batch Detail</h1>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs break-all">
            {batch.id}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant="outline"
            className={STATUS_COLORS[batch.status] ?? ''}
          >
            {batch.status}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteBatch.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
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
          { label: 'Total Images', value: batch.total_images },
          { label: 'Completed', value: batch.completed_count },
          { label: 'Failed', value: batch.failed_count },
          { label: 'Languages', value: batch.target_languages.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Batch metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Batch Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap justify-between gap-1">
            <span className="text-muted-foreground shrink-0">Tenant ID</span>
            <span className="font-mono text-xs break-all">
              {batch.tenant_id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Source Language</span>
            <span>{batch.source_language}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">
              Target Languages
            </span>
            <span className="text-right">
              {batch.target_languages.join(', ')}
            </span>
          </div>
          {batch.webhook_url && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground shrink-0">
                Webhook URL
              </span>
              <span className="truncate font-mono text-xs">
                {batch.webhook_url}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>
              {format(new Date(batch.created_at), 'MMM d, yyyy HH:mm')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated</span>
            <span>
              {format(new Date(batch.updated_at), 'MMM d, yyyy HH:mm')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Images ({batch.images.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {batch.images.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No images in this batch
            </p>
          ) : (
            <div className="space-y-2">
              {batch.images.map(img => (
                <div
                  key={img.id}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {img.original_filename}
                    </p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {img.id.slice(0, 12)}…
                    </p>
                    {img.error && (
                      <p className="text-destructive mt-0.5 text-xs">
                        {img.error}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {img.translation_count} translation
                      {img.translation_count !== 1 ? 's' : ''}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${IMAGE_STATUS_COLORS[img.status] ?? ''}`}
                    >
                      {img.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
