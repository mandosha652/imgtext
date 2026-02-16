'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { TranslateResponse } from '@/types';
import { getImageUrl } from '@/lib/utils';

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Translation Result</CardTitle>
          <Badge variant="secondary">
            {result.processing_time_ms.toFixed(0)}ms
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="translated" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="translated">Translated</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger value="clean">Clean</TabsTrigger>
          </TabsList>

          <TabsContent value="translated" className="mt-4">
            <div className="space-y-4">
              <div className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={getImageUrl(result.translated_image_url)}
                  alt="Translated"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadImage(result.translated_image_url, 'translated.png')
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyUrl(result.translated_image_url)}
                >
                  {copiedUrl === result.translated_image_url ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  Copy URL
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={getImageUrl(result.translated_image_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="original" className="mt-4">
            <div className="space-y-4">
              <div className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={getImageUrl(result.original_image_url)}
                  alt="Original"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
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
                <div className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
                  <Image
                    src={getImageUrl(result.clean_image_url)}
                    alt="Clean"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadImage(result.clean_image_url!, 'clean.png')
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                Clean image not available
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
