import Link from 'next/link';
import {
  Languages,
  ArrowLeft,
  Mail,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = {
  title: 'Help & FAQ — OCR Translate',
  description: 'Frequently asked questions and support for OCR Translate.',
};

const faqs = [
  {
    q: 'What image formats are supported?',
    a: 'JPEG, PNG, and WebP files up to 10 MB per image.',
  },
  {
    q: 'Which languages can I translate to?',
    a: 'English, German, French, Spanish, Italian, Portuguese, Dutch, Swedish, Danish, Norwegian, and Finnish. You can also leave the source language on auto-detect.',
  },
  {
    q: 'What is the "Exclude Text" field for?',
    a: 'Enter comma-separated words or patterns you want to keep untranslated — for example, brand names, social handles, or logos. Example: "BRAND,@handle,Logo". These patterns are matched case-insensitively.',
  },
  {
    q: 'What does the confidence score mean?',
    a: 'Each detected text region is assigned a confidence score (0–100%) by the OCR engine. Scores below 70% are flagged in orange — these regions may have lower translation accuracy and are worth reviewing.',
  },
  {
    q: 'Where is my translation history stored?',
    a: 'Both single and batch translation history is stored on our servers and synced to your account. It is accessible from any device and will not be lost if you clear your browser data.',
  },
  {
    q: 'How many images can I process in a batch?',
    a: 'Up to 20 images per batch, with up to 10 target languages per batch. You can run up to 3 batches concurrently.',
  },
  {
    q: 'Can I cancel a running batch?',
    a: 'Yes. Click "Cancel Batch" on the Batch page while the batch is processing. Any images already completed will have results available.',
  },
  {
    q: 'What are API keys for?',
    a: 'API keys let you call the OCR Translate REST API directly from your own code or pipeline — without logging into the web app. Create and manage keys in Settings. Treat them like passwords; do not expose them in client-side code.',
  },
  {
    q: 'What happens when I delete my account?',
    a: 'Deleting your account permanently removes your profile, all API keys, and all associated data. This cannot be undone. You can delete your account from Settings → Danger Zone.',
  },
  {
    q: 'How do webhooks work for batch jobs?',
    a: 'When creating a batch via the API, you can provide a webhook_url. When the batch completes, we will POST the final batch status JSON to that URL. The Batch page in the web app uses polling instead.',
  },
  {
    q: 'I submitted an image and got an error — what went wrong?',
    a: 'Common causes: the image has no detectable text, the file exceeds 10 MB, or the OCR/translation service encountered a temporary issue. Check that your image contains clear, readable text. If the error persists, contact support.',
  },
];

export default function HelpPage() {
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
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="text-primary h-6 w-6" />
              <h1 className="text-3xl font-bold">Help &amp; FAQ</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Answers to common questions about OCR Translate.
            </p>
          </div>

          {/* Quick links */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <Link href="/api-docs">
              <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">API Reference</CardTitle>
                  <CardDescription>
                    Integrate OCR Translate into your pipeline
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/settings">
              <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                <CardHeader>
                  <CardTitle className="text-base">API Keys</CardTitle>
                  <CardDescription>
                    Create and manage API keys for programmatic access
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* FAQ */}
          <section className="mb-12 space-y-4">
            <h2 className="text-xl font-semibold">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group hover:border-border/80 rounded-lg border transition-colors"
                >
                  <summary className="focus-visible:ring-ring/50 flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 font-medium select-none marker:content-none focus-visible:ring-2 focus-visible:outline-none">
                    {faq.q}
                    <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="text-muted-foreground border-t px-4 py-3 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section>
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center py-10 text-center">
                <Mail className="text-muted-foreground mb-3 h-8 w-8" />
                <h2 className="text-lg font-semibold">Still need help?</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Can&apos;t find what you&apos;re looking for? Send us an email
                  and we&apos;ll get back to you.
                </p>
                <a href="mailto:support@ocr-translate.app" className="mt-4">
                  <Button className="gap-2">
                    <Mail className="h-4 w-4" />
                    support@ocr-translate.app
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>
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
              <Link
                href="/terms"
                className="hover:text-foreground focus-visible:ring-ring/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground focus-visible:ring-ring/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Privacy
              </Link>
              <Link
                href="/help"
                className="hover:text-foreground focus-visible:ring-ring/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
