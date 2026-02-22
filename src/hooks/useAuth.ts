'use client';

import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, tokenStorage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { shouldBypassAuth } from '@/config/env';
import type { LoginRequest, RegisterRequest } from '@/types';

export function useAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        return null;
      }
    },
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Handle callback URL after login
  const getCallbackUrl = useCallback(() => {
    return searchParams.get('callbackUrl') || '/dashboard';
  }, [searchParams]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: data => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push(getCallbackUrl());
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: data => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push(getCallbackUrl());
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

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: handleLogout,
    refetchUser,
  };
}
