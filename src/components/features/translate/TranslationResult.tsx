'use client';

import { useState } from 'react';
import { Download, ExternalLink, Copy, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TranslateResponse } from '@/types';
import { getImageUrl } from '@/lib/utils';
import { CONFIDENCE_THRESHOLD } from '@/lib/constants';
import { ZoomableImage } from './ZoomableImage';
import { TextRegionsPanel } from './TextRegionsPanel';

interface TranslationResultProps {
  result: TranslateResponse;
}

export function TranslationResult({ result }: TranslationResultProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(getImageUrl(url));
    setCopiedUrl(url);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(getImageUrl(url));
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Image downloaded');
    } catch {
      toast.error('Failed to download image');
    }
  };

  const lowConfidenceRegions = result.regions.filter(
    r => r.confidence < CONFIDENCE_THRESHOLD
  );

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle>Translation Result</CardTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              {lowConfidenceRegions.length > 0 && (
                <Badge variant="outline" className="gap-1 text-amber-600">
                  <Info className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {lowConfidenceRegions.length} low-confidence region
                    {lowConfidenceRegions.length !== 1 ? 's' : ''}
                  </span>
                  <span className="sm:hidden">
                    {lowConfidenceRegions.length} low-conf.
                  </span>
                </Badge>
              )}
              {result.detected_source_lang && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="uppercase">
                      {result.detected_source_lang}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>Auto-detected source language</TooltipContent>
                </Tooltip>
              )}
              <Badge variant="secondary">
                {(result.processing_time_ms / 1000).toFixed(1)}s
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="translated" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="translated">Translated</TabsTrigger>
              <TabsTrigger value="original">Original</TabsTrigger>
              <TabsTrigger value="clean">
                <span className="sm:hidden">Cleaned</span>
                <span className="hidden sm:inline">Text Removed</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="translated" className="mt-4">
              <div className="space-y-4">
                <ZoomableImage
                  src={getImageUrl(result.translated_image_url)}
                  alt="Translated"
                  priority
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      downloadImage(
                        result.translated_image_url,
                        'translated.png'
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={
                      copiedUrl === result.translated_image_url
                        ? 'Copied'
                        : 'Copy URL'
                    }
                    onClick={() => copyUrl(result.translated_image_url)}
                  >
                    {copiedUrl === result.translated_image_url ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={getImageUrl(result.translated_image_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="original" className="mt-4">
              <div className="space-y-4">
                <ZoomableImage
                  src={getImageUrl(result.original_image_url)}
                  alt="Original"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadImage(result.original_image_url, 'original.png')
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clean" className="mt-4">
              {result.clean_image_url ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Original text has been removed via inpainting — the
                    background is reconstructed where text was. Useful as a
                    clean base for custom overlays.
                  </p>
                  <ZoomableImage
                    src={getImageUrl(result.clean_image_url)}
                    alt="Text removed"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        downloadImage(
                          result.clean_image_url!,
                          'text-removed.png'
                        )
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground py-8 text-center">
                  Text-removed image not available
                </p>
              )}
            </TabsContent>
          </Tabs>

          <TextRegionsPanel
            regions={result.regions}
            lowConfidenceRegions={lowConfidenceRegions}
          />
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
