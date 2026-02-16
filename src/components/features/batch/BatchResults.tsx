'use client';

import { useState } from 'react';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BatchStatusResponse, ImageResult } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/types';
import { getImageUrl } from '@/lib/utils';

interface BatchResultsProps {
  batchStatus: BatchStatusResponse;
}

function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
}

function ImageResultCard({ image }: { image: ImageResult }) {
  const [expanded, setExpanded] = useState(false);

  const successfulTranslations = image.translations.filter(
    t => t.status === 'completed' && t.translated_image_url
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start gap-3 p-4">
          {image.original_image_url ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
              <Image
                src={getImageUrl(image.original_image_url)}
                alt={image.original_filename}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-medium">{image.original_filename}</p>
              {image.status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              ) : image.status === 'failed' ? (
                <XCircle className="text-destructive h-4 w-4 shrink-0" />
              ) : null}
            </div>

            {image.error ? (
              <p className="text-destructive mt-1 text-sm">{image.error}</p>
            ) : (
              <p className="text-muted-foreground mt-1 text-sm">
                {successfulTranslations.length} translation(s) ready
              </p>
            )}

            {successfulTranslations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-auto gap-1 p-0 text-sm"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    Hide translations <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    View translations <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {expanded && successfulTranslations.length > 0 && (
          <div className="bg-muted/30 border-t p-4">
            <div className="space-y-3">
              {successfulTranslations.map(translation => (
                <div
                  key={translation.target_lang}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getLanguageName(translation.target_lang)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={getImageUrl(translation.translated_image_url!)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={getImageUrl(translation.translated_image_url!)}
                        download={`${image.original_filename.split('.')[0]}_${translation.target_lang}.png`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BatchResults({ batchStatus }: BatchResultsProps) {
  const { images, completed_count, failed_count, target_languages } =
    batchStatus;

  const completedImages = images.filter(img => img.status === 'completed');
  const failedImages = images.filter(img => img.status === 'failed');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-500">
                {completed_count}
              </p>
              <p className="text-muted-foreground text-sm">Completed</p>
            </div>
            <div>
              <p className="text-destructive text-2xl font-bold">
                {failed_count}
              </p>
              <p className="text-muted-foreground text-sm">Failed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{target_languages.length}</p>
              <p className="text-muted-foreground text-sm">Languages</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {target_languages.map(lang => (
              <Badge key={lang} variant="secondary">
                {getLanguageName(lang)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {completedImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Completed ({completedImages.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {completedImages.map(image => (
              <ImageResultCard key={image.image_id} image={image} />
            ))}
          </div>
        </div>
      )}

      {failedImages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-destructive font-medium">
            Failed ({failedImages.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {failedImages.map(image => (
              <ImageResultCard key={image.image_id} image={image} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
