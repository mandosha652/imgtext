'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, adminKeyStorage } from '@/lib/api/admin';
import type { AdminUsersParams, AdminBatchesParams } from '@/lib/api/admin';
import type { AdminUpdateUser } from '@/types';

// Re-export param types for convenience
export type { AdminUsersParams, AdminBatchesParams };

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(),
    enabled: adminKeyStorage.has(),
    staleTime: 30 * 1000,
  });
}

export function useAdminUsers(params: AdminUsersParams = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.listUsers(params),
    enabled: adminKeyStorage.has(),
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminApi.getUser(userId),
    enabled: adminKeyStorage.has() && !!userId,
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AdminUpdateUser }) =>
      adminApi.updateUser(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useAdminImpersonateUser() {
  return useMutation({
    mutationFn: (userId: string) => adminApi.impersonateUser(userId),
  });
}

export function useAdminResendVerification() {
  return useMutation({
    mutationFn: (userId: string) => adminApi.resendVerification(userId),
  });
}

export function useAdminUserApiKeys(userId: string) {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'api-keys'],
    queryFn: () => adminApi.getUserApiKeys(userId),
    enabled: adminKeyStorage.has() && !!userId,
  });
}

export function useAdminRevokeUserApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, keyId }: { userId: string; keyId: string }) =>
      adminApi.revokeUserApiKey(userId, keyId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users', userId, 'api-keys'],
      });
    },
  });
}

export function useAdminBatches(params: AdminBatchesParams = {}) {
  return useQuery({
    queryKey: ['admin', 'batches', params],
    queryFn: () => adminApi.listBatches(params),
    enabled: adminKeyStorage.has(),
  });
}

export function useAdminBatch(batchId: string) {
  return useQuery({
    queryKey: ['admin', 'batches', batchId],
    queryFn: () => adminApi.getBatch(batchId),
    enabled: adminKeyStorage.has() && !!batchId,
  });
}

export function useAdminDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => adminApi.deleteBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useAdminCancelBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => adminApi.cancelBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
    },
  });
}

export function useAdminRetryBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchId: string) => adminApi.retryBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
    },
  });
}

export function useAdminResumeStuckBatches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.resumeStuckBatches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
    },
  });
}

export function useAdminRetryImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => adminApi.retryImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
    },
  });
}

export function useAdminCostSummary(
  period: 'today' | 'week' | 'month' | 'alltime' = 'month'
) {
  return useQuery({
    queryKey: ['admin', 'costs', 'summary', period],
    queryFn: () => adminApi.getCostSummary(period),
    enabled: adminKeyStorage.has(),
    staleTime: 5 * 60 * 1000, // 5 min — external API calls, don't hammer
  });
}

export function useAdminCostDaily(days: number = 30) {
  return useQuery({
    queryKey: ['admin', 'costs', 'daily', days],
    queryFn: () => adminApi.getCostDaily(days),
    enabled: adminKeyStorage.has(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminCostByUser(
  period: 'today' | 'week' | 'month' | 'alltime' = 'month'
) {
  return useQuery({
    queryKey: ['admin', 'costs', 'by-user', period],
    queryFn: () => adminApi.getCostByUser(period),
    enabled: adminKeyStorage.has(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminHealth() {
  return useQuery({
    queryKey: ['admin', 'health'],
    queryFn: () => adminApi.getHealth(),
    enabled: adminKeyStorage.has(),
    staleTime: 0,
  });
}

export function useAdminHealthServices() {
  return useQuery({
    queryKey: ['admin', 'health', 'services'],
    queryFn: () => adminApi.getHealthServices(),
    enabled: adminKeyStorage.has(),
    staleTime: 0,
  });
}

export function useAdminLastCleanupRun() {
  return useQuery({
    queryKey: ['admin', 'cleanup', 'last-run'],
    queryFn: () => adminApi.getLastCleanupRun(),
    enabled: adminKeyStorage.has(),
  });
}

export function useAdminRunCleanup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.runCleanup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cleanup'] });
    },
  });
}

export function useAdminWipeTenantFiles() {
  return useMutation({
    mutationFn: (tenantId: string) => adminApi.wipeTenantFiles(tenantId),
  });
}
