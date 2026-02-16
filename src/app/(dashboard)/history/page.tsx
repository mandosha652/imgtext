'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
  Clock,
  Download,
  Trash2,
  Languages,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { historyStorage, type HistoryItem } from '@/lib/utils/historyStorage';
import { SUPPORTED_LANGUAGES } from '@/types';
import { getImageUrl } from '@/lib/utils';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    historyStorage.getHistory()
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      historyStorage.clearHistory();
      setHistory([]);
      toast.success('History cleared');
    }
  };

  const handleDelete = (id: string) => {
    historyStorage.deleteItem(id);
    setHistory(historyStorage.getHistory());
    toast.success('Item deleted');
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const singleHistory = history.filter(item => item.type === 'single');
  const batchHistory = history.filter(item => item.type === 'batch');

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation History</h1>
          <p className="text-muted-foreground mt-2">
            View your past translations and batch jobs
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="destructive" onClick={handleClearAll}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                <Clock className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="mt-4 font-medium">No translations yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Your translation history will appear here after you translate
                your first image.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All ({history.length})</TabsTrigger>
            <TabsTrigger value="single">
              <Languages className="mr-2 h-4 w-4" />
              Single ({singleHistory.length})
            </TabsTrigger>
            <TabsTrigger value="batch">
              <Layers className="mr-2 h-4 w-4" />
              Batch ({batchHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {history.map(item => (
              <HistoryCard
                key={item.id}
                item={item}
                isExpanded={expandedIds.has(item.id)}
                onToggle={() => toggleExpand(item.id)}
                onDelete={() => handleDelete(item.id)}
                getLanguageName={getLanguageName}
                formatDate={formatDate}
                downloadImage={downloadImage}
              />
            ))}
          </TabsContent>

          <TabsContent value="single" className="space-y-4">
            {singleHistory.length === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground py-12 text-center">
                  No single translations yet
                </CardContent>
              </Card>
            ) : (
              singleHistory.map(item => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedIds.has(item.id)}
                  onToggle={() => toggleExpand(item.id)}
                  onDelete={() => handleDelete(item.id)}
                  getLanguageName={getLanguageName}
                  formatDate={formatDate}
                  downloadImage={downloadImage}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="batch" className="space-y-4">
            {batchHistory.length === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground py-12 text-center">
                  No batch translations yet
                </CardContent>
              </Card>
            ) : (
              batchHistory.map(item => (
                <HistoryCard
                  key={item.id}
                  item={item}
                  isExpanded={expandedIds.has(item.id)}
                  onToggle={() => toggleExpand(item.id)}
                  onDelete={() => handleDelete(item.id)}
                  getLanguageName={getLanguageName}
                  formatDate={formatDate}
                  downloadImage={downloadImage}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

interface HistoryCardProps {
  item: HistoryItem;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  getLanguageName: (code: string) => string;
  formatDate: (date: string) => string;
  downloadImage: (url: string, filename: string) => void;
}

function HistoryCard({
  item,
  isExpanded,
  onToggle,
  onDelete,
  getLanguageName,
  formatDate,
  downloadImage,
}: HistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {item.type === 'single' ? (
                <Languages className="text-primary h-4 w-4" />
              ) : (
                <Layers className="text-primary h-4 w-4" />
              )}
              <CardTitle className="text-lg">
                {item.type === 'single'
                  ? 'Single Translation'
                  : 'Batch Translation'}
              </CardTitle>
              {item.type === 'batch' && item.batchResult && (
                <Badge
                  variant={
                    item.batchResult.status === 'completed'
                      ? 'default'
                      : item.batchResult.status === 'partially_completed'
                        ? 'secondary'
                        : item.batchResult.status === 'failed'
                          ? 'destructive'
                          : 'outline'
                  }
                >
                  {item.batchResult.status}
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">
              <Clock className="mr-1 inline h-3 w-3" />
              {formatDate(item.timestamp)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onToggle}>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {item.type === 'single' && item.result && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Original Image</p>
                  <div className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={getImageUrl(item.result.original_image_url)}
                      alt="Original"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      downloadImage(
                        item.result!.original_image_url,
                        'original.png'
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Translated ({getLanguageName(item.targetLang!)})
                  </p>
                  <div className="bg-muted relative aspect-video overflow-hidden rounded-lg border">
                    <Image
                      src={getImageUrl(item.result.translated_image_url)}
                      alt="Translated"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      downloadImage(
                        item.result!.translated_image_url,
                        `translated-${item.targetLang}.png`
                      )
                    }
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Detected Text Regions</p>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {item.result.regions.map(region => (
                    <div
                      key={region.id}
                      className="bg-muted rounded p-2 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{region.original_text}</p>
                          <p className="text-muted-foreground">
                            → {region.translated_text}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(region.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {item.type === 'batch' && item.batchResult && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">
                    {item.batchResult.total_images}
                  </p>
                  <p className="text-muted-foreground text-sm">Total Images</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">
                    {item.batchResult.completed_count}
                  </p>
                  <p className="text-muted-foreground text-sm">Completed</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold">
                    {item.targetLanguages?.length || 0}
                  </p>
                  <p className="text-muted-foreground text-sm">Languages</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Target Languages</p>
                <div className="flex flex-wrap gap-2">
                  {item.targetLanguages?.map(lang => (
                    <Badge key={lang} variant="secondary">
                      {getLanguageName(lang)}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Image Results</p>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {item.batchResult.images.map((image, idx) => (
                    <div key={image.image_id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">
                            {image.original_filename || `Image ${idx + 1}`}
                          </p>
                          <Badge
                            variant={
                              image.status === 'completed'
                                ? 'default'
                                : image.status === 'failed'
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className="mt-1"
                          >
                            {image.status}
                          </Badge>
                        </div>
                      </div>

                      {image.status === 'completed' &&
                        image.translations.length > 0 && (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {image.translations
                              .filter(t => t.status === 'completed')
                              .map(translation => (
                                <div
                                  key={translation.target_lang}
                                  className="space-y-2"
                                >
                                  <p className="text-xs font-medium">
                                    {getLanguageName(translation.target_lang)}
                                  </p>
                                  {translation.translated_image_url && (
                                    <>
                                      <div className="bg-muted relative aspect-video overflow-hidden rounded border">
                                        <Image
                                          src={getImageUrl(
                                            translation.translated_image_url
                                          )}
                                          alt={`Translated to ${translation.target_lang}`}
                                          fill
                                          className="object-contain"
                                          unoptimized
                                        />
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() =>
                                          downloadImage(
                                            translation.translated_image_url!,
                                            `${image.original_filename || `image-${idx + 1}`}-${translation.target_lang}.png`
                                          )
                                        }
                                      >
                                        <Download className="mr-2 h-3 w-3" />
                                        Download
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}

                      {image.error && (
                        <p className="text-destructive mt-2 text-sm">
                          Error: {image.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
