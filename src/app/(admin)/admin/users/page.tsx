'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminUsers } from '@/hooks';
import type { AdminUserSummary } from '@/types';

const PAGE_SIZE = 20;

const TIER_STYLES: Record<string, string> = {
  free: 'border-border text-muted-foreground',
  pro: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  enterprise:
    'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
};

const AVATAR_COLORS = [
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400',
];

function avatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++)
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function UserRow({ user }: { user: AdminUserSummary }) {
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();
  const colorClass = avatarColor(user.email);

  return (
    <Link href={`/admin/users/${user.id}`}>
      <div className="hover:bg-muted/50 group flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors">
        {/* Avatar */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${colorClass}`}
        >
          {initials}
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-medium">
            {user.email}
          </p>
          {user.name && (
            <p className="text-muted-foreground mt-0.5 truncate text-xs leading-tight">
              {user.name}
            </p>
          )}
        </div>

        {/* Badges & date */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          <Badge
            variant="outline"
            className={`text-xs ${TIER_STYLES[user.tier] ?? ''}`}
          >
            {user.tier}
          </Badge>
          {!user.is_active && (
            <Badge variant="destructive" className="text-xs">
              Suspended
            </Badge>
          )}
          {!user.is_verified && (
            <Badge
              variant="outline"
              className="hidden border-amber-300 bg-amber-50 text-xs text-amber-700 sm:inline-flex dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
            >
              Unverified
            </Badge>
          )}
          <span className="text-muted-foreground hidden text-xs tabular-nums sm:block">
            {format(new Date(user.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </Link>
  );
}

function UserRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded-full" />
      <div className="flex-1 space-y-1.5">
        <div className="bg-muted h-3.5 w-48 animate-pulse rounded" />
        <div className="bg-muted h-3 w-32 animate-pulse rounded" />
      </div>
      <div className="flex gap-2">
        <div className="bg-muted h-5 w-12 animate-pulse rounded-full" />
        <div className="bg-muted hidden h-3.5 w-20 animate-pulse rounded sm:block" />
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('all');
  const [status, setStatus] = useState('all');
  const [offset, setOffset] = useState(0);

  const params = {
    search: search || undefined,
    tier: tier !== 'all' ? tier : undefined,
    is_active:
      status === 'active' ? true : status === 'suspended' ? false : undefined,
    limit: PAGE_SIZE,
    offset,
  };

  const { data, isLoading, error } = useAdminUsers(params);

  const handleSearch = (value: string) => {
    setSearch(value);
    setOffset(0);
  };

  const handleFilterChange = () => {
    setOffset(0);
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {data?.total != null
            ? `${data.total.toLocaleString()} total users`
            : 'All platform users'}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by email or name..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9"
                autoComplete="off"
              />
            </div>
            <Select
              value={tier}
              onValueChange={v => {
                setTier(v);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={v => {
                setStatus(v);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <UserRowSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <div className="bg-destructive/10 rounded-full p-3">
                <AlertTriangle className="text-destructive h-5 w-5" />
              </div>
              <p className="text-destructive font-medium">
                Failed to load users
              </p>
              <p className="text-muted-foreground text-sm">
                Check your admin key and try again
              </p>
            </div>
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <UserCircle2 className="text-muted-foreground/40 h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                No users found matching your filters
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data?.items?.map(user => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
                {data && (
                  <span className="ml-1">
                    ({data.total.toLocaleString()} total)
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={!data || offset + PAGE_SIZE >= data.total}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
