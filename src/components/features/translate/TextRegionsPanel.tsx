'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CONFIDENCE_THRESHOLD } from '@/lib/constants';
import type { TranslateResponse } from '@/types';

interface TextRegionsPanelProps {
  regions: TranslateResponse['regions'];
  lowConfidenceRegions: TranslateResponse['regions'];
}

export function TextRegionsPanel({
  regions,
  lowConfidenceRegions,
}: TextRegionsPanelProps) {
  const [showRegions, setShowRegions] = useState(false);
  const [copiedRegion, setCopiedRegion] = useState<string | null>(null);

  const copyRegionText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedRegion(key);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedRegion(null), 2000);
  };

  if (regions.length === 0) return null;

  return (
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
        {showRegions ? 'Hide' : 'Show'} text regions ({regions.length})
      </button>
      {showRegions && (
        <>
          <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border p-3">
            {regions.map(region => (
              <div key={region.id} className="bg-muted rounded p-2 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <p className="font-medium">{region.original_text}</p>
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
                        <TooltipContent>Copy translation</TooltipContent>
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
              Regions below 70% confidence may have OCR errors — verify manually
              if accuracy is critical
            </p>
          )}
        </>
      )}
    </div>
  );
}
