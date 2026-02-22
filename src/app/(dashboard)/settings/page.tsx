'use client';
import { useState } from 'react';
import {
  Copy,
  Check,
  Plus,
  Trash2,
  Key,
  Loader2,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Pencil,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import {
  useAuth,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useRenameApiKey,
  useApiKeyStats,
  useUpdateProfile,
} from '@/hooks';
import { authApi, tokenStorage } from '@/lib/api';
import {
  formatDistanceToNowStrict,
  isPast,
  isTomorrow,
  differenceInDays,
  format,
} from 'date-fns';

function formatLastUsed(iso: string | null): string {
  if (!iso) return 'Never used';
  return `Used ${formatDistanceToNowStrict(new Date(iso), { addSuffix: true })}`;
}

function formatExpiry(iso: string | null): {
  label: string;
  urgent: boolean;
} | null {
  if (!iso) return null;
  const expiry = new Date(iso);
  if (isPast(expiry)) return { label: 'Expired', urgent: true };
  if (isTomorrow(expiry)) return { label: 'Expires tomorrow', urgent: true };
  const daysLeft = differenceInDays(expiry, new Date());
  if (daysLeft <= 30)
    return { label: `Expires in ${daysLeft} days`, urgent: daysLeft <= 7 };
  return { label: `Expires ${format(expiry, 'MMM d, yyyy')}`, urgent: false };
}

function ApiKeyStatsPanel({ keyId }: { keyId: string }) {
  const { data, isLoading } = useApiKeyStats(keyId);
  if (isLoading)
    return (
      <p className="text-muted-foreground mt-2 text-xs">Loading stats...</p>
    );
  if (!data) return null;
  return (
    <div className="mt-2 flex gap-4 text-xs">
      <span>
        <span className="font-medium">{data.total_images}</span> images
      </span>
      <span>
        <span className="font-medium">{data.total_translations}</span>{' '}
        translations
      </span>
      <span>
        <span className="font-medium">{data.total_requests}</span> requests
      </span>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: isLoadingUser, logout } = useAuth();
  const {
    data: apiKeys,
    isLoading: isLoadingKeys,
    error: keysError,
    refetch: refetchKeys,
  } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const renameApiKey = useRenameApiKey();

  const updateProfile = useUpdateProfile();

  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiryDays, setNewKeyExpiryDays] = useState('');
  const [newKeyShown, setNewKeyShown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [rotatingKeyId, setRotatingKeyId] = useState<string | null>(null);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [renamingKeyId, setRenamingKeyId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');

  const handleStartEditProfile = () => {
    setProfileName(user?.name ?? '');
    setProfileEmail(user?.email ?? '');
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
    setProfileName('');
    setProfileEmail('');
  };

  const handleSaveProfile = async () => {
    const updates: { name?: string; email?: string } = {};
    if (profileName.trim() !== (user?.name ?? ''))
      updates.name = profileName.trim();
    if (profileEmail.trim() !== user?.email)
      updates.email = profileEmail.trim();
    if (Object.keys(updates).length === 0) {
      setIsEditingProfile(false);
      return;
    }
    try {
      await updateProfile.mutateAsync(updates);
      toast.success('Profile updated');
      setIsEditingProfile(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const deleteAccountMutation = useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => {
      tokenStorage.clearTokens();
      queryClient.clear();
      logout();
      router.push('/login');
      toast.success('Account deleted');
    },
    onError: () => {
      toast.error('Failed to delete account');
    },
  });

  const handleCreateKey = async () => {
    try {
      const expiryNum = parseInt(newKeyExpiryDays, 10);
      const result = await createApiKey.mutateAsync({
        name: newKeyName || 'Default',
        ...(expiryNum > 0 ? { expires_in_days: expiryNum } : {}),
      });
      setNewKeyShown(result.key);
      toast.success('API key created');
    } catch {
      toast.error('Failed to create API key');
    }
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy — please select and copy the key manually');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await revokeApiKey.mutateAsync(keyId);
      toast.success('API key revoked');
      setRevokeConfirmId(null);
    } catch {
      toast.error('Failed to revoke API key');
    }
  };

  const handleStartRename = (keyId: string, currentName: string) => {
    setRenamingKeyId(keyId);
    setRenameValue(currentName);
  };

  const handleCancelRename = () => {
    setRenamingKeyId(null);
    setRenameValue('');
  };

  const handleConfirmRename = async (keyId: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    try {
      await renameApiKey.mutateAsync({ keyId, data: { name: trimmed } });
      toast.success('API key renamed');
    } catch {
      toast.error('Failed to rename API key');
    } finally {
      setRenamingKeyId(null);
      setRenameValue('');
    }
  };

  const handleRotateKey = async (keyId: string, keyName: string) => {
    setRotatingKeyId(keyId);
    try {
      await revokeApiKey.mutateAsync(keyId);
      const result = await createApiKey.mutateAsync({ name: keyName });
      setNewKeyShown(result.key);
      setDialogOpen(true);
      toast.success('API key rotated — copy your new key');
    } catch {
      toast.error('Failed to rotate API key');
    } finally {
      setRotatingKeyId(null);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewKeyName('');
    setNewKeyExpiryDays('');
    setNewKeyShown(null);
    setCopied(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and API keys
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </div>
            {!isLoadingUser && !isEditingProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEditProfile}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingUser ? (
            <AccountSkeleton />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Email</Label>
                  <Input
                    id="profileEmail"
                    value={
                      isEditingProfile ? profileEmail : (user?.email ?? '')
                    }
                    disabled={!isEditingProfile || updateProfile.isPending}
                    onChange={e => setProfileEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileName">Name</Label>
                  <Input
                    id="profileName"
                    value={isEditingProfile ? profileName : (user?.name ?? '')}
                    disabled={!isEditingProfile || updateProfile.isPending}
                    onChange={e => setProfileName(e.target.value)}
                  />
                </div>
              </div>
              {isEditingProfile && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending && (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEditProfile}
                    disabled={updateProfile.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {user?.tier || 'Free'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user?.is_active ? 'default' : 'destructive'}
                    >
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {user?.is_verified && (
                      <Badge variant="outline">Verified</Badge>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </div>
            <Dialog
              open={dialogOpen}
              onOpenChange={open => {
                // Block closing if key is shown but not yet copied
                if (!open && newKeyShown && !copied) return;
                setDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {newKeyShown ? 'API Key Created' : 'Create API Key'}
                  </DialogTitle>
                  <DialogDescription>
                    {newKeyShown
                      ? "Copy your API key now. You won't be able to see it again."
                      : 'Create a new API key for programmatic access.'}
                  </DialogDescription>
                </DialogHeader>

                {newKeyShown ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={newKeyShown}
                        readOnly
                        className="font-mono text-sm"
                        onFocus={e => e.target.select()}
                      />
                      <Button
                        variant={copied ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => handleCopyKey(newKeyShown)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {copied ? (
                      <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                        <Check className="h-3.5 w-3.5" />
                        Key copied — you can now close this dialog.
                      </p>
                    ) : (
                      <p className="text-destructive text-sm">
                        Copy your API key before closing — you won&apos;t see it
                        again.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Production Key"
                        value={newKeyName}
                        onChange={e => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keyExpiry">Expires in (days)</Label>
                      <Input
                        id="keyExpiry"
                        type="number"
                        min="1"
                        placeholder="Never (leave blank)"
                        value={newKeyExpiryDays}
                        onChange={e => setNewKeyExpiryDays(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {newKeyShown ? (
                    <Button onClick={handleDialogClose} disabled={!copied}>
                      {copied ? 'Close' : 'Copy key first'}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateKey}
                        disabled={createApiKey.isPending}
                      >
                        {createApiKey.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingKeys ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : keysError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="text-destructive h-8 w-8" />
              <p className="mt-2 font-medium">Failed to load API keys</p>
              <p className="text-muted-foreground text-sm">
                Check your connection and try again
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => refetchKeys()}
              >
                Retry
              </Button>
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <div className="space-y-4">
              {apiKeys.map(key => (
                <div
                  key={key.id}
                  className="group hover:bg-muted/30 flex items-center justify-between rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                      <Key className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div>
                      {renamingKeyId === key.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            className="h-7 w-36 text-sm"
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter')
                                handleConfirmRename(key.id);
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={renameApiKey.isPending}
                            onClick={() => handleConfirmRename(key.id)}
                            title="Save name"
                          >
                            {renameApiKey.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleCancelRename}
                            title="Cancel"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <p className="font-medium">{key.name}</p>
                          {key.is_active && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={() =>
                                handleStartRename(key.id, key.name)
                              }
                              title="Rename key"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                      <p className="text-muted-foreground text-sm">
                        {key.prefix}...
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatLastUsed(key.last_used_at)}
                      </p>
                      <ApiKeyStatsPanel keyId={key.id} />
                      {key.expires_at &&
                        (() => {
                          const expiry = formatExpiry(key.expires_at);
                          if (!expiry) return null;
                          return (
                            <p
                              className={`mt-0.5 flex items-center gap-1 text-xs ${expiry.urgent ? 'text-amber-600' : 'text-muted-foreground'}`}
                            >
                              <Calendar className="h-3 w-3" />
                              {expiry.label}
                            </p>
                          );
                        })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={key.is_active ? 'default' : 'secondary'}>
                      {key.is_active ? 'Active' : 'Revoked'}
                    </Badge>
                    {key.is_active && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Rotate key — revokes this key and creates a new one with the same name"
                        disabled={rotatingKeyId === key.id}
                        onClick={() => handleRotateKey(key.id, key.name)}
                      >
                        {rotatingKeyId === key.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {key.is_active && (
                      <Dialog
                        open={revokeConfirmId === key.id}
                        onOpenChange={open =>
                          setRevokeConfirmId(open ? key.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="text-destructive h-5 w-5" />
                              Revoke API Key
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to revoke{' '}
                              <span className="font-medium">{key.name}</span>?
                              Any integrations using this key will stop working
                              immediately. This cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setRevokeConfirmId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleRevokeKey(key.id)}
                              disabled={revokeApiKey.isPending}
                            >
                              {revokeApiKey.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Revoke Key
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Key className="text-muted-foreground h-8 w-8" />
              <p className="text-muted-foreground mt-2">No API keys yet</p>
              <p className="text-muted-foreground text-sm">
                Create an API key to access the API programmatically
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-muted-foreground text-sm">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Dialog
              open={deleteAccountOpen}
              onOpenChange={setDeleteAccountOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive h-5 w-5" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This will permanently delete your account, all API keys, and
                    all associated data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteAccountOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteAccountMutation.mutate()}
                    disabled={deleteAccountMutation.isPending}
                  >
                    {deleteAccountMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Delete My Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
