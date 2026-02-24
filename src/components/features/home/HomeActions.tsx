'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export function HomeNavActions() {
  const isDevBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const primaryCTA = isAuthenticated || isDevBypass ? '/translate' : '/signup';
  const secondaryCTA = isAuthenticated || isDevBypass ? '/dashboard' : '/login';
  const primaryLabel =
    isAuthenticated || isDevBypass ? 'Start Translating' : 'Get Started';
  const secondaryLabel =
    isAuthenticated || isDevBypass ? 'Dashboard' : 'Sign in';

  return (
    <nav className="flex items-center gap-2 sm:gap-4">
      <Link href={secondaryCTA}>
        <Button variant="ghost" size="sm">
          {secondaryLabel}
        </Button>
      </Link>
      <Link href={primaryCTA}>
        <Button size="sm">{primaryLabel}</Button>
      </Link>
    </nav>
  );
}

export function HeroCTAActions() {
  const isDevBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const primaryCTA = isAuthenticated || isDevBypass ? '/translate' : '/signup';
  const secondaryCTA = isAuthenticated || isDevBypass ? '/dashboard' : '/login';
  const primaryLabel =
    isAuthenticated || isDevBypass ? 'Start Translating' : 'Get Started';
  const secondaryLabel =
    isAuthenticated || isDevBypass ? 'Dashboard' : 'Sign in';

  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
      <Link href={primaryCTA}>
        <Button size="lg" className="gap-2">
          {primaryLabel} <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <Link href={secondaryCTA}>
        <Button size="lg" variant="outline">
          {secondaryLabel}
        </Button>
      </Link>
    </div>
  );
}

export function BottomCTAAction() {
  const isDevBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const primaryCTA = isAuthenticated || isDevBypass ? '/translate' : '/signup';
  const primaryLabel =
    isAuthenticated || isDevBypass ? 'Start Translating' : 'Get Started';

  return (
    <Link href={primaryCTA} className="mt-8">
      <Button size="lg" className="gap-2">
        {primaryLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  );
}
