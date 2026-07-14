import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { homePathForUser, isAdmin, isTeacher } from "@/utils/role";

/** Allows only non-teacher users (student/parent). Teachers are sent to their home. */
export function StudentOnlyRoute() {
  const user = useAuthStore((s) => s.user);
  if (isTeacher(user) || isAdmin(user)) {
    return <Navigate to={homePathForUser(user)} replace />;
  }
  return <Outlet />;
}
