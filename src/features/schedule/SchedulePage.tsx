import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { diaryApi } from "@/services/api";
import type { ScheduleLesson, Weekday } from "@/types";
import {
  WEEKDAYS_ORDER,
  WEEKDAY_LABELS,
  isLessonCurrent,
  sortLessonsByTime,
} from "@/utils/schedule";
import { addDays, formatISODateLocal, startOfWeekMonday } from "@/teacher/utils/week";
import { getWeekRangeLabel } from "@/teacher/services/teacherService";

export function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [lessons, setLessons] = useState<ScheduleLesson[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<ScheduleLesson | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const locale = typeof navigator !== "undefined" ? navigator.language : undefined;

  const weekAnchor = useMemo(
    () => addDays(startOfWeekMonday(new Date()), weekOffset * 7),
    [weekOffset]
  );

  const rangeLabel = useMemo(
    () =>
      getWeekRangeLabel(
        formatISODateLocal(weekAnchor),
        formatISODateLocal(addDays(weekAnchor, 6)),
        locale
      ),
    [locale, weekAnchor]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await diaryApi.getSchedule(weekOffset);
      setLessons(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    void load();
  }, [load]);

  const byDay = useMemo(() => {
    const map = new Map<Weekday, ScheduleLesson[]>();
    for (const d of WEEKDAYS_ORDER) map.set(d, []);

    for (const l of lessons ?? []) {
      map.get(l.weekday)?.push(l);
    }

    for (const d of WEEKDAYS_ORDER) {
      map.get(d)?.sort(sortLessonsByTime);
    }

    return map;
  }, [lessons]);

  function openLesson(lesson: ScheduleLesson) {
    setSelectedLesson(lesson);
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
            Weekly timetable. Open a lesson to see homework.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
            Previous week
          </Button>
          <span className="min-w-[10rem] text-center text-sm font-medium text-ink dark:text-ink-dark">
            {rangeLabel}
          </span>
          <Button type="button" variant="secondary" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
            Next week
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setWeekOffset(0)}>
            This week
          </Button>
        </div>
      </div>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : !lessons?.length ? (
        <EmptyState title="No schedule" description="Your weekly timetable is empty." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {WEEKDAYS_ORDER.map((day, idx) => {
            const dayLessons = byDay.get(day) ?? [];
            const cellDate = addDays(weekAnchor, idx);
            const isToday = formatISODateLocal(cellDate) === formatISODateLocal(new Date());

            return (
              <Card key={day} className={`flex flex-col ${isToday ? "ring-2 ring-primary/35" : ""}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <CardTitle className="mb-0">{WEEKDAY_LABELS[day]}</CardTitle>
                    <p className="text-xs text-ink/45 dark:text-ink-dark/50">{cellDate.getDate()}</p>
                  </div>
                  <Badge tone="muted">{dayLessons.length} lessons</Badge>
                </div>

                <ul className="flex flex-1 flex-col gap-2">
                  {dayLessons.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-ink/12 py-6 text-center text-sm text-ink/45 dark:border-ink-dark/15 dark:text-ink-dark/50">
                      Free day
                    </li>
                  ) : (
                    dayLessons.map((l) => {
                      const current = isLessonCurrent(l);

                      return (
                        <li key={l.id}>
                          <button
                            type="button"
                            onClick={() => openLesson(l)}
                            className={`
                              w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200
                              ${
                                current
                                  ? "border-primary bg-primary/15 shadow-soft ring-2 ring-primary/30 dark:bg-primary/20"
                                  : "border-ink/8 bg-white/50 hover:border-primary/25 dark:border-ink-dark/12 dark:bg-ink/5"
                              }
                            `}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-ink dark:text-ink-dark">{l.subject}</p>
                                <p className="text-xs text-ink/55 dark:text-ink-dark/60">{l.teacher}</p>
                                {l.room ? (
                                  <p className="text-xs text-ink/45 dark:text-ink-dark/50">Room {l.room}</p>
                                ) : null}
                              </div>

                              <Badge tone={current ? "accent" : "secondary"}>
                                {l.startTime}–{l.endTime}
                              </Badge>
                            </div>

                            {l.homeTask ? (
                              <p className="mt-2 line-clamp-2 text-xs text-ink/60 dark:text-ink-dark/65">
                                Homework: {l.homeTask}
                              </p>
                            ) : null}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && selectedLesson ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="mb-1">{selectedLesson.subject}</CardTitle>
                  <p className="text-sm text-ink/60 dark:text-ink-dark/65">
                    {selectedLesson.teacher}
                    {selectedLesson.room ? ` · Room ${selectedLesson.room}` : ""}
                  </p>
                </div>
                <Badge tone="secondary">
                  {selectedLesson.startTime}–{selectedLesson.endTime}
                </Badge>
              </div>

              <div className="rounded-2xl border border-ink/8 bg-ink/5 p-4 dark:border-ink-dark/12 dark:bg-ink/10">
                <p className="text-xs uppercase tracking-wide text-ink/45 dark:text-ink-dark/50">Homework</p>
                <p className="mt-2 text-sm text-ink dark:text-ink-dark">
                  {selectedLesson.homeTask?.trim() ? selectedLesson.homeTask : "No homework assigned."}
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}