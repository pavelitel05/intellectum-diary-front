import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { homePathForUser } from "@/utils/role";

export function RoleHomeRedirect() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={homePathForUser(user)} replace />;
}
