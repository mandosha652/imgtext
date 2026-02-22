'use client';

import { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
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
import { adminKeyStorage } from '@/lib/api/admin';

interface AdminAuthGateProps {
  onAuthenticated: () => void;
}

export function AdminAuthGate({ onAuthenticated }: AdminAuthGateProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Admin key is required');
      return;
    }
    adminKeyStorage.set(key.trim());
    onAuthenticated();
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Enter your admin secret key to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-key">Admin Secret Key</Label>
              <div className="relative">
                <Input
                  id="admin-key"
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={e => {
                    setKey(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter admin key..."
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-full px-3"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              Access Admin Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
