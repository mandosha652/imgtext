'use client';

import Link from 'next/link';
import { ArrowRight, Languages, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const isDevBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
  const primaryCTA = isDevBypass ? '/translate' : '/signup';
  const secondaryCTA = isDevBypass ? '/dashboard' : '/login';

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Languages className="h-6 w-6" />
            <span className="text-lg font-semibold sm:text-xl">
              OCR Translate
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href={secondaryCTA}>
              <Button variant="ghost" size="sm" className="sm:size-default">
                {isDevBypass ? 'Dashboard' : 'Sign in'}
              </Button>
            </Link>
            <Link href={primaryCTA}>
              <Button size="sm" className="sm:size-default">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Translate text in images{' '}
              <span className="text-muted-foreground">instantly</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg">
              Upload an image, select your target language, and get perfectly
              translated text rendered back onto your image. Powered by advanced
              OCR and AI translation.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href={primaryCTA}>
                <Button size="lg" className="gap-2">
                  Start Translating <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={secondaryCTA}>
                <Button size="lg" variant="outline">
                  {isDevBypass ? 'Go to Dashboard' : 'Sign in to Dashboard'}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/50 border-t">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <Zap className="text-primary h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Lightning Fast</h3>
                <p className="text-muted-foreground mt-2">
                  Get translations in seconds. Our pipeline processes images
                  quickly without compromising quality.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <Globe className="text-primary h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">11 Languages</h3>
                <p className="text-muted-foreground mt-2">
                  Support for major European languages including English,
                  German, French, Spanish, Italian, and more.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Secure & Private</h3>
                <p className="text-muted-foreground mt-2">
                  Your images are processed securely and never stored longer
                  than necessary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t">
          <div className="container mx-auto max-w-6xl px-4 py-24">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold">Ready to get started?</h2>
              <p className="text-muted-foreground mt-4 max-w-xl">
                {isDevBypass
                  ? 'Start translating images instantly.'
                  : 'Create your account and start translating images in minutes.'}
              </p>
              <Link href={primaryCTA} className="mt-8">
                <Button size="lg" className="gap-2">
                  {isDevBypass ? 'Start Translating' : 'Create Account'}{' '}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <span className="font-semibold">OCR Translate</span>
            </div>
            <p className="text-muted-foreground text-center text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} OCR Translate. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
