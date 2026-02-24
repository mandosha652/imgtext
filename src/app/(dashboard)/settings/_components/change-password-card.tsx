'use client';

import { Lock, Loader2 } from 'lucide-react';
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

interface ChangePasswordCardProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isPending: boolean;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onSubmit: () => void;
}

export function ChangePasswordCard({
  currentPassword,
  newPassword,
  confirmPassword,
  isPending,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ChangePasswordCardProps) {
  return (
    <Card id="password">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="text-muted-foreground h-4 w-4" />
          <div>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password. You will be signed out immediately.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={e => onCurrentPasswordChange(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => onNewPasswordChange(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => onConfirmPasswordChange(e.target.value)}
              disabled={isPending}
              onKeyDown={e => {
                if (e.key === 'Enter') onSubmit();
              }}
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={
              isPending || !currentPassword || !newPassword || !confirmPassword
            }
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
