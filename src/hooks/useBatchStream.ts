'use client';

import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL, ENDPOINTS } from '@/lib/constants';

export interface BatchProgressEvent {
  batch_id: string;
  status: string;
  total_images: number;
  completed_count: number;
  failed_count: number;
  done: boolean;
}

interface UseBatchStreamResult {
  progress: BatchProgressEvent | null;
  error: boolean;
}

/**
 * Opens an SSE connection to /batch/{id}/stream and streams live progress.
 * Automatically closes when the batch reaches a terminal state (done=true)
 * or when the component unmounts.
 *
 * Cookies are sent automatically (same-origin), so no manual auth header needed.
 */
export function useBatchStream(
  batchId: string | null,
  enabled: boolean = true
): UseBatchStreamResult {
  const [progress, setProgress] = useState<BatchProgressEvent | null>(null);
  const [error, setError] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!batchId || !enabled) return;

    const url = `${API_BASE_URL}${ENDPOINTS.BATCH_STREAM(batchId)}`;
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.onmessage = (event: MessageEvent) => {
      try {
        const data: BatchProgressEvent = JSON.parse(event.data);
        setProgress(data);
        if (data.done) {
          es.close();
          esRef.current = null;
        }
      } catch {
        // malformed event — ignore
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setError(true);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [batchId, enabled]);

  return { progress, error };
}
