'use client';

import Image from 'next/image';
import {
  Loader2,
  RefreshCw,
  XCircle,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
} from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import type { ImageResult } from '@/types';
import { getLangName } from './utils';

interface BatchImageTileProps {
  image: ImageResult;
  onRetry: () => void;
  isRetrying: boolean;
}

export function BatchImageTile({
  image,
  onRetry,
  isRetrying,
}: BatchImageTileProps) {
  const done = image.translations.filter(
    t => t.status === 'completed' && t.translated_image_url
  );
  const failed = image.status === 'failed';

  return (
    <div
      className={cn(
        'bg-card overflow-hidden rounded-xl border',
        failed && 'border-destructive/30'
      )}
    >
      <div className="bg-muted relative aspect-square">
        {image.original_image_url ? (
          <Image
            src={getImageUrl(image.original_image_url)}
            alt={image.original_filename}
            fill
            className="object-cover"
            unoptimized
            loading="lazy"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="text-muted-foreground h-8 w-8" />
          </div>
        )}

        <div className="absolute top-2 right-2">
          {failed ? (
            <div className="bg-destructive rounded-full p-0.5">
              <XCircle className="h-3.5 w-3.5 text-white" />
            </div>
          ) : (
            <div className="rounded-full bg-green-500 p-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
      </div>

      <div className="p-2.5">
        <p
          className="mb-2 truncate text-xs font-medium"
          title={image.original_filename}
        >
          {image.original_filename}
        </p>

        {failed ? (
          <div className="flex items-center justify-between gap-1">
            <p className="text-destructive truncate text-xs">
              {image.error?.includes('429') ? 'Rate limited' : 'Failed'}
            </p>
            <button
              onClick={onRetry}
              disabled={isRetrying}
              title="Retry"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 cursor-pointer rounded p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
            >
              {isRetrying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {done.map(t => (
              <a
                key={t.target_lang}
                href={getImageUrl(t.translated_image_url!)}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${getLangName(t.target_lang)}`}
                className="hover:bg-muted inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs transition-colors"
              >
                {getLangName(t.target_lang)}
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
