import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { diaryApi } from "@/services/api";
import { isDueSoon, isOverdue } from "@/utils/homework";

export function HomeworkPage() {
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof diaryApi.getHomework>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await diaryApi.getHomework();
      setTasks(data);
      
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load homework");
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
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Homework</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/65">
          Track tasks and deadlines. Due soon is highlighted in accent.
        </p>
      </div>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      <Card>
        <CardTitle className="mb-4">Assignments</CardTitle>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !tasks?.length ? (
          <EmptyState title="No homework" description="Nothing assigned right now." />
        ) : (
          <ul className="space-y-3">
            {tasks.map((t) => {
              const overdue = isOverdue(t.dueDate);
              const soon = !overdue && isDueSoon(t.dueDate);
              return (
                <li
                  key={t.id}
                  className={`
                    flex flex-col gap-3 rounded-xl border px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between
                    ${
                      !t.completed
                        ? "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/25"
                        : soon
                          ? "border-accent/60 bg-accent/30 dark:border-accent-dark/40 dark:bg-accent-dark/15"
                          : "border-ink/8 dark:border-ink-dark/12"
                    }
                  `}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink dark:text-ink-dark">{t.title}</p>
                      {overdue ? (
                        <Badge tone="warning">Overdue</Badge>
                      ) : soon ? (
                        <Badge tone="accent">Due soon</Badge>
                      ) : (
                        <Badge tone="muted">Pending</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink/55 dark:text-ink-dark/60">{t.subject}</p>
                    <p className="mt-0.5 text-xs text-ink/45 dark:text-ink-dark/50">
                      Due {t.dueDate || "—"}
                    </p>
                    {t.sourceUrl ? (
                      <a
                        href={t.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                      >
                        Open materials
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
