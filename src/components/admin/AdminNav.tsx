'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Layers,
  Shield,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { adminKeyStorage } from '@/lib/api/admin';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false },
  { href: '/admin/batches', label: 'Batches', icon: Layers, exact: false },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    adminKeyStorage.clear();
    // Clear the session cookie that middleware uses to guard /admin routes
    document.cookie =
      'admin_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    router.push('/dashboard');
  };

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            <span className="text-lg font-semibold">Admin</span>
            <Badge
              variant="outline"
              className="border-orange-300 text-xs text-orange-600"
            >
              Internal
            </Badge>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(item => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn('gap-2', isActive && 'bg-accent')}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hidden gap-2 md:flex"
          >
            <LogOut className="h-4 w-4" />
            Exit Admin
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="animate-in slide-in-from-top-2 border-t duration-200 md:hidden">
          <nav className="container mx-auto max-w-7xl space-y-1 px-4 py-3">
            {navItems.map(item => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-2',
                      isActive && 'bg-accent'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="text-muted-foreground w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Exit Admin
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
