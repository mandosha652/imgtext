import Link from 'next/link';
import { Languages, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how ImgText collects, uses, and protects your data — including uploaded images, account info, and cookies.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Languages className="h-6 w-6" />
            <span className="text-lg font-semibold">ImgText</span>
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
          <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10 text-sm">
            Last updated: February 22, 2026
          </p>

          <div className="max-w-none space-y-8 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">
                1. Information We Collect
              </h2>
              <p className="text-muted-foreground">
                We collect the following information when you use ImgText:
              </p>
              <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                <li>
                  <strong>Account data:</strong> Email address and name provided
                  at registration.
                </li>
                <li>
                  <strong>Usage data:</strong> Number of translations, batch
                  jobs run, and languages used — used to power your dashboard
                  stats.
                </li>
                <li>
                  <strong>Uploaded images:</strong> Images you submit for
                  translation. These are processed and stored temporarily to
                  deliver results.
                </li>
                <li>
                  <strong>API key metadata:</strong> Key names, creation dates,
                  and last-used timestamps.
                </li>
                <li>
                  <strong>Log data:</strong> Standard server logs including IP
                  addresses, request timestamps, and error information.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. How We Use Your Data</h2>
              <p className="text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                <li>Provide, operate, and improve the Service</li>
                <li>Process translations and return results to you</li>
                <li>
                  Send account-related emails (verification, password reset)
                </li>
                <li>Detect and prevent abuse or misuse</li>
                <li>
                  Aggregate anonymised analytics to understand usage patterns
                </li>
              </ul>
              <p className="text-muted-foreground">
                We do not use your uploaded images to train machine learning
                models, and we do not sell your data to third parties.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. Data Retention</h2>
              <p className="text-muted-foreground">
                Uploaded images and translated output files are retained for as
                long as your account is active, or until you delete them.
                Account data is retained until you delete your account. Log data
                is retained for up to 90 days.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. Data Sharing</h2>
              <p className="text-muted-foreground">
                We share data only with service providers necessary to operate
                the Service (cloud infrastructure, OCR, and translation APIs).
                These providers are contractually bound to process data only as
                instructed. We do not share data with advertisers or data
                brokers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. Cookies and Storage</h2>
              <p className="text-muted-foreground">
                We use cookies to store authentication tokens. Single
                translation history is stored in your browser&apos;s
                localStorage — this data never leaves your device. You can clear
                it at any time from the History page.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. Your Rights</h2>
              <p className="text-muted-foreground">
                You have the right to access, correct, and delete your personal
                data. You can delete your account and all associated data at any
                time from{' '}
                <Link
                  href="/settings"
                  className="text-primary underline underline-offset-4"
                >
                  Settings → Danger Zone
                </Link>
                . For other data requests, contact us at the address below.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. Security</h2>
              <p className="text-muted-foreground">
                We use industry-standard security measures including HTTPS for
                all data in transit and access controls for data at rest. No
                method of transmission or storage is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">
                8. Changes to This Policy
              </h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy. We will notify you of
                significant changes by email or via a notice in the app.
                Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">9. Contact</h2>
              <p className="text-muted-foreground">
                Privacy questions or data requests?{' '}
                <Link
                  href="/help"
                  className="text-primary underline underline-offset-4"
                >
                  Contact us
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <span className="font-semibold">ImgText</span>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
