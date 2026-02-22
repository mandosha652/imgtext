'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Languages,
  LayoutDashboard,
  Image,
  Layers,
  History,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  HelpCircle,
  Newspaper,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/layout/NotificationBell';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/translate', label: 'Translate', icon: Image },
  { href: '/batch', label: 'Batch', icon: Layers },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/dashboard"
            className="focus-visible:ring-ring/50 flex items-center gap-2 rounded focus-visible:ring-2 focus-visible:outline-none"
          >
            <Languages className="h-6 w-6" />
            <span className="text-lg font-semibold sm:text-xl">
              OCR Translate
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-visible:ring-ring/50 rounded-md focus-visible:ring-2 focus-visible:outline-none"
              >
                <Button
                  variant="ghost"
                  className={cn(
                    'gap-2',
                    pathname === item.href && 'bg-accent font-medium'
                  )}
                  tabIndex={-1}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hidden sm:inline-flex"
          >
            <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative hidden h-9 w-9 rounded-full sm:inline-flex"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  {user?.name && (
                    <p className="text-sm font-medium">{user.name}</p>
                  )}
                  <p className="text-muted-foreground text-xs">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help &amp; FAQ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/changelog">
                  <Newspaper className="mr-2 h-4 w-4" />
                  What&apos;s New
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLogoutDialogOpen(true)}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top-2 border-t duration-200 md:hidden">
          <nav className="container mx-auto max-w-6xl px-4 py-4">
            <div className="flex flex-col space-y-1">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3',
                      pathname === item.href && 'bg-accent'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <div className="mt-3 space-y-1 border-t pt-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    {user?.name && (
                      <p className="text-sm font-medium">{user.name}</p>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                    setMobileMenuOpen(false);
                  }}
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive w-full justify-start gap-3"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLogoutDialogOpen(true);
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Log out
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isLoggingOut}
              onClick={e => {
                e.preventDefault();
                handleLogoutConfirm();
              }}
            >
              {isLoggingOut ? 'Logging out…' : 'Log out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
