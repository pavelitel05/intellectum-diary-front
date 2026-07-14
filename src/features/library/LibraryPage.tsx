import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { diaryApi } from "@/services/api";

type LibraryItem = Awaited<ReturnType<typeof diaryApi.getLibraryItems>>[number];

function LibraryCard({ item }: { item: LibraryItem }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(item.imageUrl && !imageFailed);

  return (
    <Card
      padding="none"
      className="group aspect-square overflow-hidden border border-ink/8 bg-white/90 transition-transform duration-200 hover:-translate-y-1 hover:shadow-soft-lg dark:border-ink-dark/10 dark:bg-ink/10"
    >
      <div className="flex h-full flex-col p-4 sm:p-5">
        <div className="mb-4 overflow-hidden rounded-2xl border border-ink/8 bg-ink/[0.03] dark:border-ink-dark/10 dark:bg-ink-dark/5">
          {hasImage ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-36 w-full object-cover sm:h-40"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center px-4 text-center text-sm text-ink/45 dark:text-ink-dark/45 sm:h-40">
              No preview image
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <CardTitle className="max-h-12 overflow-hidden text-base sm:text-lg">{item.title}</CardTitle>
          <p className="mt-2 max-h-24 flex-1 overflow-hidden whitespace-pre-wrap text-sm leading-6 text-ink/65 dark:text-ink-dark/65">
            {item.description || "No description provided."}
          </p>

          <div className="mt-4">
            {item.sourceUrl ? (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark dark:bg-primary dark:hover:brightness-110"
              >
                Open material
              </a>
            ) : (
              <div className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-ink/10 px-4 py-2.5 text-sm font-medium text-ink/40 dark:bg-ink-dark/10 dark:text-ink-dark/35">
                No source link
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await diaryApi.getLibraryItems();
      setItems(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Library</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/65">
          Study materials, textbooks, and useful links in one place.
        </p>
      </div>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} padding="none" className="aspect-square overflow-hidden">
              <div className="flex h-full flex-col p-4 sm:p-5">
                <Skeleton className="mb-4 h-5 w-24" />
                <Skeleton className="mb-4 h-36 w-full rounded-2xl sm:h-40" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-auto h-10 w-full rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : !items?.length ? (
        <EmptyState
          title="Library is empty"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => (
            <LibraryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}