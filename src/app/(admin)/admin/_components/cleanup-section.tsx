'use client';

import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminLastCleanupRun, useAdminRunCleanup } from '@/hooks';

export function CleanupSection() {
  const { data: lastRun, isLoading } = useAdminLastCleanupRun();
  const runCleanup = useAdminRunCleanup();

  const handleRun = async () => {
    try {
      const result = await runCleanup.mutateAsync();
      toast.success('Cleanup complete', {
        description: `${result.batches_expired} batches · ${result.singles_expired} singles expired`,
      });
    } catch {
      toast.error('Cleanup failed');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Cleanup Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground animate-pulse text-sm">
            Loading...
          </p>
        ) : lastRun ? (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last run</span>
              <span>{format(new Date(lastRun.ran_at), 'MMM d, HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Batches expired</span>
              <span className="font-semibold">{lastRun.batches_expired}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Singles expired</span>
              <span className="font-semibold">{lastRun.singles_expired}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Triggered by</span>
              <Badge variant="outline" className="text-xs">
                {lastRun.triggered_by}
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No run recorded since last restart
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleRun}
          disabled={runCleanup.isPending}
        >
          <RefreshCw
            className={`mr-2 h-3.5 w-3.5 ${runCleanup.isPending ? 'animate-spin' : ''}`}
          />
          {runCleanup.isPending ? 'Running...' : 'Run cleanup now'}
        </Button>
      </CardContent>
    </Card>
  );
}
