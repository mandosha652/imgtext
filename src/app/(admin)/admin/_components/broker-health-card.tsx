'use client';

import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminHealth } from '@/hooks';

export function BrokerHealthCard() {
  const { data: health, isLoading, refetch, isFetching } = useAdminHealth();

  const broker = health?.broker;
  const isUp = broker?.reachable ?? false;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Message Broker</CardTitle>
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
            Checking broker...
          </p>
        ) : broker ? (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {isUp ? (
                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <WifiOff className="text-destructive h-3.5 w-3.5" />
              )}
              <span>RabbitMQ</span>
            </div>
            <div className="flex items-center gap-2">
              {!isUp && broker.error && (
                <span
                  className="text-destructive max-w-[160px] truncate text-xs"
                  title={broker.error}
                >
                  {broker.error}
                </span>
              )}
              <Badge
                variant="outline"
                className={
                  isUp
                    ? 'border-emerald-300 text-xs text-emerald-600'
                    : 'border-red-300 text-xs text-red-600'
                }
              >
                {broker.status}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No data — click refresh
          </p>
        )}
      </CardContent>
    </Card>
  );
}
