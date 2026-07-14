import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { homePathForUser, isAdmin } from "@/utils/role";

/** Allows only admins. */
export function AdminOnlyRoute() {
  const user = useAuthStore((s) => s.user);
  if (!isAdmin(user)) {
    return <Navigate to={homePathForUser(user)} replace />;
  }
  return <Outlet />;
}
