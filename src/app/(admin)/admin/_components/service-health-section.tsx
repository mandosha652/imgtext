'use client';

import { format } from 'date-fns';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminHealthServices } from '@/hooks';
import type { ServiceHealthResult } from '@/types';

const SERVICE_LABELS: Record<string, string> = {
  google_vision: 'Google Vision',
  openai: 'OpenAI',
  replicate: 'Replicate',
  r2_storage: 'R2 Storage',
};

export function ServiceHealthSection() {
  const {
    data: health,
    isLoading,
    refetch,
    isFetching,
  } = useAdminHealthServices();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Service Health</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-7 px-2"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <p className="text-muted-foreground animate-pulse text-sm">
            Pinging services...
          </p>
        ) : health ? (
          health.services.map((svc: ServiceHealthResult) => (
            <div
              key={svc.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                {svc.reachable ? (
                  <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <WifiOff className="text-destructive h-3.5 w-3.5" />
                )}
                <span>{SERVICE_LABELS[svc.name] ?? svc.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {svc.reachable ? (
                  <span className="text-muted-foreground text-xs">
                    {svc.latency_ms}ms
                  </span>
                ) : (
                  <span
                    className="text-destructive max-w-[160px] truncate text-xs"
                    title={svc.error}
                  >
                    {svc.error}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={
                    svc.reachable
                      ? 'border-emerald-300 text-xs text-emerald-600'
                      : 'border-red-300 text-xs text-red-600'
                  }
                >
                  {svc.reachable ? 'up' : 'down'}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            No data — click refresh
          </p>
        )}
        {health && (
          <p className="text-muted-foreground pt-1 text-xs">
            Checked {format(new Date(health.checked_at), 'HH:mm:ss')} UTC
          </p>
        )}
      </CardContent>
    </Card>
  );
}
