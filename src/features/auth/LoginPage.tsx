import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAuthStore, selectIsAuthenticated } from "@/stores/authStore";
import { homePathForUser } from "@/utils/role";

const REMEMBER_EMAIL_KEY = "intellectum-remember-email";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const isAuthed = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => () => clearError(), [clearError]);

  if (isAuthed) {
    return <Navigate to={homePathForUser(user)} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password, rememberMe });
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      const nextUser = useAuthStore.getState().user;
      navigate(homePathForUser(nextUser), { replace: true });
    } catch {
      /* error in store */
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 dark:bg-surface-dark">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-soft-lg">
            I
          </div>
          <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Welcome back</h1>
          <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/65">
            Sign in to your school diary
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
              >
                {error}
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
                Email or username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink
                  outline-none transition-shadow placeholder:text-ink/40
                  focus:border-primary focus:ring-2 focus:ring-primary/25
                  dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark dark:placeholder:text-ink-dark/40
                "
                placeholder="you@school.edu"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink dark:text-ink-dark">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full rounded-xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink
                  outline-none transition-shadow placeholder:text-ink/40
                  focus:border-primary focus:ring-2 focus:ring-primary/25
                  dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark dark:placeholder:text-ink-dark/40
                "
                placeholder="••••••••"
                required
                minLength={4}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/75 dark:text-ink-dark/80">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-ink/25 text-primary focus:ring-primary/30 dark:border-ink-dark/30"
              />
              Remember me
            </label>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
