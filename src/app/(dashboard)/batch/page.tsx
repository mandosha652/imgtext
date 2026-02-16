'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Layers, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LanguageSelect } from '@/components/features/translate/LanguageSelect';
import {
  MultiImageUploader,
  MultiLanguageSelect,
  BatchProgress,
  BatchResults,
} from '@/components/features/batch';
import { useCreateBatch, useListBatches, useCancelBatch } from '@/hooks';
import { MAX_TARGET_LANGUAGES } from '@/lib/constants';
import { historyStorage } from '@/lib/utils/historyStorage';

const MAX_CONCURRENT_BATCHES = 999; // Unlimited for personal use

export default function BatchPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [sourceLang, setSourceLang] = useState('auto');
  const [excludeText, setExcludeText] = useState('');

  const createBatchMutation = useCreateBatch();
  const cancelBatchMutation = useCancelBatch();
  const {
    data: batches,
    isLoading: isLoadingBatches,
    isFetching,
  } = useListBatches();

  const isInitialLoading = isLoadingBatches && !batches;

  const activeBatches =
    batches?.filter(b => b.status === 'pending' || b.status === 'processing') ||
    [];
  const canCreateBatch = activeBatches.length < MAX_CONCURRENT_BATCHES;

  // Track saved batches to prevent duplicate saves
  const savedBatchIds = useRef<Set<string>>(new Set());

  // Save completed batches to history
  useEffect(() => {
    if (!batches) return;

    batches.forEach(batch => {
      const isFinished =
        batch.status === 'completed' ||
        batch.status === 'partially_completed' ||
        batch.status === 'failed' ||
        batch.status === 'cancelled';

      if (isFinished && !savedBatchIds.current.has(batch.batch_id)) {
        savedBatchIds.current.add(batch.batch_id);
        historyStorage.addBatchTranslation(batch, batch.target_languages);
      }
    });
  }, [batches]);

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

    try {
      const response = await createBatchMutation.mutateAsync({
        files,
        targetLanguages,
        options: {
          sourceLanguage: sourceLang !== 'auto' ? sourceLang : undefined,
          excludeText: excludeText || undefined,
        },
      });
      toast.success(`Batch started with ${response.total_images} images`);

      // Reset form
      setFiles([]);
      setTargetLanguages([]);
      setSourceLang('auto');
      setExcludeText('');
      setShowCreateForm(false);
    } catch (error) {
      const axiosError = error as AxiosError<{
        message: string;
        error: string;
        detail: string;
      }>;
      toast.error(
        axiosError.response?.data?.detail ||
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Failed to start batch'
      );
    }
  };

  const handleCancel = async (batchId: string) => {
    try {
      await cancelBatchMutation.mutateAsync(batchId);
      toast.success('Batch cancelled');
    } catch (error) {
      const axiosError = error as AxiosError<{
        message: string;
        error: string;
      }>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Failed to cancel batch'
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Batch Translation</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Translate multiple images to multiple languages at once
          </p>
        </div>

        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            disabled={!canCreateBatch || isInitialLoading}
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Batch
          </Button>
        )}
      </div>

      {!canCreateBatch && !showCreateForm && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {activeBatches.length} active batch
            {activeBatches.length !== 1 ? 'es' : ''} running. Maximum{' '}
            {MAX_CONCURRENT_BATCHES} concurrent batches allowed. Please wait for
            one to complete before starting another.
          </AlertDescription>
        </Alert>
      )}

      {showCreateForm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create New Batch</h2>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                setFiles([]);
                setTargetLanguages([]);
                setSourceLang('auto');
                setExcludeText('');
              }}
            >
              Cancel
            </Button>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
                <CardDescription>
                  Select up to 100 images to translate in batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiImageUploader
                  onFilesChange={setFiles}
                  selectedFiles={files}
                  disabled={createBatchMutation.isPending}
                />
              </CardContent>
            </Card>

            {/* Settings Section */}
            <Card>
              <CardHeader>
                <CardTitle>Translation Settings</CardTitle>
                <CardDescription>
                  Configure languages and options for this batch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <Label htmlFor="excludeText">Exclude Text (optional)</Label>
                  <Input
                    id="excludeText"
                    placeholder="e.g., BRAND,@handle,Logo"
                    value={excludeText}
                    onChange={e => setExcludeText(e.target.value)}
                    disabled={createBatchMutation.isPending}
                  />
                  <p className="text-muted-foreground text-xs">
                    Comma-separated text patterns to exclude from translation
                  </p>
                </div>

                <Button
                  onClick={handleStartBatch}
                  disabled={
                    files.length === 0 ||
                    targetLanguages.length === 0 ||
                    createBatchMutation.isPending
                  }
                  className="w-full"
                  size="lg"
                >
                  {createBatchMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Batch...
                    </>
                  ) : (
                    <>
                      <Layers className="mr-2 h-4 w-4" />
                      Start Batch Translation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Batch List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {showCreateForm ? 'Your Batches' : 'All Batches'}
          </h2>
          {isFetching && !isInitialLoading && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        {isInitialLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground mt-4">Loading batches...</p>
            </CardContent>
          </Card>
        ) : batches && batches.length > 0 ? (
          <div className="space-y-4">
            {batches.map(batch => {
              const isFinished =
                batch.status === 'completed' ||
                batch.status === 'partially_completed' ||
                batch.status === 'failed' ||
                batch.status === 'cancelled';

              return (
                <Card key={batch.batch_id}>
                  <CardContent className="pt-6">
                    <BatchProgress
                      batchStatus={batch}
                      onCancel={() => handleCancel(batch.batch_id)}
                      isCancelling={cancelBatchMutation.isPending}
                    />

                    {isFinished && <BatchResults batchStatus={batch} />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                  <Layers className="text-muted-foreground h-6 w-6" />
                </div>
                <p className="mt-4 font-medium">No batches yet</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Create your first batch to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
