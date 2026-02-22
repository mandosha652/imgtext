'use client';

import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { SUPPORTED_LANGUAGES } from '@/types';
import { MAX_TARGET_LANGUAGES } from '@/lib/constants';

interface MultiLanguageSelectProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  label?: string;
  disabled?: boolean;
}

export function MultiLanguageSelect({
  selectedLanguages,
  onChange,
  label,
  disabled,
}: MultiLanguageSelectProps) {
  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      onChange(selectedLanguages.filter(l => l !== code));
    } else if (selectedLanguages.length < MAX_TARGET_LANGUAGES) {
      onChange([...selectedLanguages, code]);
    }
  };

  const removeLanguage = (code: string) => {
    onChange(selectedLanguages.filter(l => l !== code));
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
  };

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}

      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map(code => (
            <Badge
              key={code}
              variant="secondary"
              className="gap-1 pr-1 pl-2 text-sm"
            >
              {getLanguageName(code)}
              <button
                onClick={() => removeLanguage(code)}
                disabled={disabled}
                aria-label={`Remove ${getLanguageName(code)}`}
                title={`Remove ${getLanguageName(code)}`}
                className="hover:bg-muted-foreground/20 ml-1 cursor-pointer rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-lg border p-3">
        <p className="text-muted-foreground mb-2 text-xs">
          Select up to {MAX_TARGET_LANGUAGES} languages (
          {selectedLanguages.length}/{MAX_TARGET_LANGUAGES})
        </p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {SUPPORTED_LANGUAGES.map(lang => {
            const isSelected = selectedLanguages.includes(lang.code);
            const isDisabled =
              disabled ||
              (!isSelected && selectedLanguages.length >= MAX_TARGET_LANGUAGES);

            return (
              <Button
                key={lang.code}
                variant={isSelected ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'justify-start gap-2',
                  isSelected && 'bg-primary/10 text-primary hover:bg-primary/20'
                )}
                onClick={() => toggleLanguage(lang.code)}
                disabled={isDisabled}
              >
                {isSelected ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="w-3" />
                )}
                {lang.name}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
