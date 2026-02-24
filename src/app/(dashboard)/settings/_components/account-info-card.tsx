'use client';

import { Loader2, Pencil } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
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
import type { User } from '@/types';

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

interface AccountInfoCardProps {
  user: User | null | undefined;
  isLoadingUser: boolean;
  isEditingProfile: boolean;
  profileName: string;
  profileEmail: string;
  isPending: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
}

export function AccountInfoCard({
  user,
  isLoadingUser,
  isEditingProfile,
  profileName,
  profileEmail,
  isPending,
  onStartEdit,
  onCancelEdit,
  onSave,
  onNameChange,
  onEmailChange,
}: AccountInfoCardProps) {
  return (
    <Card id="account">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </div>
          {!isLoadingUser && !isEditingProfile && (
            <Button variant="outline" size="sm" onClick={onStartEdit}>
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
                  value={isEditingProfile ? profileEmail : (user?.email ?? '')}
                  disabled={!isEditingProfile || isPending}
                  onChange={e => onEmailChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileName">Name</Label>
                <Input
                  id="profileName"
                  value={isEditingProfile ? profileName : (user?.name ?? '')}
                  disabled={!isEditingProfile || isPending}
                  onChange={e => onNameChange(e.target.value)}
                />
              </div>
            </div>
            {isEditingProfile && (
              <div className="flex gap-2">
                <Button size="sm" onClick={onSave} disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelEdit}
                  disabled={isPending}
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
                  <Badge variant={user?.is_active ? 'default' : 'destructive'}>
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {user?.is_verified && (
                    <Badge variant="outline">Verified</Badge>
                  )}
                </div>
              </div>
            </div>
            {user?.created_at && (
              <div className="space-y-2">
                <Label>Member Since</Label>
                <p className="text-sm">
                  {format(new Date(user.created_at), 'MMMM d, yyyy')}
                  <span className="text-muted-foreground ml-2 text-xs">
                    (
                    {formatDistanceToNow(new Date(user.created_at), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
