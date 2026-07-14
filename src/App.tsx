import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/Layout";
import { TeacherAppLayout } from "@/components/Layout/TeacherAppLayout";
import { AdminAppLayout } from "@/components/Layout/AdminAppLayout";
import { AdminOnlyRoute } from "@/features/auth/AdminOnlyRoute";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { RoleHomeRedirect } from "@/features/auth/RoleHomeRedirect";
import { StudentOnlyRoute } from "@/features/auth/StudentOnlyRoute";
import { TeacherOnlyRoute } from "@/features/auth/TeacherOnlyRoute";
import { AdminOverviewPage } from "@/admin/pages/AdminOverviewPage";
import { AdminUsersPage } from "@/admin/pages/AdminUsersPage";
import { AdminClassesPage } from "@/admin/pages/AdminClassesPage";
import { AdminSubjectsPage } from "@/admin/pages/AdminSubjectsPage";
import { AdminSchedulePage } from "@/admin/pages/AdminSchedulePage";
import { AdminNotificationsPage } from "@/admin/pages/AdminNotificationsPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { SchedulePage } from "@/features/schedule/SchedulePage";
import { GradesPage } from "@/features/grades/GradesPage";
import { HomeworkPage } from "@/features/homework/HomeworkPage";
import { LibraryPage } from "@/features/library/LibraryPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { TeacherDashboardPage } from "@/teacher/pages/TeacherDashboardPage";
import { TeacherProfilePage } from "@/teacher/pages/TeacherProfilePage";
import { TeacherSchedulePage } from "@/teacher/pages/TeacherSchedulePage";
import { useAuthStore } from "@/stores/authStore";

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const hasAnyToken = useAuthStore((s) => Boolean(s.accessToken || s.refreshToken));

  useEffect(() => {
    if (hasAnyToken) {
      void bootstrap();
    }
  }, [bootstrap, hasAnyToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RoleHomeRedirect />} />
          <Route element={<StudentOnlyRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="grades" element={<GradesPage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="homework" element={<HomeworkPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route element={<TeacherOnlyRoute />}>
            <Route path="teacher" element={<TeacherAppLayout />}>
              <Route index element={<TeacherDashboardPage />} />
              <Route path="schedule" element={<TeacherSchedulePage />} />
              <Route path="profile" element={<TeacherProfilePage />} />
            </Route>
          </Route>
          <Route element={<AdminOnlyRoute />}>
            <Route path="admin" element={<AdminAppLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="classes" element={<AdminClassesPage />} />
              <Route path="subjects" element={<AdminSubjectsPage />} />
              <Route path="schedule" element={<AdminSchedulePage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<RoleHomeRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
