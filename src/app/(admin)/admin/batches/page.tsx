'use client';

import { useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trash2,
  ExternalLink,
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
import { useAdminBatches, useAdminDeleteBatch } from '@/hooks';
import type { AdminBatchSummary } from '@/types';

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-yellow-300 text-yellow-600',
  processing: 'border-blue-300 text-blue-600',
  completed: 'border-green-300 text-green-600',
  partially_completed: 'border-orange-300 text-orange-600',
  failed: 'border-red-300 text-red-600',
  cancelled: '',
};

function BatchRow({
  batch,
  onDelete,
  isDeleting,
}: {
  batch: AdminBatchSummary;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground truncate font-mono text-xs">
          {batch.id}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-sm">
            {batch.source_language} → {batch.target_languages.join(', ')}
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
        </div>
        <p className="text-muted-foreground mt-0.5 font-mono text-xs">
          tenant: {batch.tenant_id.slice(0, 8)}…
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <Badge
          variant="outline"
          className={`text-xs ${STATUS_COLORS[batch.status] ?? ''}`}
        >
          {batch.status}
        </Badge>
        <span className="text-muted-foreground hidden text-xs sm:block">
          {format(new Date(batch.created_at), 'MMM d, yyyy')}
        </span>
        <Link href={`/admin/batches/${batch.id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground h-8 w-8"
            title="View detail"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
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

  const handleDelete = async (batchId: string) => {
    try {
      await deleteBatch.mutateAsync(batchId);
      toast.success('Batch deleted');
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Batches</h1>
        <p className="text-muted-foreground text-sm">
          {data?.total != null
            ? `${data.total.toLocaleString()} total batches`
            : 'All platform batches'}
        </p>
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
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-16 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <AlertTriangle className="text-destructive h-8 w-8" />
              <p className="text-destructive font-medium">
                Failed to load batches
              </p>
              <p className="text-muted-foreground text-sm">
                Check your admin key and try again
              </p>
            </div>
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              No batches found matching your filters
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data?.items?.map(batch => (
                <BatchRow
                  key={batch.id}
                  batch={batch}
                  onDelete={handleDelete}
                  isDeleting={deleteBatch.isPending}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
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
