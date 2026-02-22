'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Clock, Download, ExternalLink, ChevronDown } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import type { SingleTranslationRecord } from '@/types';
import { getLangName, formatDate, downloadFile } from './utils';

interface SingleCardProps {
  item: SingleTranslationRecord;
}

export function SingleCard({ item }: SingleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group bg-card overflow-hidden rounded-xl border transition-shadow hover:shadow-sm">
      <button
        className="focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-3 p-4 text-left focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border">
          <Image
            src={getImageUrl(item.original_image_url)}
            alt="original"
            fill
            className="object-cover"
            unoptimized
            loading="lazy"
            sizes="48px"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="truncate text-sm font-medium">
            {item.source_lang ? `${getLangName(item.source_lang)} → ` : ''}
            {getLangName(item.target_lang)}
          </span>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {formatDate(item.created_at)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <a
            href={getImageUrl(item.translated_image_url)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open translated image"
            title="Open translated image"
            onClick={e => e.stopPropagation()}
            className="focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            aria-label="Download translated image"
            title="Download translated image"
            onClick={e => {
              e.stopPropagation();
              downloadFile(
                getImageUrl(item.translated_image_url),
                `translated-${item.target_lang}.png`
              );
            }}
            className="focus-visible:ring-ring/50 text-muted-foreground hover:text-foreground cursor-pointer rounded p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 pt-3 pb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Original
              </p>
              <div className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={getImageUrl(item.original_image_url)}
                  alt="Original"
                  fill
                  className="object-contain"
                  unoptimized
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <button
                onClick={() =>
                  downloadFile(item.original_image_url, 'original.png')
                }
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {getLangName(item.target_lang)}
              </p>
              <div className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={getImageUrl(item.translated_image_url)}
                  alt="Translated"
                  fill
                  className="object-contain"
                  unoptimized
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <button
                onClick={() =>
                  downloadFile(
                    getImageUrl(item.translated_image_url),
                    `translated-${item.target_lang}.png`
                  )
                }
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
