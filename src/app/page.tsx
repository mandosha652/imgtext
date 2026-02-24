import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Languages,
  Eraser,
  Layers,
  Code2,
  ScanText,
  ImageDown,
  MoveRight,
} from 'lucide-react';
import {
  HomeNavActions,
  HeroCTAActions,
  BottomCTAAction,
} from '@/components/features/home/HomeActions';

export const metadata: Metadata = {
  title: 'ImgText — AI-Powered Image Translation',
  description:
    'Translate text in images instantly using AI-powered OCR and translation. Upload an image, get a translated image back — text rendered in the same position. Supports 11 European languages.',
  openGraph: {
    title: 'ImgText — AI-Powered Image Translation',
    description:
      'Upload an image with text, get a translated image back. AI-powered OCR removes the original text and renders the translation in place. Supports 11 European languages.',
    url: '/',
  },
  twitter: {
    title: 'ImgText — AI-Powered Image Translation',
    description:
      'Upload an image with text, get a translated image back. AI-powered OCR + translation in one step.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="focus-visible:ring-ring/50 flex items-center gap-2 rounded focus-visible:ring-2 focus-visible:outline-none"
          >
            <Languages className="h-6 w-6" />
            <span className="text-lg font-semibold sm:text-xl">ImgText</span>
          </Link>
          <HomeNavActions />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Translate image text.{' '}
              <span className="text-muted-foreground">
                Get a new image back.
              </span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
              Upload an image with text in it. We detect every word, remove the
              original, translate it, and render it back onto the image — in the
              same position. You get a ready-to-use image, not a text box.
            </p>
            <HeroCTAActions />
          </div>
        </section>

        {/* How it works */}
        <section className="border-t">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <h2 className="text-center text-3xl font-bold">How it works</h2>
            <p className="text-muted-foreground mt-3 text-center">
              Three steps. One output you can actually use.
            </p>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
                  <ScanText className="text-primary h-7 w-7" />
                </div>
                <div className="text-primary/20 mt-2 text-4xl font-bold">
                  01
                </div>
                <h3 className="mt-2 text-lg font-semibold">Detect</h3>
                <p className="text-muted-foreground mt-2">
                  OCR scans every text region in the image, with bounding box
                  coordinates and confidence scores per word.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
                  <Eraser className="text-primary h-7 w-7" />
                </div>
                <div className="text-primary/20 mt-2 text-4xl font-bold">
                  02
                </div>
                <h3 className="mt-2 text-lg font-semibold">
                  Remove &amp; Translate
                </h3>
                <p className="text-muted-foreground mt-2">
                  The original text is cleanly removed from the image. Then each
                  region is translated into your target language.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
                  <ImageDown className="text-primary h-7 w-7" />
                </div>
                <div className="text-primary/20 mt-2 text-4xl font-bold">
                  03
                </div>
                <h3 className="mt-2 text-lg font-semibold">Render back</h3>
                <p className="text-muted-foreground mt-2">
                  Translated text is rendered onto the image in the exact same
                  position. Download a finished image — not a transcript.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="bg-muted/50 border-t">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <h2 className="text-center text-3xl font-bold">
              Three outputs per image
            </h2>
            <p className="text-muted-foreground mt-3 text-center">
              Every translation returns all three — use whichever you need.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="bg-background rounded-xl border p-6">
                <h3 className="font-semibold">Translated image</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  The final output. Original image with translated text rendered
                  back in position. Ready to publish, share, or print.
                </p>
              </div>
              <div className="bg-background rounded-xl border p-6">
                <h3 className="font-semibold">Text-removed image</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  The image with all text erased and background reconstructed.
                  Use as a clean base if you want to apply your own typography.
                </p>
              </div>
              <div className="bg-background rounded-xl border p-6">
                <h3 className="font-semibold">Region breakdown</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Every detected text region with original text, translation,
                  position, and OCR confidence score — for validation or
                  downstream automation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo */}
        <section className="border-t">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <h2 className="text-center text-3xl font-bold">See it in action</h2>
            <p className="text-muted-foreground mt-3 text-center">
              Upload an image with text — get a translated image back, with text
              rendered in the same position.
            </p>
            <div className="mt-12 flex flex-col items-center gap-6 md:flex-row md:items-stretch">
              {/* Original */}
              <div className="flex flex-1 flex-col gap-3">
                <p className="text-muted-foreground text-center text-xs font-medium tracking-widest uppercase">
                  Input
                </p>
                <div className="bg-muted flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border p-8">
                  <div className="w-full space-y-2 rounded-lg border bg-white p-4 shadow-sm dark:bg-zinc-900">
                    <div className="h-2.5 w-3/4 rounded bg-zinc-300 dark:bg-zinc-600" />
                    <div className="h-2.5 w-full rounded bg-zinc-300 dark:bg-zinc-600" />
                    <div className="h-2.5 w-2/3 rounded bg-zinc-300 dark:bg-zinc-600" />
                    <div className="mt-3 h-2.5 w-1/2 rounded bg-zinc-300 dark:bg-zinc-600" />
                    <div className="h-2.5 w-5/6 rounded bg-zinc-300 dark:bg-zinc-600" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Image with German text
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <MoveRight className="text-primary h-5 w-5" />
                </div>
              </div>

              {/* Translated */}
              <div className="flex flex-1 flex-col gap-3">
                <p className="text-muted-foreground text-center text-xs font-medium tracking-widest uppercase">
                  Output
                </p>
                <div className="bg-muted flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border p-8">
                  <div className="w-full space-y-2 rounded-lg border bg-white p-4 shadow-sm dark:bg-zinc-900">
                    <div className="bg-primary/20 h-2.5 w-3/4 rounded" />
                    <div className="bg-primary/20 h-2.5 w-full rounded" />
                    <div className="bg-primary/20 h-2.5 w-2/3 rounded" />
                    <div className="bg-primary/20 mt-3 h-2.5 w-1/2 rounded" />
                    <div className="bg-primary/20 h-2.5 w-5/6 rounded" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Same image, text translated to English
                  </p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mt-6 text-center text-sm">
              Text is detected, removed, translated, and rendered back — in
              exactly the same position. You download a finished image.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-t">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <h2 className="text-center text-3xl font-bold">Built for scale</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">Batch processing</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Upload up to 20 images and translate to up to 10 languages in
                  one job. Real-time progress, cancel any time.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code2 className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">Full API access</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Generate API keys and integrate image translation directly
                  into your pipeline. Webhooks supported for async batch jobs.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Languages className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">11 European languages</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  English, German, French, Spanish, Italian, Portuguese, Dutch,
                  Swedish, Danish, Norwegian, Finnish.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eraser className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">Exclude specific text</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Keep logos, brand names, handles, or any pattern untranslated.
                  Your brand stays intact.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ScanText className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">Confidence scores</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Every OCR region includes a confidence score. Low-confidence
                  regions are flagged so you know exactly where to verify.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ImageDown className="text-primary h-5 w-5" />
                  <h3 className="font-semibold">Auto-detect source</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Don&apos;t know what language is in the image? Leave source on
                  auto — the pipeline figures it out.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-muted/50 border-t">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold">
                Upload an image. Get a translated image.
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl">
                No boxes, no transcripts, no copy-pasting. Your image — with the
                text translated in place.
              </p>
              <BottomCTAAction />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <span className="font-semibold">ImgText</span>
            </div>
            <div className="text-muted-foreground flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <Link
                href="/api-docs"
                className="hover:text-foreground focus-visible:text-foreground focus-visible:ring-ring/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                API Docs
              </Link>
              <Link
                href="/help"
                className="hover:text-foreground focus-visible:text-foreground focus-visible:ring-ring/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Help &amp; FAQ
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground focus-visible:text-foreground focus-visible:ring-ring/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground focus-visible:text-foreground focus-visible:ring-ring/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Privacy
              </Link>
            </div>
            <p className="text-muted-foreground text-center text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} ImgText. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
