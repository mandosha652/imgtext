'use client';

import { useState, useMemo } from 'react';
import { Clock, Layers, ArrowRight, Search, X, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useListBatches, useTranslationHistory } from '@/hooks';
import { getLangName } from '@/components/features/history/utils';
import { SingleCard } from '@/components/features/history/SingleCard';
import { BatchCard } from '@/components/features/history/BatchCard';

const ITEMS_PER_PAGE = 20;

function CardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: singleHistory,
    isLoading: isSingleLoading,
    isError: isSingleError,
    refetch: refetchSingle,
  } = useTranslationHistory({
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
  });

  const { data: batches, isLoading: isBatchesLoading } = useListBatches({
    enabled: true,
  });

  const finishedBatches = useMemo(
    () =>
      (batches ?? []).filter(
        b => b.status !== 'pending' && b.status !== 'processing'
      ),
    [batches]
  );

  const filteredSingles = useMemo(() => {
    const items = singleHistory?.items ?? [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      i =>
        getLangName(i.target_lang).toLowerCase().includes(q) ||
        (i.source_lang && getLangName(i.source_lang).toLowerCase().includes(q))
    );
  }, [singleHistory, searchQuery]);

  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return finishedBatches;
    const q = searchQuery.toLowerCase();
    return finishedBatches.filter(b =>
      b.target_languages.some(l => getLangName(l).toLowerCase().includes(q))
    );
  }, [finishedBatches, searchQuery]);

  const totalSinglePages = singleHistory
    ? Math.ceil(singleHistory.total / ITEMS_PER_PAGE)
    : 1;
  const isLoading = isSingleLoading || isBatchesLoading;

  const isEmpty =
    !isLoading &&
    !isSingleError &&
    (singleHistory?.items ?? []).length === 0 &&
    finishedBatches.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">History</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          All your past translations
        </p>
      </div>

      {/* Error */}
      {isSingleError && (
        <div className="border-destructive/30 bg-destructive/5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
          <XCircle className="text-destructive h-4 w-4 shrink-0" />
          <span>Failed to load translations.</span>
          <button
            onClick={() => refetchSingle()}
            className="text-muted-foreground hover:text-foreground ml-auto cursor-pointer text-xs underline-offset-2 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20 text-center">
          <Clock className="text-muted-foreground h-10 w-10" />
          <p className="mt-4 font-medium">No translations yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Your history will appear here after your first translation
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/translate">
              <Button size="sm">
                Single image <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/batch">
              <Button size="sm" variant="outline">
                Batch <Layers className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {!isEmpty && (
        <Tabs defaultValue="single" className="space-y-5">
          {/* Tabs + search row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="single">
                Single
                {singleHistory && (
                  <span className="text-muted-foreground ml-1.5 text-xs">
                    ({singleHistory.total})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="batch">
                Batch
                {finishedBatches.length > 0 && (
                  <span className="text-muted-foreground ml-1.5 text-xs">
                    ({finishedBatches.length})
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
              <Input
                placeholder="Search by language…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-9 pr-8 pl-8 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  title="Clear"
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── Single tab ── */}
          <TabsContent value="single" className="mt-0 space-y-3">
            {isSingleLoading ? (
              Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
            ) : filteredSingles.length === 0 ? (
              <div className="text-muted-foreground rounded-xl border-2 border-dashed py-16 text-center text-sm">
                {searchQuery
                  ? 'No results match your search'
                  : 'No single translations yet'}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {filteredSingles.map(item => (
                    <SingleCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalSinglePages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-muted-foreground text-sm">
                      {page} / {totalSinglePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalSinglePages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ── Batch tab ── */}
          <TabsContent value="batch" className="mt-0 space-y-3">
            {isBatchesLoading ? (
              Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            ) : filteredBatches.length === 0 ? (
              <div className="text-muted-foreground rounded-xl border-2 border-dashed py-16 text-center text-sm">
                {searchQuery
                  ? 'No results match your search'
                  : 'No batch translations yet'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBatches.map(batch => (
                  <BatchCard key={batch.batch_id} batch={batch} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
