'use client';

import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi, tokenStorage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { shouldBypassAuth } from '@/config/env';
import type { LoginRequest, RegisterRequest } from '@/types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } =
    useAuthStore();

  // Fetch current user on mount (if tokens exist)
  const { refetch: refetchUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (shouldBypassAuth) {
        setLoading(false);
        return user;
      }
      if (!tokenStorage.hasTokens()) {
        setLoading(false);
        return null;
      }
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        return userData;
      } catch {
        tokenStorage.clearTokens();
        setUser(null);
        router.push('/login');
        return null;
      }
    },
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ data }: { data: LoginRequest; callbackUrl?: string }) =>
      authApi.login(data),
    onSuccess: (data, { callbackUrl }) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push(callbackUrl || '/dashboard');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: ({ data }: { data: RegisterRequest; callbackUrl?: string }) =>
      authApi.register(data),
    onSuccess: (data, { callbackUrl }) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push(callbackUrl || '/dashboard');
    },
  });

  // Logout handler
  const handleLogout = useCallback(async () => {
    await authApi.logout();
    logout();
    queryClient.clear();
    router.push('/login');
  }, [logout, queryClient, router]);

  // Initialize auth state
  useEffect(() => {
    if (shouldBypassAuth) {
      setLoading(false);
    }
  }, [setLoading]);

  const login = useCallback(
    (data: LoginRequest, callbackUrl?: string) =>
      loginMutation.mutate({ data, callbackUrl }),
    [loginMutation]
  );

  const loginAsync = useCallback(
    (data: LoginRequest, callbackUrl?: string) =>
      loginMutation.mutateAsync({ data, callbackUrl }),
    [loginMutation]
  );

  const register = useCallback(
    (data: RegisterRequest, callbackUrl?: string) =>
      registerMutation.mutate({ data, callbackUrl }),
    [registerMutation]
  );

  const registerAsync = useCallback(
    (data: RegisterRequest, callbackUrl?: string) =>
      registerMutation.mutateAsync({ data, callbackUrl }),
    [registerMutation]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register,
    registerAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: handleLogout,
    refetchUser,
  };
}
