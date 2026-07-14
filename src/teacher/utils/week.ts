/** Week starts Monday (ISO-style for school timetables). */

export function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Monday 00:00 local for the week containing `date`. */
export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/** 0 = Monday … 6 = Sunday */
export function weekdayIndexMondayZero(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

export const WEEKDAY_ORDER_MON_FIRST = [0, 1, 2, 3, 4, 5, 6] as const;

export function weekdayLabels(locale?: string): string[] {
  const base = startOfWeekMonday(new Date(2026, 0, 5));
  return WEEKDAY_ORDER_MON_FIRST.map((i) => {
    const d = addDays(base, i);
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
  });
}
