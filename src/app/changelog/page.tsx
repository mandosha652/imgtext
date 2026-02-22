import Link from 'next/link';
import { Languages, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: "What's New — OCR Translate",
  description: 'Latest updates, improvements, and fixes to OCR Translate.',
};

interface Release {
  version: string;
  date: string;
  tags: Array<{
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }>;
  changes: { type: 'feat' | 'fix' | 'perf' | 'chore'; text: string }[];
}

const RELEASES: Release[] = [
  {
    version: 'February 2026',
    date: '2026-02-22',
    tags: [{ label: 'Latest', variant: 'default' }],
    changes: [
      { type: 'feat', text: 'Download all batch results as a single ZIP file' },
      {
        type: 'feat',
        text: 'API key rotation — revoke and replace a key in one click',
      },
      {
        type: 'feat',
        text: 'Camera capture button on mobile for single and batch upload',
      },
      {
        type: 'feat',
        text: 'Exclude Text field now shows live entry count and warns on invalid patterns',
      },
      {
        type: 'feat',
        text: 'Email verification reminder banner shown until account is verified',
      },
      {
        type: 'feat',
        text: 'Offline detection banner when network is unavailable',
      },
      {
        type: 'feat',
        text: 'Browser notification when a batch finishes processing',
      },
      {
        type: 'feat',
        text: 'Expiry countdown on API keys expiring within 7 days',
      },
      {
        type: 'feat',
        text: 'Cancel button while a single translation is in progress',
      },
      {
        type: 'feat',
        text: 'Copy individual region text (original and translated) in translation results',
      },
      { type: 'feat', text: 'Password strength indicator on sign-up form' },
      { type: 'feat', text: 'Pagination and search on the History page' },
      { type: 'feat', text: 'Export translation history as JSON' },
      { type: 'feat', text: 'Admin panel for platform management' },
      {
        type: 'fix',
        text: 'Batch results no longer overflow on small screens',
      },
      {
        type: 'fix',
        text: 'Token refresh now validates the response before storing tokens',
      },
      {
        type: 'fix',
        text: 'TanStack Query cache cleared on logout to prevent stale data',
      },
      {
        type: 'fix',
        text: 'Polling stops automatically when navigating away from the Batch page',
      },
      {
        type: 'perf',
        text: 'History page lazy-loads images for faster rendering',
      },
    ],
  },
  {
    version: 'January 2026',
    date: '2026-01-01',
    tags: [{ label: 'Initial release', variant: 'secondary' }],
    changes: [
      {
        type: 'feat',
        text: 'Single image OCR translation to 11 European languages',
      },
      {
        type: 'feat',
        text: 'Batch translation — up to 20 images, up to 10 languages at once',
      },
      { type: 'feat', text: 'Real-time batch progress with per-image status' },
      { type: 'feat', text: 'API key management for programmatic access' },
      {
        type: 'feat',
        text: 'Translation history with local storage for single translations',
      },
      { type: 'feat', text: 'Dark mode support' },
      { type: 'feat', text: 'Dashboard with usage statistics' },
    ],
  },
];

const TYPE_LABEL: Record<Release['changes'][0]['type'], string> = {
  feat: 'New',
  fix: 'Fix',
  perf: 'Perf',
  chore: 'Chore',
};

const TYPE_CLASS: Record<Release['changes'][0]['type'], string> = {
  feat: 'text-green-600 dark:text-green-400',
  fix: 'text-blue-600 dark:text-blue-400',
  perf: 'text-purple-600 dark:text-purple-400',
  chore: 'text-muted-foreground',
};

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Languages className="h-6 w-6" />
            <span className="text-lg font-semibold">OCR Translate</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-2 text-3xl font-bold">What&apos;s New</h1>
          <p className="text-muted-foreground mb-10 text-sm">
            Latest updates, improvements, and fixes.
          </p>

          <div className="space-y-12">
            {RELEASES.map(release => (
              <div key={release.version} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{release.version}</h2>
                  {release.tags.map(tag => (
                    <Badge key={tag.label} variant={tag.variant}>
                      {tag.label}
                    </Badge>
                  ))}
                </div>
                <ul className="space-y-2">
                  {release.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className={`mt-0.5 w-10 shrink-0 text-right text-xs font-semibold ${TYPE_CLASS[change.type]}`}
                      >
                        {TYPE_LABEL[change.type]}
                      </span>
                      <span className="text-muted-foreground">
                        {change.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <span className="font-semibold">OCR Translate</span>
            </div>
            <div className="text-muted-foreground flex gap-4 text-sm">
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
              <Link href="/help" className="hover:underline">
                Help
              </Link>
              <Link href="/changelog" className="hover:underline">
                Changelog
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
