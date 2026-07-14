import type { ScheduleLesson, Weekday } from "@/types";

const WEEKDAYS_ORDER: Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function getTodayWeekday(date: Date = new Date()): Weekday | null {
  const d = date.getDay();
  if (d === 0 || d === 6) return d === 6 ? "saturday" : null;
  return WEEKDAYS_ORDER[d - 1] ?? null;
}

export function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function isLessonCurrent(
  lesson: ScheduleLesson,
  now: Date = new Date()
): boolean {
  const today = getTodayWeekday(now);
  if (!today || lesson.weekday !== today) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = parseTimeToMinutes(lesson.startTime);
  const end = parseTimeToMinutes(lesson.endTime);
  return cur >= start && cur < end;
}

export function sortLessonsByTime(a: ScheduleLesson, b: ScheduleLesson): number {
  return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
}

export { WEEKDAYS_ORDER };

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};
