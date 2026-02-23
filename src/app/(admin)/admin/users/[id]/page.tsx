'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Trash2,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  useAdminUser,
  useAdminUpdateUser,
  useAdminDeleteUser,
  useAdminImpersonateUser,
} from '@/hooks';

const TIER_COLORS: Record<string, string> = {
  free: '',
  pro: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  enterprise:
    'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
};

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 text-center">
      <p className="text-2xl font-bold">{Number(value).toLocaleString()}</p>
      <p className="text-muted-foreground mt-1 text-xs">{label}</p>
    </div>
  );
}

function UserActionsPanel({
  user,
  updateUser,
  deleteUser,
  impersonateUser,
  router,
}: {
  user: ReturnType<typeof useAdminUser>['data'] & object;
  updateUser: ReturnType<typeof useAdminUpdateUser>;
  deleteUser: ReturnType<typeof useAdminDeleteUser>;
  impersonateUser: ReturnType<typeof useAdminImpersonateUser>;
  router: ReturnType<typeof useRouter>;
}) {
  const [selectedTier, setSelectedTier] = useState(user.tier);

  const handleSaveTier = () => {
    updateUser.mutate(
      { userId: user.id, data: { tier: selectedTier } },
      { onSuccess: () => toast.success('Tier updated') }
    );
  };

  const handleToggleActive = () => {
    updateUser.mutate(
      { userId: user.id, data: { is_active: !user.is_active } },
      {
        onSuccess: () =>
          toast.success(user.is_active ? 'User suspended' : 'User reactivated'),
      }
    );
  };

  const handleImpersonate = async () => {
    try {
      const res = await impersonateUser.mutateAsync(user.id);
      await navigator.clipboard.writeText(res.access_token);
      toast.success('Token copied — use as Bearer token', {
        description: `Expires in ${Math.round(res.expires_in_seconds / 60)} min`,
      });
    } catch {
      toast.error('Failed to impersonate user');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(user.id);
      toast.success('User deleted');
      router.push('/admin/users');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tier */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Plan Tier</p>
        <div className="flex gap-2">
          <Select
            value={selectedTier}
            onValueChange={v =>
              setSelectedTier(v as 'free' | 'pro' | 'enterprise')
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSaveTier}
            disabled={selectedTier === user.tier || updateUser.isPending}
            size="sm"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        {/* Suspend / Unsuspend */}
        <Button
          variant={user.is_active ? 'outline' : 'default'}
          className={
            user.is_active
              ? 'w-full border-orange-300 text-orange-600'
              : 'w-full'
          }
          onClick={handleToggleActive}
          disabled={updateUser.isPending}
        >
          <UserCog className="mr-2 h-4 w-4" />
          {user.is_active ? 'Suspend User' : 'Reactivate User'}
        </Button>

        {/* Impersonate */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleImpersonate}
          disabled={impersonateUser.isPending}
        >
          <Shield className="mr-2 h-4 w-4" />
          {impersonateUser.isPending
            ? 'Generating...'
            : 'Impersonate (copy token)'}
        </Button>
      </div>

      <div className="border-t pt-4">
        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={deleteUser.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {user.email}?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the user and all their data including
                batches, jobs, and API keys. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: user, isLoading, error } = useAdminUser(id);
  const updateUser = useAdminUpdateUser();
  const deleteUser = useAdminDeleteUser();
  const impersonateUser = useAdminImpersonateUser();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading user...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <AlertTriangle className="text-destructive h-8 w-8" />
        <p className="text-destructive font-medium">User not found</p>
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/admin/users" className="shrink-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold">{user.email}</h1>
          {user.name && (
            <p className="text-muted-foreground text-sm">{user.name}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={TIER_COLORS[user.tier] ?? ''}>
            {user.tier}
          </Badge>
          {!user.is_active && <Badge variant="destructive">Suspended</Badge>}
          {user.is_verified ? (
            <Badge
              variant="outline"
              className="border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-400"
            >
              Verified
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
            >
              Unverified
            </Badge>
          )}
        </div>
      </div>

      {/* Usage stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Total Batches" value={user.total_batches} />
        <StatBox label="Images Processed" value={user.total_images_processed} />
        <StatBox label="Translations" value={user.total_translations} />
        <StatBox label="API Keys" value={user.api_key_count} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap justify-between gap-1">
              <span className="text-muted-foreground shrink-0">User ID</span>
              <span className="font-mono text-xs break-all">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span>{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Updated</span>
              <span>{format(new Date(user.updated_at), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Active</span>
              <span>
                {user.last_activity
                  ? format(new Date(user.last_activity), 'MMM d, yyyy')
                  : 'Never'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin Actions</CardTitle>
            <CardDescription>Manage this user account</CardDescription>
          </CardHeader>
          <CardContent>
            <UserActionsPanel
              user={user}
              updateUser={updateUser}
              deleteUser={deleteUser}
              impersonateUser={impersonateUser}
              router={router}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
