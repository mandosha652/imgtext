'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Download,
  ExternalLink,
  Copy,
  Check,
  Info,
  ChevronDown,
} from 'lucide-react';
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
import { cn, getImageUrl } from '@/lib/utils';
import { CONFIDENCE_THRESHOLD } from '@/lib/constants';

interface ZoomableImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

function ZoomableImage({ src, alt, priority }: ZoomableImageProps) {
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const lastDistRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const getMidpoint = (touches: React.TouchList, rect: DOMRect) => ({
    x:
      (((touches[0].clientX + touches[1].clientX) / 2 - rect.left) /
        rect.width) *
      100,
    y:
      (((touches[0].clientY + touches[1].clientY) / 2 - rect.top) /
        rect.height) *
      100,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastDistRef.current = getDistance(e.touches);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || lastDistRef.current === null) return;
    e.preventDefault();
    const dist = getDistance(e.touches);
    const delta = dist / lastDistRef.current;
    lastDistRef.current = dist;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setOrigin(getMidpoint(e.touches, rect));
    }
    setScale(s => Math.min(Math.max(s * delta, 1), 4));
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastDistRef.current = null;
    }
  }, []);

  const handleDoubleClick = useCallback(() => {
    setScale(s => (s > 1 ? 1 : 2));
    setOrigin({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-muted relative aspect-video touch-none overflow-hidden rounded-lg border"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain transition-transform duration-100 will-change-transform"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${origin.x}% ${origin.y}%`,
        }}
        unoptimized
        priority={priority}
      />
      {scale > 1 && (
        <button
          onClick={() => {
            setScale(1);
            setOrigin({ x: 50, y: 50 });
          }}
          aria-label="Reset zoom"
          className="absolute right-2 bottom-2 rounded bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm"
        >
          Reset zoom
        </button>
      )}
    </div>
  );
}

interface TranslationResultProps {
  result: TranslateResponse;
}

export function TranslationResult({ result }: TranslationResultProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedRegion, setCopiedRegion] = useState<string | null>(null);
  const [showRegions, setShowRegions] = useState(false);

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(getImageUrl(url));
    setCopiedUrl(url);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const copyRegionText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedRegion(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedRegion(null), 2000);
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
          <div className="flex items-center justify-between">
            <CardTitle>Translation Result</CardTitle>
            <div className="flex items-center gap-2">
              {lowConfidenceRegions.length > 0 && (
                <Badge variant="outline" className="gap-1 text-amber-600">
                  <Info className="h-3 w-3" />
                  {lowConfidenceRegions.length} low-confidence region
                  {lowConfidenceRegions.length !== 1 ? 's' : ''}
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

          {/* Detected text regions — collapsed by default */}
          {result.regions.length > 0 && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setShowRegions(v => !v)}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1.5 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    showRegions && 'rotate-180'
                  )}
                />
                {showRegions ? 'Hide' : 'Show'} text regions (
                {result.regions.length})
              </button>
              {showRegions && (
                <>
                  <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border p-3">
                    {result.regions.map(region => (
                      <div
                        key={region.id}
                        className="bg-muted rounded p-2 text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <p className="font-medium">
                                {region.original_text}
                              </p>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() =>
                                      copyRegionText(
                                        region.original_text,
                                        `orig-${region.id}`
                                      )
                                    }
                                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 shrink-0 cursor-pointer rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                  >
                                    {copiedRegion === `orig-${region.id}` ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Copy original</TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="flex items-center gap-1">
                              <p className="text-muted-foreground">
                                → {region.translated_text}
                              </p>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() =>
                                      copyRegionText(
                                        region.translated_text,
                                        `trans-${region.id}`
                                      )
                                    }
                                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 shrink-0 cursor-pointer rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                  >
                                    {copiedRegion === `trans-${region.id}` ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Copy translation
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant={
                                  region.confidence >= CONFIDENCE_THRESHOLD
                                    ? 'outline'
                                    : 'secondary'
                                }
                                className={`shrink-0 cursor-default text-xs ${region.confidence < CONFIDENCE_THRESHOLD ? 'text-amber-600' : ''}`}
                              >
                                {Math.round(region.confidence * 100)}%
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              OCR confidence score — higher means the text was
                              recognised more reliably
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                  {lowConfidenceRegions.length > 0 && (
                    <p className="text-muted-foreground flex items-center gap-1 text-xs">
                      <Info className="h-3 w-3 text-amber-500" />
                      Regions below 70% confidence may have OCR errors — verify
                      manually if accuracy is critical
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
