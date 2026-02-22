'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
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
import { useAuth } from '@/hooks';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { AxiosError } from 'axios';

function LoginForm() {
  const { loginAsync, isLoggingIn } = useAuth();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginAsync(data, callbackUrl);
      toast.success('Welcome back!');
      // Trigger browser password save detection
      if (
        typeof window !== 'undefined' &&
        'PasswordCredential' in window &&
        navigator.credentials
      ) {
        const PasswordCredentialConstructor = (
          window as unknown as {
            PasswordCredential: new (data: {
              id: string;
              password: string;
            }) => Credential;
          }
        ).PasswordCredential;
        const cred = new PasswordCredentialConstructor({
          id: data.email,
          password: data.password,
        });
        navigator.credentials.store(cred).catch(() => {
          // Silently fail if not supported
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      toast.error(
        axiosError.response?.data?.detail || 'Invalid email or password'
      );
    }
  };

  return (
    <Card className="mx-4 w-full max-w-md sm:mx-0">
      <CardHeader className="space-y-2 px-4 sm:space-y-3 sm:px-6">
        <CardTitle className="text-xl font-bold sm:text-2xl">Sign in</CardTitle>
        <CardDescription className="text-sm">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-muted-foreground hover:text-primary focus-visible:ring-ring/50 rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password')}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="text-muted-foreground h-4 w-4 transition-opacity" />
                ) : (
                  <Eye className="text-muted-foreground h-4 w-4 transition-opacity" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 px-4 pt-4 sm:gap-4 sm:px-6 sm:pt-6">
          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
          <p className="text-muted-foreground text-center text-xs sm:text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
