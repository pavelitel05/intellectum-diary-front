import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { useAuthStore } from "@/stores/authStore";
import { diaryApi } from "@/services/api";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import type { UserRole } from "@/types";

const roleLabels: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
  parent: "Parent",
};

export function ProfilePage() {
  const storedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof diaryApi.getStudentProfile>> | null>(
    storedUser
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await diaryApi.getStudentProfile();
      const merged = {
        ...storedUser,
        ...data,
        role: storedUser?.role ?? data.role,
      };
      setProfile(merged);
      setUser(merged);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load profile");
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
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/65">
          Your account and preferences (settings coming soon).
        </p>
      </div>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">User information</CardTitle>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : profile ? (
            <dl className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/8 pb-3 dark:border-ink-dark/12">
                <dt className="text-ink/55 dark:text-ink-dark/60">Display name</dt>
                <dd className="font-medium text-ink dark:text-ink-dark">{profile.displayName}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/8 pb-3 dark:border-ink-dark/12">
                <dt className="text-ink/55 dark:text-ink-dark/60">Login</dt>
                <dd className="font-medium text-ink dark:text-ink-dark break-all">{profile.email}</dd>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/8 pb-3 dark:border-ink-dark/12">
                <dt className="text-ink/55 dark:text-ink-dark/60">Role</dt>
                <dd>
                  <Badge tone="primary" className="capitalize">
                    {roleLabels[profile.role]}
                  </Badge>
                </dd>
              </div>
              {profile.className ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <dt className="text-ink/55 dark:text-ink-dark/60">Class</dt>
                  <dd className="font-medium text-ink dark:text-ink-dark">{profile.className}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="text-sm text-ink/55 dark:text-ink-dark/60">No user loaded.</p>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Settings</CardTitle>
          <p className="text-sm text-ink/60 dark:text-ink-dark/65">
            Notification preferences, language, and accessibility options will be available here.
          </p>
          <Button variant="secondary" className="mt-6 w-full" disabled>
            Open settings
          </Button>
        </Card>
      </div>
    </div>
  );
}
