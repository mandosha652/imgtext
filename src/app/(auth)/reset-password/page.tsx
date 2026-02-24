'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validators';
import { authApi } from '@/lib/api/auth';
import { AxiosError } from 'axios';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <Card className="mx-4 w-full max-w-md sm:mx-0">
        <CardContent className="flex flex-col items-center gap-4 px-4 py-10 sm:px-6">
          <div className="bg-destructive/10 flex h-14 w-14 items-center justify-center rounded-full">
            <XCircle className="text-destructive h-7 w-7" />
          </div>
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold sm:text-xl">Invalid link</h2>
            <p className="text-muted-foreground text-sm">
              This password reset link is missing a token. Please request a new
              one.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="text-primary text-sm hover:underline"
          >
            Request new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (succeeded) {
    return (
      <Card className="mx-4 w-full max-w-md sm:mx-0">
        <CardContent className="flex flex-col items-center gap-4 px-4 py-10 sm:px-6">
          <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
            <CheckCircle className="text-primary h-7 w-7" />
          </div>
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold sm:text-xl">
              Password updated
            </h2>
            <p className="text-muted-foreground text-sm">
              Your password has been reset. You can now sign in with your new
              password.
            </p>
          </div>
          <Link href="/login" className="text-primary text-sm hover:underline">
            Sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: data.new_password });
      setSucceeded(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast.error(
        axiosError.response?.data?.detail ||
          'Reset link may be expired. Please request a new one.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-4 w-full max-w-md sm:mx-0">
      <CardHeader className="space-y-2 px-4 sm:space-y-3 sm:px-6">
        <CardTitle className="text-xl font-bold sm:text-2xl">
          Reset password
        </CardTitle>
        <CardDescription className="text-sm">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} aria-busy={isLoading}>
        <fieldset disabled={isLoading}>
          <CardContent className="space-y-4 px-4 sm:space-y-6 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="new_password">New password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a new password"
                  autoComplete="new-password"
                  {...register('new_password')}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              {errors.new_password && (
                <p className="text-destructive text-sm">
                  {errors.new_password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <Eye className="text-muted-foreground h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? 'Hide password' : 'Show password'}
                  </span>
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-destructive text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 px-4 pt-4 sm:gap-4 sm:px-6 sm:pt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set new password
            </Button>
            <p className="text-muted-foreground text-center text-xs sm:text-sm">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-primary hover:underline"
                tabIndex={isLoading ? -1 : undefined}
                aria-disabled={isLoading}
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </fieldset>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="mx-4 w-full max-w-md sm:mx-0">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
