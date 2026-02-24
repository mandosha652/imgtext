import type { Metadata } from 'next';
import { DashboardNav } from '@/components/layout/DashboardNav';
import { VerificationBanner } from '@/components/layout/VerificationBanner';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { DevBypassBanner } from '@/components/layout/DevBypassBanner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled by middleware - no client-side checks needed
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <DevBypassBanner />
      <VerificationBanner />
      <OfflineBanner />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
