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
  FolderX,
  BadgeCheck,
  Mail,
  Key,
  XCircle,
  ChevronDown,
  Calendar,
  Clock,
  Hash,
  Layers,
  Image as ImageIcon,
  Languages,
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
  useAdminWipeTenantFiles,
  useAdminResendVerification,
  useAdminUserApiKeys,
  useAdminRevokeUserApiKey,
} from '@/hooks';

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

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b py-2 text-sm last:border-0">
      <div className="text-muted-foreground flex w-24 shrink-0 items-center gap-1.5 sm:w-32">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="min-w-0 flex-1 text-right">{value}</div>
    </div>
  );
}

function UserActionsPanel({
  user,
  updateUser,
  deleteUser,
  impersonateUser,
  wipeTenantFiles,
  resendVerification,
  router,
}: {
  user: ReturnType<typeof useAdminUser>['data'] & object;
  updateUser: ReturnType<typeof useAdminUpdateUser>;
  deleteUser: ReturnType<typeof useAdminDeleteUser>;
  impersonateUser: ReturnType<typeof useAdminImpersonateUser>;
  wipeTenantFiles: ReturnType<typeof useAdminWipeTenantFiles>;
  resendVerification: ReturnType<typeof useAdminResendVerification>;
  router: ReturnType<typeof useRouter>;
}) {
  const [selectedTier, setSelectedTier] = useState(user.tier);
  const [dangerOpen, setDangerOpen] = useState(false);

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
      toast.success('Token copied to clipboard', {
        description: `Expires in ${Math.round(res.expires_in_seconds / 60)} min — use as Bearer token`,
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

  const handleVerifyEmail = () => {
    updateUser.mutate(
      { userId: user.id, data: { is_verified: true } },
      { onSuccess: () => toast.success('Email marked as verified') }
    );
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification.mutateAsync(user.id);
      toast.success('Verification email queued');
    } catch {
      toast.error('Failed to resend verification email');
    }
  };

  const handleWipeFiles = async () => {
    try {
      const res = await wipeTenantFiles.mutateAsync(user.id);
      toast.success('R2 files wiped', {
        description: `${res.files_deleted} files deleted${res.errors > 0 ? `, ${res.errors} errors` : ''}`,
      });
    } catch {
      toast.error('Failed to wipe tenant files');
    }
  };

  return (
    <div className="space-y-5">
      {/* Tier management */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Plan Tier
        </p>
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

      {/* Quick actions */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Actions
        </p>
        <div className="space-y-2">
          {!user.is_verified && (
            <>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleVerifyEmail}
                disabled={updateUser.isPending}
              >
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                Mark Email Verified
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleResendVerification}
                disabled={resendVerification.isPending}
              >
                <Mail className="h-4 w-4" />
                {resendVerification.isPending
                  ? 'Sending...'
                  : 'Resend Verification Email'}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            className={`w-full justify-start gap-2 ${user.is_active ? 'hover:border-orange-300 hover:text-orange-600' : ''}`}
            onClick={handleToggleActive}
            disabled={updateUser.isPending}
          >
            <UserCog
              className={`h-4 w-4 ${!user.is_active ? 'text-emerald-500' : ''}`}
            />
            {user.is_active ? 'Suspend User' : 'Reactivate User'}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleImpersonate}
            disabled={impersonateUser.isPending}
          >
            <Shield className="h-4 w-4 text-blue-500" />
            {impersonateUser.isPending
              ? 'Generating...'
              : 'Impersonate (copy token)'}
          </Button>
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <button
          onClick={() => setDangerOpen(v => !v)}
          className="text-muted-foreground hover:text-foreground flex w-full cursor-pointer items-center justify-between text-xs font-medium tracking-wide uppercase transition-colors focus-visible:outline-none"
        >
          <span>Danger Zone</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${dangerOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dangerOpen && (
          <div className="border-destructive/20 bg-destructive/5 mt-2 space-y-2 rounded-lg border p-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                  disabled={wipeTenantFiles.isPending}
                >
                  <FolderX className="h-4 w-4" />
                  {wipeTenantFiles.isPending
                    ? 'Wiping...'
                    : 'Wipe R2 Files (GDPR)'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Wipe all files for {user.email}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Deletes all R2 storage files (images) for this tenant.
                    Database records are kept — use Delete User for full
                    removal. Cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleWipeFiles}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Wipe files
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  disabled={deleteUser.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete User Permanently
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {user.email}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes the user and all their data
                    including batches, jobs, and API keys. This cannot be
                    undone.
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
        )}
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
  const wipeTenantFiles = useAdminWipeTenantFiles();
  const resendVerification = useAdminResendVerification();
  const revokeApiKey = useAdminRevokeUserApiKey();
  const { data: apiKeys } = useAdminUserApiKeys(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
            <div>
              <div className="bg-muted mb-1.5 h-5 w-48 animate-pulse rounded" />
              <div className="bg-muted h-3.5 w-32 animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="bg-destructive/10 rounded-full p-3">
          <AlertTriangle className="text-destructive h-5 w-5" />
        </div>
        <p className="text-destructive font-semibold">User not found</p>
        <Link href="/admin/users">
          <Button variant="outline" size="sm">
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();
  const colorClass = avatarColor(user.email);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <Link href="/admin/users" className="mt-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${colorClass}`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl leading-tight font-bold">
            {user.email}
          </h1>
          {user.name && (
            <p className="text-muted-foreground text-sm">{user.name}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={TIER_STYLES[user.tier] ?? ''}>
            {user.tier}
          </Badge>
          {!user.is_active && <Badge variant="destructive">Suspended</Badge>}
          {user.is_verified ? (
            <Badge
              variant="outline"
              className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
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

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Batches', value: user.total_batches, icon: Layers },
          {
            label: 'Images',
            value: user.total_images_processed,
            icon: ImageIcon,
          },
          {
            label: 'Translations',
            value: user.total_translations,
            icon: Languages,
          },
          { label: 'API Keys', value: user.api_key_count, icon: Key },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-muted/50 rounded-lg p-3 text-center">
            <Icon className="text-muted-foreground mx-auto mb-1 h-4 w-4" />
            <p className="text-xl font-bold tabular-nums">
              {Number(value).toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <InfoRow
              label="User ID"
              icon={Hash}
              value={
                <span className="text-muted-foreground font-mono text-xs break-all">
                  {user.id}
                </span>
              }
            />
            <InfoRow
              label="Joined"
              icon={Calendar}
              value={format(new Date(user.created_at), 'MMM d, yyyy')}
            />
            <InfoRow
              label="Updated"
              icon={Clock}
              value={format(new Date(user.updated_at), 'MMM d, yyyy')}
            />
            <InfoRow
              label="Last Active"
              icon={Clock}
              value={
                user.last_activity ? (
                  format(new Date(user.last_activity), 'MMM d, yyyy')
                ) : (
                  <span className="text-muted-foreground">Never</span>
                )
              }
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Admin Actions</CardTitle>
            <CardDescription>Manage this user account</CardDescription>
          </CardHeader>
          <CardContent>
            <UserActionsPanel
              user={user}
              updateUser={updateUser}
              deleteUser={deleteUser}
              impersonateUser={impersonateUser}
              wipeTenantFiles={wipeTenantFiles}
              resendVerification={resendVerification}
              router={router}
            />
          </CardContent>
        </Card>
      </div>

      {/* API Keys */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription>
                {apiKeys && apiKeys.length > 0
                  ? `${apiKeys.length} active key${apiKeys.length !== 1 ? 's' : ''}`
                  : 'Active keys for this user'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!apiKeys || apiKeys.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Key className="text-muted-foreground/40 h-8 w-8" />
              <p className="text-muted-foreground text-sm">No API keys found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map(k => (
                <div
                  key={k.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                >
                  <Key className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {k.name}
                    </span>
                    <span className="text-muted-foreground bg-muted shrink-0 rounded px-1.5 py-0.5 font-mono text-xs">
                      {k.prefix}…
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {k.last_used_at ? (
                      <span className="text-muted-foreground hidden text-xs sm:inline">
                        used {format(new Date(k.last_used_at), 'MMM d')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground hidden text-xs sm:inline">
                        never used
                      </span>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-7 w-7"
                          disabled={revokeApiKey.isPending}
                          title="Revoke key"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Revoke key &ldquo;{k.name}&rdquo;?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            The key will stop working immediately. This cannot
                            be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              revokeApiKey.mutate(
                                { userId: user.id, keyId: k.id },
                                {
                                  onSuccess: () =>
                                    toast.success('API key revoked'),
                                }
                              )
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
