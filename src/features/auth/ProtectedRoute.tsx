import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { selectIsAuthenticated, useAuthStore } from "@/stores/authStore";

export function ProtectedRoute() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const hasAnyToken = useAuthStore((s) => Boolean(s.accessToken || s.refreshToken));
  const ok = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    if (!ok && hasAnyToken) {
      void bootstrap();
    }
  }, [bootstrap, hasAnyToken, ok]);

  if (isBootstrapping) {
    return <div className="p-6 text-sm text-ink/65 dark:text-ink-dark/70">Authorizing...</div>;
  }

  if (!ok) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
