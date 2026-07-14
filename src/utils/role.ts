import type { User, UserRole } from "@/types";

/** Normalizes API roles (e.g. TEACHER, STUDENT) to app UserRole. */
export function normalizeApiRole(raw: string | undefined | null): UserRole {
  const r = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (r === "TEACHER") return "teacher";
  if (r === "STUDENT") return "student";
  if (r === "ADMIN") return "admin";
  if (r === "PARENT") return "parent";
  if (r === "GUEST") return "student";
  return "student";
}

export function isTeacher(user: User | null | undefined): boolean {
  return user?.role === "teacher";
}

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === "admin";
}

export function isStudent(user: User | null | undefined): boolean {
  return user?.role === "student";
}

/** Home path after login / when already authenticated. */
export function homePathForUser(user: User | null | undefined): string {
  if (isAdmin(user)) return "/admin";
  return isTeacher(user) ? "/teacher" : "/dashboard";
}
