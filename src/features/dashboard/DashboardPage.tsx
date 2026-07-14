import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { IconBell } from "@/components/Layout/icons";
import { diaryApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { GradeEntry, NotificationItem, ScheduleLesson } from "@/types";
import { gradeTone } from "@/utils/grades";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [schedule, setSchedule] = useState<ScheduleLesson[] | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[] | null>(null);
  const [recentGrades, setRecentGrades] = useState<GradeEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await diaryApi.getDashboard();
      setSchedule(data.currentLessons);
      setNotifications(data.notifications);
      setRecentGrades(data.recentGrades.slice(0, 5));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const todayLessons = schedule ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">
          Hello{user?.displayName ? `, ${user.displayName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/65">
          Here is what is happening today.
        </p>
      </div>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">Today&apos;s schedule</CardTitle>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : todayLessons.length === 0 ? (
            <EmptyState
              title="No current lessons"
              description="There are no lessons in the current timetable view."
            />
          ) : (
            <ul className="space-y-2">
              {todayLessons.map((l) => (
                console.log(l),
                <li
                  key={l.id}
                  className="
                    flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/6
                    bg-primary/5 px-4 py-3 dark:border-ink-dark/10 dark:bg-primary/10
                  "
                >
                  <div>
                    <p className="font-medium text-ink dark:text-ink-dark">{l.subject}</p>
                    <p className="text-xs text-ink/55 dark:text-ink-dark/60">
                      {l.teacher}
                      {l.room ? ` · Room ${l.room}` : ""}
                    </p>
                  </div>
                  <Badge tone="secondary">
                    {l.startTime}–{l.endTime}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <IconBell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !notifications?.length ? (
            <EmptyState title="No notifications" description="You are all caught up." />
          ) : (
            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`
                    rounded-xl border px-3 py-2.5 text-sm transition-colors
                    ${
                      n.read
                        ? "border-ink/6 bg-transparent dark:border-ink-dark/10"
                        : "border-accent/50 bg-accent/25 dark:border-accent-dark/30 dark:bg-accent-dark/10"
                    }
                  `}
                >
                  <p className="font-medium text-ink dark:text-ink-dark">{n.title}</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-xs text-ink/60 dark:text-ink-dark/65">
                    {n.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardTitle className="mb-4">Recent grades</CardTitle>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !recentGrades?.length ? (
          <EmptyState title="No grades yet" description="Grades will appear here once recorded." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentGrades.map((g) => {
              const tone = gradeTone(g.value, g.maxValue);
              const color =
                tone === "high"
                  ? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                  : tone === "mid"
                    ? "border-primary/25 bg-primary/8 dark:border-primary/30 dark:bg-primary/15"
                    : "border-amber-200 bg-red-100 dark:border-amber-900/40 dark:bg-amber-950/25";
              return (
                <div
                  key={g.id}
                  className={`rounded-xl border px-4 py-3 ${color}`}
                >
                  <p className="text-sm font-medium text-ink dark:text-ink-dark">{g.subject}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-ink dark:text-ink-dark">
                    {g.value}
                    <span className="text-base font-normal text-ink/50 dark:text-ink-dark/50">
                      /{g.maxValue}
                    </span>
                  </p>
                  <p className="whitespace-pre-wrap mt-1 text-xs text-ink/55 dark:text-ink-dark/60">
                    {g.label}
                    <span className="font-bold">{g.date}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
