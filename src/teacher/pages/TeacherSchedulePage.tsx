import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LessonModal } from "@/teacher/components/LessonModal";
import type { TeacherClassSession } from "@/teacher/services/teacherTypes";
import { getWeekRangeLabel, teacherService } from "@/teacher/services/teacherService";
import { addDays, formatISODateLocal, startOfWeekMonday, weekdayLabels } from "@/teacher/utils/week";

export function TeacherSchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeekMonday(new Date()));
  const [weekLabel, setWeekLabel] = useState("");
  const [sessions, setSessions] = useState<TeacherClassSession[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<TeacherClassSession | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const locale = typeof navigator !== "undefined" ? navigator.language : undefined;
  const dayShort = useMemo(() => weekdayLabels(locale), [locale]);
  const rangeLabel = weekLabel || getWeekRangeLabel(formatISODateLocal(weekAnchor), formatISODateLocal(addDays(weekAnchor, 6)), locale);

  const toDateKey = (value: string | Date) => {
    if (typeof value === "string") return value.slice(0, 10);

    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseDateOnly = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await teacherService.getScheduleByWeek(weekOffset);
      setSessions(data.lessons ?? []);
      setWeekLabel(getWeekRangeLabel(data.weekStart, data.weekEnd, locale));

      if (data.weekStart) {
        setWeekAnchor(parseDateOnly(data.weekStart));
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [locale, weekOffset]);

  useEffect(() => {
    void load();
  }, [load]);

  const lessonsByWeekday = useMemo(() => {
    const mon = startOfWeekMonday(weekAnchor);
    const columns: TeacherClassSession[][] = [[], [], [], [], [], [], []];

    for (let i = 0; i < 7; i++) {
      const cellDate = addDays(mon, i);
      const key = toDateKey(cellDate);

      const list = (sessions ?? [])
        .filter((l) => toDateKey(l.date) === key)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      columns[i] = list;
    }

    return columns;
  }, [sessions, weekAnchor]);

  function openLesson(l: TeacherClassSession) {
    setSelectedLesson(l);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedLesson(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Schedule</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/65">
            Week view — open a lesson to enter grades and comments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            Previous week
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-medium text-ink dark:text-ink-dark">
            {rangeLabel}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            Next week
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setWeekOffset(0)}>
            This week
          </Button>
        </div>
      </div>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : !sessions?.length ? (
        <Card>
          <EmptyState title="No lessons this week" description="Try another week or check back later." />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-7">
          {lessonsByWeekday.map((dayLessons, col) => {
            const mon = startOfWeekMonday(weekAnchor);
            const cellDate = addDays(mon, col);
            const iso = toDateKey(cellDate);
            const today = formatISODateLocal(new Date());
            const isToday = iso === today;
            return (
              <Card key={col} padding="sm" className={`flex flex-col min-h-[12rem] ${isToday ? "ring-2 ring-primary/35" : ""}`}>
                <div className="mb-2 border-b border-ink/8 pb-2 dark:border-ink-dark/12">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink/50 dark:text-ink-dark/55">
                    {dayShort[col]}
                  </p>
                  <p className="text-sm font-semibold text-ink dark:text-ink-dark">{cellDate.getDate()}</p>
                </div>
                <ul className="flex flex-1 flex-col gap-2">
                  {dayLessons.length === 0 ? (
                    <li className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-ink/12 py-6 text-center text-xs text-ink/45 dark:border-ink-dark/15 dark:text-ink-dark/50">
                      No classes
                    </li>
                  ) : (
                    dayLessons.map((l) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => openLesson(l)}
                          className="
                            w-full rounded-xl border border-ink/8 bg-white/80 px-3 py-2.5 text-left text-sm
                            transition-colors hover:border-primary/40 hover:bg-primary/5
                            dark:border-ink-dark/12 dark:bg-ink/5 dark:hover:bg-primary/10
                          "
                        >
                          <p className="font-medium text-ink dark:text-ink-dark">{l.className}</p>
                          {l.subject ? (
                            <p className="mt-0.5 text-xs text-ink/55 dark:text-ink-dark/60">{l.subject}</p>
                          ) : null}
                          <Badge tone="secondary" className="mt-2 tabular-nums text-[10px]">
                            {l.startTime}–{l.endTime}
                          </Badge>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardTitle className="mb-2">Tip</CardTitle>
        <p className="text-sm text-ink/60 dark:text-ink-dark/65">
          Click a lesson to submit grades and manage hometask for that specific class session.
        </p>
      </Card>

      <LessonModal
        open={modalOpen}
        lesson={selectedLesson}
        onClose={closeModal}
        onSaved={() => void load()}
      />
    </div>
  );
}
