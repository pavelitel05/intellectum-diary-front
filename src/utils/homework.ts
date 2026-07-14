export function isDueSoon(isoDate: string, withinDays = 2): boolean {
  const due = new Date(isoDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= withinDays;
}

export function isOverdue(isoDate: string): boolean {
  const due = new Date(isoDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due.getTime() < now.getTime();
}
