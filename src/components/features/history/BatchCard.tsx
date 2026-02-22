'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, Download, ChevronDown, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn, getImageUrl } from '@/lib/utils';
import type { BatchStatusResponse } from '@/types';
import { useRetryBatchImage } from '@/hooks';
import { getLangName, formatDate } from './utils';
import { BatchImageTile } from './BatchImageTile';

interface BatchCardProps {
  batch: BatchStatusResponse;
}

const statusConfig = {
  completed: { label: 'Completed', color: 'text-green-500' },
  partially_completed: { label: 'Partial', color: 'text-amber-500' },
  failed: { label: 'Failed', color: 'text-destructive' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground' },
  pending: { label: 'Pending', color: 'text-muted-foreground' },
  processing: { label: 'Processing', color: 'text-primary' },
} as const;

export function BatchCard({ batch }: BatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const retryImage = useRetryBatchImage();

  const cfg = statusConfig[batch.status];
  const langList = batch.target_languages.map(getLangName).join(', ');
  const completedImages = batch.images.filter(i => i.status === 'completed');
  const failedImages = batch.images.filter(i => i.status === 'failed');

  const handleDownloadAll = async () => {
    const all = completedImages.flatMap(img =>
      img.translations
        .filter(t => t.status === 'completed' && t.translated_image_url)
        .map(t => ({
          url: getImageUrl(t.translated_image_url!),
          filename: `${img.original_filename.replace(/\.[^.]+$/, '')}_${t.target_lang}.png`,
        }))
    );
    if (!all.length) {
      toast.error('Nothing to download');
      return;
    }

    setIsZipping(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      await Promise.all(
        all.map(async ({ url, filename }) => {
          const res = await fetch(url);
          zip.file(filename, await res.blob());
        })
      );
      const blob = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `batch-${batch.batch_id.slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success(`Downloaded ${all.length} images`);
    } catch {
      toast.error('ZIP failed — try downloading individually');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="bg-card overflow-hidden rounded-xl border transition-shadow hover:shadow-sm">
      <div
        role="button"
        tabIndex={0}
        className="focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-4 p-4 text-left focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => setExpanded(v => !v)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v);
        }}
      >
        {/* 2×2 thumbnail grid */}
        <div className="bg-muted grid h-12 w-12 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-lg border">
          {batch.images.slice(0, 4).map((img, i) =>
            img.original_image_url ? (
              <div key={i} className="relative overflow-hidden">
                <Image
                  src={getImageUrl(img.original_image_url)}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                  loading="lazy"
                  sizes="24px"
                />
              </div>
            ) : (
              <div key={i} className="bg-muted-foreground/10" />
            )
          )}
        </div>

        {/* Meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-semibold', cfg.color)}>
              {cfg.label}
            </span>
            <span className="text-muted-foreground text-sm">
              {batch.completed_count}/{batch.total_images} images
            </span>
            {batch.failed_count > 0 && (
              <span className="text-destructive text-xs">
                · {batch.failed_count} failed
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">
            <Clock className="mr-1 inline h-3 w-3" />
            {formatDate(batch.created_at)} · {langList}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {completedImages.length > 0 && (
            <button
              onClick={e => {
                e.stopPropagation();
                handleDownloadAll();
              }}
              disabled={isZipping}
              title="Download all as ZIP"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
            >
              {isZipping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
          )}
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </div>

      {expanded && (
        <div className="space-y-5 border-t px-4 pt-3 pb-4">
          {completedImages.length > 0 && (
            <div className="space-y-3">
              {failedImages.length > 0 && (
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Completed ({completedImages.length})
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {completedImages.map(img => (
                  <BatchImageTile
                    key={img.image_id}
                    image={img}
                    onRetry={() =>
                      retryImage.mutate({
                        batchId: batch.batch_id,
                        imageId: img.image_id,
                      })
                    }
                    isRetrying={
                      retryImage.isPending &&
                      retryImage.variables?.imageId === img.image_id
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {failedImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Failed ({failedImages.length})
                </p>
                {failedImages.length > 1 && (
                  <button
                    onClick={() =>
                      failedImages.forEach(img =>
                        retryImage.mutate({
                          batchId: batch.batch_id,
                          imageId: img.image_id,
                        })
                      )
                    }
                    disabled={retryImage.isPending}
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                  >
                    <RefreshCw className="h-3 w-3" /> Retry all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {failedImages.map(img => (
                  <BatchImageTile
                    key={img.image_id}
                    image={img}
                    onRetry={() =>
                      retryImage.mutate({
                        batchId: batch.batch_id,
                        imageId: img.image_id,
                      })
                    }
                    isRetrying={
                      retryImage.isPending &&
                      retryImage.variables?.imageId === img.image_id
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
