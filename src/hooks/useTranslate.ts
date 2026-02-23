'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { toast } from 'sonner';
import { translateApi } from '@/lib/api';
import {
  BATCH_STATUS_POLL_INTERVAL,
  BATCH_LIST_POLL_INTERVAL,
} from '@/lib/constants';
import { useNotificationStore } from '@/store/notificationStore';
import type { BatchStatus } from '@/types';

interface TranslateImageOptions {
  sourceLang?: string;
  excludeText?: string;
}

export function useTranslateImage() {
  return useMutation({
    mutationFn: ({
      file,
      targetLang,
      options,
      signal,
    }: {
      file: File;
      targetLang: string;
      options?: TranslateImageOptions;
      signal?: AbortSignal;
    }) => translateApi.translateImage(file, targetLang, { ...options, signal }),
  });
}

interface CreateBatchOptions {
  sourceLanguage?: string;
  excludeText?: string;
  webhookUrl?: string;
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      files,
      targetLanguages,
      options,
    }: {
      files: File[];
      targetLanguages: string[];
      options?: CreateBatchOptions;
    }) => translateApi.createBatch(files, targetLanguages, options),
    onSuccess: () => {
      // Invalidate batches query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });
}

const TERMINAL_STATUSES: BatchStatus[] = [
  'completed',
  'partially_completed',
  'failed',
  'cancelled',
];

export function useBatchStatus(
  batchId: string | null,
  options?: { enabled?: boolean }
) {
  const pushNotification = useNotificationStore(s => s.push);
  const notifiedRef = useRef<string | null>(null);

  return useQuery({
    queryKey: ['batch', batchId],
    queryFn: () => translateApi.getBatchStatus(batchId!),
    enabled: !!batchId && (options?.enabled ?? true),
    refetchInterval: query => {
      const status = query.state.data?.status;
      if (status === 'pending' || status === 'processing') {
        return BATCH_STATUS_POLL_INTERVAL;
      }
      return false;
    },
    select: data => {
      if (
        data &&
        TERMINAL_STATUSES.includes(data.status) &&
        notifiedRef.current !== data.batch_id
      ) {
        notifiedRef.current = data.batch_id;

        const total = data.total_images;
        const done = data.completed_count;
        const failed = data.failed_count;
        const href = '/history';

        if (data.status === 'completed') {
          const msg = `Batch complete — ${done}/${total} image${total !== 1 ? 's' : ''} translated`;
          toast.success(msg);
          pushNotification({
            message: msg,
            href,
            type: 'success',
            timestamp: new Date().toISOString(),
          });
        } else if (data.status === 'partially_completed') {
          const msg = `Batch partially complete — ${done} done, ${failed} failed`;
          toast.warning(msg);
          pushNotification({
            message: msg,
            href,
            type: 'warning',
            timestamp: new Date().toISOString(),
          });
        } else if (data.status === 'failed') {
          const msg = `Batch failed — ${failed}/${total} image${total !== 1 ? 's' : ''} could not be processed`;
          toast.error(msg);
          pushNotification({
            message: msg,
            href,
            type: 'error',
            timestamp: new Date().toISOString(),
          });
        } else if (data.status === 'cancelled') {
          toast.info('Batch cancelled');
          pushNotification({
            message: 'Batch was cancelled',
            href,
            type: 'info',
            timestamp: new Date().toISOString(),
          });
        }
      }
      return data;
    },
  });
}

export function useCancelBatch() {
  return useMutation({
    mutationFn: (batchId: string) => translateApi.cancelBatch(batchId),
  });
}

export function useListBatches(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['batches'],
    queryFn: () => translateApi.listBatches(),
    enabled: options?.enabled ?? false,
    // SSE streams handle live progress — only poll to discover new/cancelled
    // batches that might not be visible yet, at a slower cadence.
    refetchInterval: BATCH_LIST_POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function useTranslationHistory(options?: {
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [
      'translationHistory',
      options?.limit ?? 50,
      options?.offset ?? 0,
    ],
    queryFn: () =>
      translateApi.getTranslationHistory({
        limit: options?.limit ?? 50,
        offset: options?.offset ?? 0,
      }),
    staleTime: 30 * 1000,
  });
}

export function useRetryBatchImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ batchId, imageId }: { batchId: string; imageId: string }) =>
      translateApi.retryBatchImage(batchId, imageId),
    onSuccess: (_data, { batchId }) => {
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
    },
  });
}
