import Link from 'next/link';
import { Languages, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Terms of Service',
  description:
    'Read the Terms of Service for ImgText — acceptable use, account responsibilities, uploaded content, and liability.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
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
          <h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground mb-10 text-sm">
            Last updated: February 22, 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using ImgText (&quot;the Service&quot;), you
                agree to be bound by these Terms of Service. If you do not
                agree, do not use the Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. Use of the Service</h2>
              <p className="text-muted-foreground">
                You may use the Service only for lawful purposes and in
                accordance with these Terms. You agree not to:
              </p>
              <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                <li>
                  Upload images containing illegal, harmful, or infringing
                  content
                </li>
                <li>
                  Attempt to reverse-engineer, disassemble, or compromise the
                  Service
                </li>
                <li>
                  Use automated tools to exceed reasonable usage limits or
                  degrade service for others
                </li>
                <li>
                  Share API keys with third parties or use them in publicly
                  accessible client-side code
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. Accounts</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your
                account credentials and API keys. You are responsible for all
                activity that occurs under your account. Notify us immediately
                if you suspect unauthorised access.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. Uploaded Content</h2>
              <p className="text-muted-foreground">
                You retain ownership of all images you upload. By uploading
                content, you grant us a limited, non-exclusive licence to
                process and store the content solely to provide the Service. We
                do not use your images to train machine learning models.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. Service Availability</h2>
              <p className="text-muted-foreground">
                We strive for high availability but do not guarantee
                uninterrupted access. We may modify, suspend, or discontinue the
                Service at any time with reasonable notice where practicable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">
                6. Disclaimer of Warranties
              </h2>
              <p className="text-muted-foreground">
                The Service is provided &quot;as is&quot; without warranties of
                any kind, whether express or implied, including but not limited
                to merchantability, fitness for a particular purpose, or
                non-infringement. Translation accuracy is not guaranteed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">
                7. Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, ImgText shall not be
                liable for any indirect, incidental, special, or consequential
                damages arising from your use of or inability to use the
                Service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these Terms from time to time. Continued use of
                the Service after changes constitutes acceptance of the updated
                Terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">9. Contact</h2>
              <p className="text-muted-foreground">
                Questions about these Terms?{' '}
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
