'use client';

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
import {
  formatDistanceToNowStrict,
  isPast,
  isTomorrow,
  differenceInDays,
  format,
} from 'date-fns';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApiKeyStats } from '@/hooks';
import type { ApiKey } from '@/types';

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

interface ApiKeysCardProps {
  apiKeys: ApiKey[] | undefined;
  isLoadingKeys: boolean;
  keysError: Error | null;
  onRefetchKeys: () => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  newKeyName: string;
  newKeyExpiryDays: string;
  newKeyShown: string | null;
  copied: boolean;
  isCreating: boolean;
  onNewKeyNameChange: (v: string) => void;
  onNewKeyExpiryDaysChange: (v: string) => void;
  onCreateKey: () => void;
  onCopyKey: (key: string) => void;
  onDialogClose: () => void;
  revokeConfirmId: string | null;
  onRevokeConfirmIdChange: (id: string | null) => void;
  onRevokeKey: (keyId: string) => void;
  isRevoking: boolean;
  renamingKeyId: string | null;
  renameValue: string;
  isRenaming: boolean;
  onStartRename: (keyId: string, name: string) => void;
  onCancelRename: () => void;
  onConfirmRename: (keyId: string) => void;
  onRenameValueChange: (v: string) => void;
  rotatingKeyId: string | null;
  onRotateKey: (keyId: string, name: string) => void;
}

export function ApiKeysCard({
  apiKeys,
  isLoadingKeys,
  keysError,
  onRefetchKeys,
  dialogOpen,
  onDialogOpenChange,
  newKeyName,
  newKeyExpiryDays,
  newKeyShown,
  copied,
  isCreating,
  onNewKeyNameChange,
  onNewKeyExpiryDaysChange,
  onCreateKey,
  onCopyKey,
  onDialogClose,
  revokeConfirmId,
  onRevokeConfirmIdChange,
  onRevokeKey,
  isRevoking,
  renamingKeyId,
  renameValue,
  isRenaming,
  onStartRename,
  onCancelRename,
  onConfirmRename,
  onRenameValueChange,
  rotatingKeyId,
  onRotateKey,
}: ApiKeysCardProps) {
  return (
    <Card id="api-keys">
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
              if (!open && newKeyShown && !copied) return;
              onDialogOpenChange(open);
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
                      onClick={() => onCopyKey(newKeyShown)}
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
                      onChange={e => onNewKeyNameChange(e.target.value)}
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
                      onChange={e => onNewKeyExpiryDaysChange(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                {newKeyShown ? (
                  <Button onClick={onDialogClose} disabled={!copied}>
                    {copied ? 'Close' : 'Copy key first'}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={onDialogClose}>
                      Cancel
                    </Button>
                    <Button onClick={onCreateKey} disabled={isCreating}>
                      {isCreating && (
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
              onClick={onRefetchKeys}
            >
              Retry
            </Button>
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-4">
            {apiKeys.map(key => (
              <div
                key={key.id}
                className="group hover:bg-muted/30 flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                    <Key className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div>
                    {renamingKeyId === key.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          className="h-7 w-full max-w-40 text-sm"
                          value={renameValue}
                          onChange={e => onRenameValueChange(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') onConfirmRename(key.id);
                            if (e.key === 'Escape') onCancelRename();
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={isRenaming}
                          onClick={() => onConfirmRename(key.id)}
                          title="Save name"
                        >
                          {isRenaming ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={onCancelRename}
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
                            className="h-6 w-6 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                            onClick={() => onStartRename(key.id, key.name)}
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
                      onClick={() => onRotateKey(key.id, key.name)}
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
                        onRevokeConfirmIdChange(open ? key.id : null)
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
                            <span className="font-medium">{key.name}</span>? Any
                            integrations using this key will stop working
                            immediately. This cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => onRevokeConfirmIdChange(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => onRevokeKey(key.id)}
                            disabled={isRevoking}
                          >
                            {isRevoking && (
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
  );
}
