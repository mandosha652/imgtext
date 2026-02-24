'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  ImageIcon,
  Layers,
  Key,
  BookOpen,
  X,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useApiKeys } from '@/hooks';
import type { UsageStatsResponse } from '@/types';

const DOCS_KEY = 'onboarding_docs_read';
const DISMISSED_KEY = 'onboarding_dismissed';

interface Step {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  cta: string;
}

const STEPS: Step[] = [
  {
    id: 'translate',
    label: 'Translate your first image',
    description: 'Upload a JPEG, PNG, or WebP file and pick a target language.',
    href: '/translate',
    icon: ImageIcon,
    cta: 'Go to Translate',
  },
  {
    id: 'batch',
    label: 'Try batch translation',
    description: 'Process multiple images across multiple languages at once.',
    href: '/batch',
    icon: Layers,
    cta: 'Open Batch',
  },
  {
    id: 'api_key',
    label: 'Set up API access',
    description:
      'Create an API key to integrate ImgText into your own workflows.',
    href: '/settings',
    icon: Key,
    cta: 'Go to Settings',
  },
  {
    id: 'docs',
    label: 'Read the docs',
    description: 'Learn about all available endpoints and response formats.',
    href: '/api-docs',
    icon: BookOpen,
    cta: 'Read Docs',
  },
];

interface Props {
  usage: UsageStatsResponse;
}

export function OnboardingChecklist({ usage }: Props) {
  const { data: apiKeys } = useApiKeys();
  const [docsRead, setDocsRead] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DOCS_KEY) === 'true';
  });
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  });

  const completed: Record<string, boolean> = {
    translate: (usage.all_time.translations_count ?? 0) > 0,
    batch: (usage.all_time.batches_run ?? 0) > 0,
    api_key: (apiKeys?.length ?? 0) > 0,
    docs: docsRead,
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const allDone = completedCount === STEPS.length;

  function handleDocsClick() {
    localStorage.setItem(DOCS_KEY, 'true');
    setDocsRead(true);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  }

  if (dismissed) return null;

  if (allDone) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="text-primary h-4 w-4" />
                You&apos;re all set!
              </CardTitle>
              <CardDescription className="mt-0.5">
                All getting started steps complete
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Dismiss"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={100} className="mt-3 h-1.5" />
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Getting Started
            </CardTitle>
            <CardDescription className="mt-0.5">
              {completedCount} of {STEPS.length} steps complete
            </CardDescription>
          </div>
          <span className="text-muted-foreground shrink-0 text-sm font-medium">
            {Math.round((completedCount / STEPS.length) * 100)}%
          </span>
        </div>
        <Progress
          value={(completedCount / STEPS.length) * 100}
          className="mt-3 h-1.5"
        />
      </CardHeader>

      <CardContent>
        <ol className="space-y-3">
          {STEPS.map(step => {
            const done = completed[step.id];
            const Icon = step.icon;

            return (
              <li key={step.id} className="flex items-start gap-3">
                {done ? (
                  <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                ) : (
                  <Circle className="text-muted-foreground/40 mt-0.5 h-5 w-5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-snug font-medium ${done ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {step.label}
                  </p>
                  {!done && (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {step.description}
                    </p>
                  )}
                </div>
                {!done && (
                  <Link
                    href={step.href}
                    onClick={step.id === 'docs' ? handleDocsClick : undefined}
                  >
                    <Button
                      size="xs"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                    >
                      <Icon className="h-3 w-3" />
                      {step.cta}
                    </Button>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
