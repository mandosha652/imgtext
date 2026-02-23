'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import JSZip from 'jszip';
import { format } from 'date-fns';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Loader2,
  RefreshCw,
  AlertCircle,
  Ban,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BatchStatusResponse, BatchStatus, ImageResult } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { cn, getImageUrl } from '@/lib/utils';
import { useRetryBatchImage } from '@/hooks';

interface BatchResultsProps {
  batchStatus: BatchStatusResponse;
}

function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
}

const statusConfig: Record<
  BatchStatus,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  pending: { label: 'Pending', color: 'text-muted-foreground', icon: Loader2 },
  processing: { label: 'Processing', color: 'text-primary', icon: Loader2 },
  completed: {
    label: 'Completed',
    color: 'text-green-500',
    icon: CheckCircle2,
  },
  partially_completed: {
    label: 'Partial',
    color: 'text-amber-500',
    icon: AlertCircle,
  },
  failed: { label: 'Failed', color: 'text-destructive', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', icon: Ban },
};

function ImageResultCard({
  image,
  onRetry,
  isRetrying,
}: {
  image: ImageResult;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const successfulTranslations = image.translations.filter(
    t => t.status === 'completed' && t.translated_image_url
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex min-w-0 items-start gap-3 p-4">
          {image.original_image_url ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={getImageUrl(image.original_image_url)}
                alt={image.original_filename}
                fill
                className="object-cover"
                unoptimized
                loading="lazy"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border">
              <span className="text-muted-foreground text-xs">No img</span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">
                {image.original_filename}
              </p>
              {image.status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              ) : image.status === 'failed' ? (
                <XCircle className="text-destructive h-4 w-4 shrink-0" />
              ) : null}
            </div>

            {image.error ? (
              <div className="mt-1 flex items-center gap-2">
                <p className="text-destructive text-xs">
                  {image.error.includes('429') ||
                  image.error.toLowerCase().includes('throttl')
                    ? 'Rate limited — too many requests'
                    : image.error.includes('ReplicateError')
                      ? 'Processing failed'
                      : image.error.length > 80
                        ? image.error.slice(0, 80) + '…'
                        : image.error}
                </p>
                {onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-xs"
                    onClick={onRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Retry
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mt-0.5 text-xs">
                {successfulTranslations.length} translation
                {successfulTranslations.length !== 1 ? 's' : ''} ready
              </p>
            )}

            {successfulTranslations.length > 0 && (
              <button
                className="focus-visible:ring-ring/50 mt-2 flex cursor-pointer items-center gap-1 text-xs text-blue-500 hover:text-blue-600 focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Hide' : 'View translations'}
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform duration-200',
                    expanded && 'rotate-180'
                  )}
                />
              </button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && successfulTranslations.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-muted/30 border-t px-4 py-3">
                <div className="space-y-2">
                  {successfulTranslations.map(translation => (
                    <div
                      key={translation.target_lang}
                      className="flex items-center justify-between gap-3"
                    >
                      <Badge variant="outline" className="text-xs">
                        {getLanguageName(translation.target_lang)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-sm" asChild>
                              <a
                                href={getImageUrl(
                                  translation.translated_image_url!
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open in new tab"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Open in new tab</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon-sm" asChild>
                              <a
                                href={getImageUrl(
                                  translation.translated_image_url!
                                )}
                                download={`${image.original_filename.split('.')[0]}_${translation.target_lang}.png`}
                                aria-label="Download image"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download image</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export function BatchResults({ batchStatus }: BatchResultsProps) {
  const {
    images,
    completed_count,
    failed_count,
    target_languages,
    created_at,
    status,
  } = batchStatus;

  const [expanded, setExpanded] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const retryImage = useRetryBatchImage();
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formattedDate = format(new Date(created_at), 'MMM d, HH:mm');

  const completedImages = images.filter(img => img.status === 'completed');
  const failedImages = images.filter(img => img.status === 'failed');

  const handleRetry = async (imageId: string) => {
    try {
      await retryImage.mutateAsync({ batchId: batchStatus.batch_id, imageId });
      toast.success('Retry queued');
    } catch {
      toast.error('Failed to retry image');
    }
  };

  const handleDownloadAll = async () => {
    const allTranslations = completedImages.flatMap(img =>
      img.translations
        .filter(t => t.status === 'completed' && t.translated_image_url)
        .map(t => ({
          url: getImageUrl(t.translated_image_url!),
          filename: `${img.original_filename.replace(/\.[^.]+$/, '')}_${t.target_lang}.png`,
        }))
    );

    if (allTranslations.length === 0) {
      toast.error('No completed translations to download');
      return;
    }

    setIsZipping(true);
    try {
      const zip = new JSZip();
      await Promise.all(
        allTranslations.map(async ({ url, filename }) => {
          const res = await fetch(url);
          const blob = await res.blob();
          zip.file(filename, blob);
        })
      );
      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `batch-${batchStatus.batch_id.slice(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success(`Downloaded ${allTranslations.length} images as ZIP`);
    } catch {
      toast.error('Failed to create ZIP — try downloading individually');
    } finally {
      if (mountedRef.current) setIsZipping(false);
    }
  };

  return (
    <Card>
      {/* Summary header — always visible, click to expand/collapse */}
      <CardHeader className="pb-0">
        <button
          className="focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-4 text-left focus-visible:ring-2 focus-visible:outline-none"
          onClick={() => setExpanded(!expanded)}
        >
          <StatusIcon
            className={cn(
              'h-4 w-4 shrink-0',
              config.color,
              status === 'processing' && 'animate-spin'
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{config.label}</span>
              <span className="text-muted-foreground text-sm">
                {completed_count}/{batchStatus.total_images} images
              </span>
              {failed_count > 0 && (
                <span className="text-destructive text-sm">
                  · {failed_count} failed
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-muted-foreground shrink-0 text-xs">
                {formattedDate}
              </span>
              <span className="text-muted-foreground shrink-0 text-xs">·</span>
              <span className="text-muted-foreground min-w-0 truncate text-xs">
                {target_languages.map(getLanguageName).join(', ')}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {completed_count > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  handleDownloadAll();
                }}
                disabled={isZipping}
                className="h-7 text-xs"
              >
                {isZipping ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3 w-3" />
                )}
                {isZipping ? 'Zipping…' : 'ZIP'}
              </Button>
            )}
            <ChevronDown
              className={cn(
                'text-muted-foreground h-4 w-4 transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          </div>
        </button>
      </CardHeader>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardContent className="pt-4">
              {completedImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Completed ({completedImages.length})
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {completedImages.map(image => (
                      <ImageResultCard key={image.image_id} image={image} />
                    ))}
                  </div>
                </div>
              )}

              {failedImages.length > 0 && (
                <div
                  className={cn(
                    'space-y-3',
                    completedImages.length > 0 && 'mt-5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Failed ({failedImages.length})
                    </p>
                    {failedImages.length > 1 && (
                      <button
                        onClick={() =>
                          failedImages.forEach(img => handleRetry(img.image_id))
                        }
                        disabled={retryImage.isPending}
                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1.5 rounded text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry all
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {failedImages.map(image => (
                      <ImageResultCard
                        key={image.image_id}
                        image={image}
                        onRetry={() => handleRetry(image.image_id)}
                        isRetrying={
                          retryImage.isPending &&
                          retryImage.variables?.imageId === image.image_id
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end border-t pt-3">
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View in History →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
