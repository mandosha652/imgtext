'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
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

const TIER_COLORS: Record<string, string> = {
  free: '',
  pro: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  enterprise:
    'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
};

function UserRow({ user }: { user: AdminUserSummary }) {
  return (
    <Link href={`/admin/users/${user.id}`}>
      <div className="hover:bg-muted/50 flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{user.email}</p>
          {user.name && (
            <p className="text-muted-foreground truncate text-sm">
              {user.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs ${TIER_COLORS[user.tier] ?? ''}`}
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
              className="border-amber-300 bg-amber-50 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
            >
              Unverified
            </Badge>
          )}
          <span className="text-muted-foreground hidden text-xs sm:block">
            {format(new Date(user.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>
    </Link>
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
        <p className="text-muted-foreground text-sm">
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
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-14 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-12">
              <AlertTriangle className="text-destructive h-8 w-8" />
              <p className="text-destructive font-medium">
                Failed to load users
              </p>
              <p className="text-muted-foreground text-sm">
                Check your admin key and try again
              </p>
            </div>
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              No users found matching your filters
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data?.items?.map(user => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
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
