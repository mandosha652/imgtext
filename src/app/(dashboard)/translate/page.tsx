'use client';
import { useRef, useState } from 'react';
import { Loader2, RotateCcw, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
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
import { ImageUploader } from '@/components/features/translate/ImageUploader';
import { LanguageSelect } from '@/components/features/translate/LanguageSelect';
import { TranslationResult } from '@/components/features/translate/TranslationResult';
import { useTranslateImage } from '@/hooks';
import { EmptyState } from '@/components/ui/empty-state';
import type { TranslateResponse } from '@/types';
import { historyStorage } from '@/lib/utils/historyStorage';
import { getErrorMessage } from '@/lib/utils';

export default function TranslatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState('en');
  const [sourceLang, setSourceLang] = useState('auto');
  const [excludeText, setExcludeText] = useState('');
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const translateMutation = useTranslateImage();

  const handleTranslate = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await translateMutation.mutateAsync({
        file,
        targetLang,
        signal: abortControllerRef.current.signal,
        options: {
          sourceLang: sourceLang !== 'auto' ? sourceLang : undefined,
          excludeText: excludeText || undefined,
        },
      });
      setResult(response);
      historyStorage.addSingleTranslation(response, targetLang);
      toast.success('Translation complete');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Translation failed'));
    }
  };

  const handleReset = () => {
    abortControllerRef.current?.abort();
    setFile(null);
    setResult(null);
    setTargetLang('en');
    setSourceLang('auto');
    setExcludeText('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Translate Image</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Upload an image — get back a new image with the text translated in
          place
        </p>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        {/* Upload & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select an image containing text you want to translate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageUploader
              onFileSelect={setFile}
              selectedFile={file}
              disabled={translateMutation.isPending}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <LanguageSelect
                value={sourceLang}
                onChange={setSourceLang}
                label="Source Language"
                placeholder="Auto-detect"
                showAuto
                disabled={translateMutation.isPending}
              />
              <LanguageSelect
                value={targetLang}
                onChange={setTargetLang}
                label="Target Language"
                disabled={translateMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excludeText">Exclude Text (optional)</Label>
              <Input
                id="excludeText"
                placeholder="e.g., BRAND,@handle,Logo"
                value={excludeText}
                onChange={e => setExcludeText(e.target.value)}
                disabled={translateMutation.isPending}
              />
              <p className="text-muted-foreground text-xs">
                Comma-separated exact strings to keep untranslated — e.g.{' '}
                <code className="bg-muted rounded px-1">Nike,@brand,©2024</code>
              </p>
              {excludeText.trim() &&
                (() => {
                  const entries = excludeText
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
                  const hasEmpty = excludeText.includes(',,');
                  const hasTooLong = entries.some(e => e.length > 50);
                  if (hasEmpty)
                    return (
                      <p className="text-xs text-amber-600">
                        Remove consecutive commas — empty entries are ignored
                      </p>
                    );
                  if (hasTooLong)
                    return (
                      <p className="text-xs text-amber-600">
                        Some entries are very long — only exact matches work
                      </p>
                    );
                  return (
                    <p className="text-muted-foreground text-xs">
                      {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}{' '}
                      will be excluded
                    </p>
                  );
                })()}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleTranslate}
                disabled={!file || translateMutation.isPending}
                className="flex-1"
              >
                {translateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {translateMutation.isPending ? 'Translating...' : 'Translate'}
              </Button>
              {translateMutation.isPending && (
                <Button
                  variant="outline"
                  onClick={() => {
                    abortControllerRef.current?.abort();
                    translateMutation.reset();
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
              {(file || result) && !translateMutation.isPending && (
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <div>
          {translateMutation.isPending && (
            <Card className="animate-in fade-in-0 duration-300">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="bg-primary/10 absolute inset-0 animate-ping rounded-full" />
                  <Loader2 className="text-primary relative h-10 w-10 animate-spin" />
                </div>
                <p className="mt-6 font-medium">Processing your image...</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Detecting text, translating, and rendering back onto the image
                </p>
              </CardContent>
            </Card>
          )}

          {result && !translateMutation.isPending && (
            <TranslationResult result={result} />
          )}

          {!result && !translateMutation.isPending && (
            <EmptyState
              icon={ImageIcon}
              title="Your translated image will appear here"
              description="You'll get the translated image, the original with text removed, and a region-by-region breakdown"
            />
          )}
        </div>
      </div>
    </div>
  );
}
