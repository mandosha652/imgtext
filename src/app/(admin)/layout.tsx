'use client';

import { useState, useLayoutEffect } from 'react';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminAuthGate } from '@/components/admin/AdminAuthGate';
import { adminKeyStorage } from '@/lib/api/admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    setHasKey(adminKeyStorage.has());
  }, []);

  // Avoid flash — wait for client-side check
  if (hasKey === null) return null;

  if (!hasKey) {
    return <AdminAuthGate onAuthenticated={() => setHasKey(true)} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav />
      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
