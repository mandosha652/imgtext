'use client';

import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DangerZoneCardProps {
  deleteAccountOpen: boolean;
  onDeleteAccountOpenChange: (open: boolean) => void;
  onDeleteAccount: () => void;
  isPending: boolean;
}

export function DangerZoneCard({
  deleteAccountOpen,
  onDeleteAccountOpenChange,
  onDeleteAccount,
  isPending,
}: DangerZoneCardProps) {
  return (
    <Card id="danger-zone" className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Irreversible actions that affect your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-muted-foreground text-sm">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Dialog
            open={deleteAccountOpen}
            onOpenChange={onDeleteAccountOpenChange}
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
                  onClick={() => onDeleteAccountOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={onDeleteAccount}
                  disabled={isPending}
                >
                  {isPending && (
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
  );
}
