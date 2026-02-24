'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  useAuth,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useRenameApiKey,
  useUpdateProfile,
  useChangePassword,
} from '@/hooks';
import { authApi, tokenStorage } from '@/lib/api';
import { AccountInfoCard } from './_components/account-info-card';
import { ChangePasswordCard } from './_components/change-password-card';
import { ApiKeysCard } from './_components/api-keys-card';
import { DangerZoneCard } from './_components/danger-zone-card';

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
  const changePassword = useChangePassword();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password changed — please log in again');
      tokenStorage.clearTokens();
      queryClient.clear();
      logout();
      router.push('/login');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 400) {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to change password');
      }
    }
  };

  // API key state
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiryDays, setNewKeyExpiryDays] = useState('');
  const [newKeyShown, setNewKeyShown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);
  const [rotatingKeyId, setRotatingKeyId] = useState<string | null>(null);
  const [renamingKeyId, setRenamingKeyId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleCreateKey = async () => {
    try {
      const expiryNum = parseInt(newKeyExpiryDays, 10);
      const result = await createApiKey.mutateAsync({
        name: newKeyName || 'Default',
        ...(expiryNum > 0 ? { expires_in_days: expiryNum } : {}),
      });
      setNewKeyShown(result.key);
      try {
        await navigator.clipboard.writeText(result.key);
        setCopied(true);
        toast.success('API key created and copied to clipboard');
      } catch {
        toast.warning(
          'API key created — clipboard unavailable, copy it manually before closing'
        );
      }
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
    setRevokeConfirmId(null);
    let undone = false;
    const toastId = toast('API key revoked', {
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: () => {
          undone = true;
          toast.dismiss(toastId);
          toast.info('Revocation cancelled — key is still active');
        },
      },
    });
    await new Promise(resolve => setTimeout(resolve, 5500));
    if (undone) return;
    try {
      await revokeApiKey.mutateAsync(keyId);
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

  // Profile edit state
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

  // Delete account
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and API keys
        </p>
      </div>
      <div className="flex gap-6 md:gap-8">
        {/* Left sub-nav */}
        <nav className="hidden w-44 shrink-0 md:block">
          <ul className="sticky top-24 space-y-1 text-sm">
            {[
              { label: 'Account', href: '#account' },
              { label: 'Password', href: '#password' },
              { label: 'API Keys', href: '#api-keys' },
              { label: 'Danger Zone', href: '#danger-zone' },
            ].map(item => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 block rounded-md px-3 py-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-8">
          <AccountInfoCard
            user={user}
            isLoadingUser={isLoadingUser}
            isEditingProfile={isEditingProfile}
            profileName={profileName}
            profileEmail={profileEmail}
            isPending={updateProfile.isPending}
            onStartEdit={handleStartEditProfile}
            onCancelEdit={handleCancelEditProfile}
            onSave={handleSaveProfile}
            onNameChange={setProfileName}
            onEmailChange={setProfileEmail}
          />

          <ChangePasswordCard
            currentPassword={currentPassword}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            isPending={changePassword.isPending}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleChangePassword}
          />

          <ApiKeysCard
            apiKeys={apiKeys}
            isLoadingKeys={isLoadingKeys}
            keysError={keysError}
            onRefetchKeys={() => refetchKeys()}
            dialogOpen={dialogOpen}
            onDialogOpenChange={setDialogOpen}
            newKeyName={newKeyName}
            newKeyExpiryDays={newKeyExpiryDays}
            newKeyShown={newKeyShown}
            copied={copied}
            isCreating={createApiKey.isPending}
            onNewKeyNameChange={setNewKeyName}
            onNewKeyExpiryDaysChange={setNewKeyExpiryDays}
            onCreateKey={handleCreateKey}
            onCopyKey={handleCopyKey}
            onDialogClose={handleDialogClose}
            revokeConfirmId={revokeConfirmId}
            onRevokeConfirmIdChange={setRevokeConfirmId}
            onRevokeKey={handleRevokeKey}
            isRevoking={revokeApiKey.isPending}
            renamingKeyId={renamingKeyId}
            renameValue={renameValue}
            isRenaming={renameApiKey.isPending}
            onStartRename={handleStartRename}
            onCancelRename={handleCancelRename}
            onConfirmRename={handleConfirmRename}
            onRenameValueChange={setRenameValue}
            rotatingKeyId={rotatingKeyId}
            onRotateKey={handleRotateKey}
          />

          <DangerZoneCard
            deleteAccountOpen={deleteAccountOpen}
            onDeleteAccountOpenChange={setDeleteAccountOpen}
            onDeleteAccount={() => deleteAccountMutation.mutate()}
            isPending={deleteAccountMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
