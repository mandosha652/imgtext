'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import type { TranslateResponse } from '@/types';
import { AxiosError } from 'axios';
import { historyStorage } from '@/lib/utils/historyStorage';

export default function TranslatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState('en');
  const [sourceLang, setSourceLang] = useState('auto');
  const [excludeText, setExcludeText] = useState('');
  const [result, setResult] = useState<TranslateResponse | null>(null);

  const translateMutation = useTranslateImage();

  const handleTranslate = async () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    try {
      const response = await translateMutation.mutateAsync({
        file,
        targetLang,
        options: {
          sourceLang: sourceLang !== 'auto' ? sourceLang : undefined,
          excludeText: excludeText || undefined,
        },
      });
      setResult(response);
      historyStorage.addSingleTranslation(response, targetLang);
      toast.success('Translation complete!');
    } catch (error) {
      const axiosError = error as AxiosError<{
        message: string;
        error: string;
      }>;
      toast.error(
        axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          'Translation failed'
      );
    }
  };

  const handleReset = () => {
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
          Upload an image and translate text to your target language
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
                Comma-separated text patterns to exclude from translation
              </p>
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
                Translate
              </Button>
              {(file || result) && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={translateMutation.isPending}
                >
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <div>
          {translateMutation.isPending && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <p className="text-muted-foreground mt-4">
                  Processing your image...
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  This may take up to a minute
                </p>
              </CardContent>
            </Card>
          )}

          {result && !translateMutation.isPending && (
            <TranslationResult result={result} />
          )}

          {!result && !translateMutation.isPending && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  Your translation result will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
