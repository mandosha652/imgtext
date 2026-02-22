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
