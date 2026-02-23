'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type {
  ApiKeyCreateRequest,
  ApiKeyRenameRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/types';

export function useApiKeys() {
  return useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => authApi.listApiKeys(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApiKeyCreateRequest) => authApi.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => authApi.revokeApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

export function useRenameApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      keyId,
      data,
    }: {
      keyId: string;
      data: ApiKeyRenameRequest;
    }) => authApi.renameApiKey(keyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

export function useApiKeyStats(keyId: string | null) {
  return useQuery({
    queryKey: ['apiKeyStats', keyId],
    queryFn: () => authApi.getApiKeyStats(keyId!),
    enabled: !!keyId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateProfile(data),
    onSuccess: updatedUser => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  });
}
