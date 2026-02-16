import { DashboardNav } from '@/components/layout/DashboardNav';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth is handled by middleware - no client-side checks needed
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
