'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Layers, AlertCircle, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSelect } from '@/components/features/translate/LanguageSelect';
import {
  MultiImageUploader,
  MultiLanguageSelect,
  BatchProgress,
} from '@/components/features/batch';
import { useCreateBatch, useListBatches, useCancelBatch } from '@/hooks';
import { MAX_TARGET_LANGUAGES, MAX_CONCURRENT_BATCHES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';

export default function BatchPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [sourceLang, setSourceLang] = useState('auto');
  const [excludeText, setExcludeText] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const createBatchMutation = useCreateBatch();
  const cancelBatchMutation = useCancelBatch();
  const { data: batches, isLoading: isLoadingBatches } = useListBatches({
    enabled: true,
  });

  const prevStatusesRef = useRef<Map<string, string>>(new Map());
  useEffect(() => {
    if (!batches) return;
    const prev = prevStatusesRef.current;
    batches.forEach(batch => {
      const prevStatus = prev.get(batch.batch_id);
      const isNowFinished =
        batch.status === 'completed' ||
        batch.status === 'partially_completed' ||
        batch.status === 'failed' ||
        batch.status === 'cancelled';
      const wasActive = prevStatus === 'pending' || prevStatus === 'processing';
      if (wasActive && isNowFinished) {
        const label =
          batch.status === 'completed'
            ? 'Batch completed'
            : batch.status === 'partially_completed'
              ? 'Batch partially completed'
              : batch.status === 'failed'
                ? 'Batch failed'
                : 'Batch cancelled';
        const detail = `${batch.completed_count} of ${batch.total_images} images processed`;
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          new Notification(label, { body: detail, icon: '/favicon.ico' });
        } else {
          toast.info(`${label} — ${detail}`);
        }
      }
      prev.set(batch.batch_id, batch.status);
    });
  }, [batches]);

  const requestNotificationPermission = () => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }
  };

  const activeBatches =
    batches?.filter(b => b.status === 'pending' || b.status === 'processing') ??
    [];

  const atConcurrentLimit = activeBatches.length >= MAX_CONCURRENT_BATCHES;

  const resetForm = () => {
    setFiles([]);
    setTargetLanguages([]);
    setSourceLang('auto');
    setExcludeText('');
    setWebhookUrl('');
  };

  const isWebhookValid = webhookUrl.trim()
    ? (() => {
        try {
          new URL(webhookUrl.trim());
          return true;
        } catch {
          return false;
        }
      })()
    : true;

  const handleStartBatch = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    if (targetLanguages.length === 0) {
      toast.error('Please select at least one target language');
      return;
    }
    if (targetLanguages.length > MAX_TARGET_LANGUAGES) {
      toast.error(`Maximum ${MAX_TARGET_LANGUAGES} target languages allowed`);
      return;
    }
    if (activeBatches.length >= MAX_CONCURRENT_BATCHES) {
      toast.error('Too many active batches — wait for one to finish');
      return;
    }
    if (webhookUrl.trim() && !isWebhookValid) {
      toast.error('Webhook URL must be a valid URL');
      return;
    }
    try {
      const response = await createBatchMutation.mutateAsync({
        files,
        targetLanguages,
        options: {
          sourceLanguage: sourceLang !== 'auto' ? sourceLang : undefined,
          excludeText: excludeText || undefined,
          webhookUrl: webhookUrl.trim() || undefined,
        },
      });
      toast.success(`Batch started with ${response.total_images} images`);
      requestNotificationPermission();
      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to start batch'));
    }
  };

  const handleCancel = async (batchId: string) => {
    try {
      await cancelBatchMutation.mutateAsync(batchId);
      toast.success('Batch cancelled');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to cancel batch'));
    }
  };

  const excludeEntries = excludeText
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Batch Translation</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Translate multiple images to multiple languages at once
        </p>
      </div>

      {/* Top section: form + active batches side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submit form — always visible */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>New Batch</CardTitle>
              <CardDescription>
                Upload images and configure translation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <MultiImageUploader
                onFilesChange={setFiles}
                selectedFiles={files}
                disabled={createBatchMutation.isPending}
              />

              <LanguageSelect
                value={sourceLang}
                onChange={setSourceLang}
                label="Source Language"
                placeholder="Auto-detect"
                showAuto
                disabled={createBatchMutation.isPending}
              />

              <MultiLanguageSelect
                selectedLanguages={targetLanguages}
                onChange={setTargetLanguages}
                label="Target Languages"
                disabled={createBatchMutation.isPending}
              />

              <div className="space-y-2">
                <Label htmlFor="excludeText">
                  Exclude Text{' '}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="excludeText"
                  placeholder="e.g., BRAND,@handle,Logo"
                  value={excludeText}
                  onChange={e => setExcludeText(e.target.value)}
                  disabled={createBatchMutation.isPending}
                />
                {excludeText.trim() &&
                  (excludeText.includes(',,') ? (
                    <p className="text-xs text-amber-600">
                      Remove consecutive commas — empty entries are ignored
                    </p>
                  ) : excludeEntries.some(e => e.length > 50) ? (
                    <p className="text-xs text-amber-600">
                      Some entries are very long — only exact matches work
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      {excludeEntries.length} entr
                      {excludeEntries.length === 1 ? 'y' : 'ies'} will be
                      excluded
                    </p>
                  ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">
                  Webhook URL{' '}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  disabled={createBatchMutation.isPending}
                />
                {webhookUrl.trim() &&
                  (isWebhookValid ? (
                    <p className="text-muted-foreground text-xs">
                      POST will be sent when batch finishes
                    </p>
                  ) : (
                    <p className="text-destructive text-xs">
                      Enter a valid URL (e.g. https://…)
                    </p>
                  ))}
              </div>

              {atConcurrentLimit && (
                <div className="text-muted-foreground flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>
                    {activeBatches.length} batch
                    {activeBatches.length !== 1 ? 'es' : ''} already running —
                    wait for one to finish
                  </span>
                </div>
              )}

              <Button
                onClick={handleStartBatch}
                disabled={
                  files.length === 0 ||
                  targetLanguages.length === 0 ||
                  createBatchMutation.isPending ||
                  atConcurrentLimit ||
                  !isWebhookValid
                }
                className="w-full"
                size="lg"
              >
                {createBatchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting…
                  </>
                ) : (
                  <>
                    <Layers className="mr-2 h-4 w-4" />
                    Start Batch
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Active batches — shown in the right column */}
        <div className="space-y-4">
          {isLoadingBatches && !batches ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </CardContent>
            </Card>
          ) : activeBatches.length > 0 ? (
            activeBatches.map(batch => (
              <Card key={batch.batch_id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="relative flex h-2 w-2">
                        <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                        <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
                      </span>
                      Running
                    </CardTitle>
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(batch.created_at), 'HH:mm')}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <BatchProgress
                    batchStatus={batch}
                    onCancel={() => handleCancel(batch.batch_id)}
                    isCancelling={cancelBatchMutation.isPending}
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Inbox}
              title="No active batches"
              description="Start a new batch on the left to see it here"
              className="h-full min-h-50"
            />
          )}
        </div>
      </div>
    </div>
  );
}
