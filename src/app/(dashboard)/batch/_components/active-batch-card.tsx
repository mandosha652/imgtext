'use client';

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BatchProgress } from '@/components/features/batch';
import { useBatchStream } from '@/hooks';
import type { BatchStatusResponse } from '@/types';

interface ActiveBatchCardProps {
  batch: BatchStatusResponse;
  onCancel: () => void;
  isCancelling: boolean;
  onDone: () => void;
}

export function ActiveBatchCard({
  batch,
  onCancel,
  isCancelling,
  onDone,
}: ActiveBatchCardProps) {
  const isActive = batch.status === 'pending' || batch.status === 'processing';
  const { progress } = useBatchStream(batch.batch_id, isActive);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (progress?.done) {
      onDoneRef.current();
    }
  }, [progress?.done]);

  const merged: BatchStatusResponse = progress
    ? {
        ...batch,
        status: progress.status as BatchStatusResponse['status'],
        completed_count: progress.completed_count,
        failed_count: progress.failed_count,
      }
    : batch;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="relative flex h-2 w-2">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
            </span>
            Running
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            {format(new Date(batch.created_at), 'HH:mm')}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <BatchProgress
          batchStatus={merged}
          onCancel={onCancel}
          isCancelling={isCancelling}
        />
      </CardContent>
    </Card>
  );
}
