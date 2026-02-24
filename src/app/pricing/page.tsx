'use client';

import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks';

interface TierFeature {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

const FEATURES: TierFeature[] = [
  {
    label: 'Images per month',
    free: '50',
    pro: '500',
    enterprise: 'Unlimited',
  },
  {
    label: 'Max batch size',
    free: '5 images',
    pro: '20 images',
    enterprise: '20 images',
  },
  { label: 'Target languages', free: '3', pro: '11', enterprise: '11' },
  { label: 'API access', free: true, pro: true, enterprise: true },
  { label: 'Priority processing', free: false, pro: true, enterprise: true },
  { label: 'Webhook notifications', free: false, pro: true, enterprise: true },
  { label: 'Dedicated support', free: false, pro: false, enterprise: true },
  { label: 'Custom SLA', free: false, pro: false, enterprise: true },
];

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Great for individuals and small projects',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and growing teams',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="text-primary mx-auto h-4 w-4" />;
  if (value === false)
    return <Minus className="text-muted-foreground/40 mx-auto h-4 w-4" />;
  return <span className="text-sm font-medium">{value}</span>;
}

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ImgText
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign up free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Plans & Features
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Start for free. No credit card required.
          </p>
        </div>

        {/* Tier cards — names + descriptions only, no prices */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {TIERS.map(tier => (
            <div key={tier.id} className="bg-card rounded-xl border p-8">
              <h2 className="text-xl font-semibold">{tier.name}</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {tier.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="rounded-xl border">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">What&apos;s included</h2>
          </div>

          {/* Desktop table (md+) */}
          <div className="hidden md:block">
            {/* Table header */}
            <div className="grid grid-cols-4 border-b px-6 py-3">
              <div className="text-muted-foreground text-sm font-medium">
                Feature
              </div>
              {TIERS.map(tier => (
                <div
                  key={tier.id}
                  className="text-center text-sm font-semibold"
                >
                  {tier.name}
                </div>
              ))}
            </div>

            {/* Rows */}
            {FEATURES.map((feature, i) => (
              <div
                key={feature.label}
                className={`grid grid-cols-4 px-6 py-4 ${i < FEATURES.length - 1 ? 'border-b' : ''}`}
              >
                <div className="text-sm">{feature.label}</div>
                <div className="text-center">
                  <FeatureValue value={feature.free} />
                </div>
                <div className="text-center">
                  <FeatureValue value={feature.pro} />
                </div>
                <div className="text-center">
                  <FeatureValue value={feature.enterprise} />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile stacked cards (below md) */}
          <div className="divide-y md:hidden">
            {FEATURES.map(feature => (
              <div key={feature.label} className="px-4 py-4">
                <p className="mb-3 text-sm font-medium">{feature.label}</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIERS.map(tier => (
                    <div key={tier.id} className="text-center">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">
                        {tier.name}
                      </p>
                      <FeatureValue
                        value={
                          feature[tier.id as keyof typeof feature] as
                            | string
                            | boolean
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-muted-foreground mt-12 text-center text-sm">
          All plans include access to 11 European languages, image download, and
          API key management.
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-6 py-8 text-sm">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/api-docs"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            API Docs
          </Link>
          <Link
            href="/help"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Help
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
