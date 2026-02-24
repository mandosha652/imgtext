'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
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
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validators';
import { authApi } from '@/lib/api/auth';
import { AxiosError } from 'axios';

function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email: data.email });
      setSubmitted(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast.error(
        axiosError.response?.data?.detail ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="mx-4 w-full max-w-md sm:mx-0">
        <CardContent className="flex flex-col items-center gap-4 px-4 py-10 sm:px-6">
          <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
            <Mail className="text-primary h-7 w-7" />
          </div>
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold sm:text-xl">
              Check your inbox
            </h2>
            <p className="text-muted-foreground text-sm">
              If that email is registered, you&apos;ll receive a password reset
              link shortly.
            </p>
          </div>
          <Link
            href="/login"
            className="text-primary focus-visible:ring-ring/50 rounded text-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-4 w-full max-w-md sm:mx-0">
      <CardHeader className="space-y-2 px-4 sm:space-y-3 sm:px-6">
        <CardTitle className="text-xl font-bold sm:text-2xl">
          Forgot password
        </CardTitle>
        <CardDescription className="text-sm">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} aria-busy={isLoading}>
        <fieldset disabled={isLoading}>
          <CardContent className="space-y-4 px-4 sm:space-y-6 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-destructive text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 px-4 pt-4 sm:gap-4 sm:px-6 sm:pt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
            <p className="text-muted-foreground text-center text-xs sm:text-sm">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-primary focus-visible:ring-ring/50 rounded hover:underline focus-visible:ring-2 focus-visible:outline-none"
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

export default function ForgotPasswordPage() {
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
      <ForgotPasswordForm />
    </Suspense>
  );
}
