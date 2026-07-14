import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { homePathForUser, isTeacher } from "@/utils/role";

/** Allows only teachers. Students/parents cannot access teacher routes. */
export function TeacherOnlyRoute() {
  const user = useAuthStore((s) => s.user);
  if (!isTeacher(user)) {
    return <Navigate to={homePathForUser(user)} replace />;
  }
  return <Outlet />;
}
