import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Skeleton } from "@/components/Skeleton";
import { ErrorState } from "@/components/ErrorState";
import { diaryApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

export function TeacherProfilePage() {
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof diaryApi.getTeacherProfile>> | null>(
    null
  );

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await diaryApi.getTeacherProfile();
      setProfile(data);
      setUser(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load teacher profile");
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
          Teacher account details loaded from backend.
        </p>
      </div>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      <Card>
        <CardTitle className="mb-4">Teacher information</CardTitle>
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <dt className="text-ink/55 dark:text-ink-dark/60">Role</dt>
              <dd>
                <Badge tone="primary" className="capitalize">
                  {profile.role}
                </Badge>
              </dd>
            </div>
          </dl>
        ) : null}
      </Card>
    </div>
  );
}
