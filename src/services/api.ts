import type {
  AuthTokens,
  DashboardData,
  GradeEntry,
  HomeworkTask,
  LibraryItem,
  LoginCredentials,
  ScheduleLesson,
  SubjectGrades,
  User,
} from "@/types";
import axios, { type AxiosInstance } from "axios";
import { authTokens, emitAuthExpired } from "@/services/authTokens";
import { normalizeApiRole } from "@/utils/role";

type ApiStudent = { id?: number; name?: string };
type ApiTimetableRecord = {
  lessonId?: number;
  title?: string;
  teacherName?: string;
  students?: ApiStudent[];
  homeTask?: string;
  className?: string;
  subjectName?: string;
  startTime?: string;
  endTime?: string;
};
type ApiTeacherGrade = {
  id?: number;
  value?: number | null;
  description?: string;
  date?: string;
};

type ApiGrade = { id?: number; lessonName?: string; value?: number; description?: string; date?: string };
type ApiNotification = { title?: string; text?: string };
type ApiHomeTask = {
  taskId?: number;
  text?: string;
  sourceUrl?: string;
  attachedFile?: string;
  subjectName?: string;
  dueTo?: string;
};
type ApiLibraryItem = { id?: string; title?: string; description?: string; imageUrl?: string; sourceUrl?: string };
type ApiAuthResponse = AuthTokens & { role?: string };
type ApiUserRole = "ADMIN" | "TEACHER" | "STUDENT" | "GUEST";
type ApiSubject = { id?: number; name?: string; description?: string };
type ApiAdminNotification = { id?: number; title?: string; text?: string; postedAt?: string };
type ApiSchoolClass = {
  id?: number;
  className?: string;
  students?: Array<{ id?: number; name?: string }>;
};
type ApiScheduleRule = {
  id?: number;
  classId?: number;
  subjectId?: number;
  teacherId?: number;
  dayOfWeek?: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startTime?: string;
  endTime?: string;
};

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://192.168.100.90/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

function mapErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data && typeof data === "object") {
      const maybeMessage = Reflect.get(data, "message");
      if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;
      const maybeError = Reflect.get(data, "error");
      if (typeof maybeError === "string" && maybeError.trim()) return maybeError;
    }
    if (error.message) return error.message;
  }
  return fallback;
}

function setAuthHeader(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}

function normalizeWeekday(input: string): ScheduleLesson["weekday"] | null {
  const v = input.trim().toLowerCase();
  if (v.startsWith("mon")) return "monday";
  if (v.startsWith("tue")) return "tuesday";
  if (v.startsWith("wed")) return "wednesday";
  if (v.startsWith("thu")) return "thursday";
  if (v.startsWith("fri")) return "friday";
  if (v.startsWith("sat")) return "saturday";
  return null;
}

function normalizeTime(t?: string) {
    return t ? t.slice(0, 5) : "00:00";
}

type RetryableRequestConfig = { _retry?: boolean; headers: Record<string, string> };
let refreshInFlight: Promise<AuthTokens> | null = null;

async function refreshWithLock(): Promise<AuthTokens> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = authTokens.getRefreshToken();
      if (!refreshToken) throw new Error("Missing refresh token");
      const { data } = await axios.post<AuthTokens>(`${BASE_URL}/auth/refresh`, refreshToken, {
        headers: { "Content-Type": "application/json" },
      });
      if (!data.accessToken) throw new Error("Refresh failed: no access token");
      const next = { accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken };
      authTokens.setFromAuthResponse(next);
      setAuthHeader(next.accessToken);
      return next;
    })();
  }
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = authTokens.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || !error.config) throw error;
    const status = error.response?.status;
    const config = error.config as typeof error.config & RetryableRequestConfig;
    const url = config.url ?? "";
    const isAuthRoute = url.includes("/auth/login") || url.includes("/auth/refresh");
    const shouldTryRefresh = (status === 401 || status === 403) && !isAuthRoute && !config._retry;
    if (!shouldTryRefresh) throw error;
    config._retry = true;
    try {
      const tokens = await refreshWithLock();
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return await apiClient.request(config);
    } catch (refreshError) {
      authTokens.clearTokens();
      setAuthHeader(null);
      emitAuthExpired();
      throw refreshError;
    }
  }
);

export const diaryApi = {
  setAccessToken(token: string | null): void {
    setAuthHeader(token);
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const { data } = await apiClient.post<ApiAuthResponse>("/auth/login", {
        username: credentials.email.trim(),
        password: credentials.password,
      });
      if (!data.accessToken || !data.refreshToken) throw new Error("Invalid auth response");
      const tokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
      const role = normalizeApiRole(data.role);
      authTokens.setFromAuthResponse(tokens);
      setAuthHeader(tokens.accessToken);
      const user: User = {
        id: credentials.email.trim() || "user",
        email: credentials.email.trim(),
        displayName: credentials.email.trim(),
        role,
      };
      return { user, tokens };
    } catch (error) {
      throw new Error(mapErrorMessage(error, "Login failed"));
    }
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post<AuthTokens>("/auth/refresh", refreshToken);
    const next = { accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken };
    authTokens.setFromAuthResponse(next);
    setAuthHeader(next.accessToken);
    return next;
  },

  async logout(refreshToken: string | null): Promise<void> {
    try {
      if (refreshToken) await apiClient.post("/auth/logout", refreshToken);
    } finally {
      authTokens.clearTokens();
      setAuthHeader(null);
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const { data } = await apiClient.get<{
        name?: string;
        username?: string;
        role?: string;
        className?: string;
        classId?: number;
      }>("/student/profile");
      return {
        id: String(data.username ?? "student"),
        email: data.username ?? "",
        displayName: data.name ?? "Student",
        role: normalizeApiRole(data.role),
        className: data.className,
        classId: data.classId,
      };
    } catch {
      const { data } = await apiClient.get<{ name?: string; username?: string; role?: string }>(
        "/teacher/profile"
      );
      return {
        id: String(data.username ?? "teacher"),
        email: data.username ?? "",
        displayName: data.name ?? "Teacher",
        role: normalizeApiRole(data.role),
      };
    }
  },
  
  async getTeacherProfile(): Promise<User> {
    const { data } = await apiClient.get<{ name?: string; username?: string; role?: string }>(
      "/teacher/profile"
    );
    return {
      id: String(data.username ?? "teacher"),
      email: data.username ?? "",
      displayName: data.name ?? "Teacher",
      role: normalizeApiRole(data.role),
    };
  },

  async getStudentProfile(): Promise<User> {
    const { data } = await apiClient.get<{
      name?: string;
      username?: string;
      role?: string;
      className?: string;
      classId?: number;
    }>("/student/profile");
    return {
      id: String(data.username ?? "student"),
      email: data.username ?? "",
      displayName: data.name ?? "Student",
      role: normalizeApiRole(data.role),
      className: data.className,
      classId: data.classId,
    };
  },

  async getDashboard(): Promise<DashboardData> {
    const { data } = await apiClient.get<{
      name?: string;
      currentTimetable?: ApiTimetableRecord[];
      recentGrades?: ApiGrade[];
      notifications?: ApiNotification[];
    }>("/student/home");

    const currentLessons: ScheduleLesson[] = (data.currentTimetable ?? []).map((r, idx) => ({
      id: `home-${idx}-${r.lessonId ?? "lesson"}`,
      lessonId: r.lessonId,
      weekday: "monday",
      startTime: normalizeTime(r.startTime),
      endTime: normalizeTime(r.endTime),
      subject: r.subjectName ?? r.title ?? "Lesson",
      teacher: "Teacher",
      room: r.className,
    }));

    const recentGrades: GradeEntry[] = (data.recentGrades ?? []).map((g, idx) => ({
      id: `g-${idx}-${g.date ?? "date"}`,
      subject: g.lessonName ?? "Subject",
      value: g.value ?? 0,
      maxValue: 100,
      label: g.description ?? "Grade",
      date: g.date ?? "",
    }));

    return {
      name: data.name ?? "Student",
      currentLessons,
      recentGrades,
      notifications: (data.notifications ?? []).map((n, idx) => ({
        id: `n-${idx}`,
        title: n.title ?? "Notification",
        message: n.text ?? "",
        createdAt: "",
        read: false,
      })),
    };
  },

  
  async getSchedule(week = 0): Promise<ScheduleLesson[]> {
    const { data } = await apiClient.get<{ timetable?: Record<string, ApiTimetableRecord[]> }>(
      "/student/schedule",
      { params: { week } }
    );

    const lessons: ScheduleLesson[] = [];

    for (const [rawWeekday, records] of Object.entries(data.timetable ?? {})) {
      const weekday = normalizeWeekday(rawWeekday);
      if (!weekday) continue;

      for (const [idx, r] of (records ?? []).entries()) {
        lessons.push({
          id: `${weekday}-${idx}-${r.lessonId ?? "lesson"}`,
          lessonId: r.lessonId,
          weekday,
          startTime: normalizeTime(r.startTime),
          endTime: normalizeTime(r.endTime),
          subject: r.subjectName ?? r.title ?? "Lesson",
          teacher: r.teacherName ?? "Teacher",
          room: r.className,
          homeTask: r.homeTask ?? "",
        });
      }
    }

    return lessons;
  },

  async getGrades(): Promise<SubjectGrades[]> {
    const { data } = await apiClient.get<{ grades?: Record<string, ApiGrade[]> }>("/student/grades");
    return Object.entries(data.grades ?? {}).map(([subject, entries]) => {
      const mapped = (entries ?? []).map((e, idx) => ({
        id: `${subject}-${idx}-${e.date ?? "date"}`,
        subject,
        value: e.value ?? 0,
        maxValue: 100,
        label: e.description ?? "Grade",
        date: e.date ?? "",
      }));
      const average =
        mapped.length > 0
          ? Math.round((mapped.reduce((sum, x) => sum + x.value, 0) / mapped.length) * 10) / 10
          : 0;
      return { subject, entries: mapped, average };
    });
  },

  async getTaskByLesson(lessonId: number): Promise<ApiHomeTask | null> {
    try {
      const { data } = await apiClient.get<ApiHomeTask>("/task", { params: { lessonId } });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  },

  async getTasksByClass(classId: number): Promise<ApiHomeTask[]> {
    const { data } = await apiClient.get<ApiHomeTask[]>("/task/all", { params: { classId } });
    return data ?? [];
  },

  async createHomeTask(payload: { lessonId: number; text: string; sourceUrl?: string }): Promise<ApiHomeTask> {
    const { data } = await apiClient.post<ApiHomeTask>("/task", payload);
    return data;
  },

  async updateHomeTask(payload: { lessonId: number; text: string; sourceUrl?: string }): Promise<ApiHomeTask> {
    const { data } = await apiClient.put<ApiHomeTask>("/task", payload);
    return data;
  },

  async deleteHomeTask(lessonId: number): Promise<void> {
    await apiClient.delete("/task", { params: { lessonId } });
  },

  async getHomeworkCompletion(studentId: number, taskId: number): Promise<boolean> {
    try {
      const { data } = await apiClient.get<boolean>("/completion", {
        params: { studentId, taskId },
      });
      return Boolean(data);
    } catch {
      return false;
    }
  },

  async getHomeworkCompletionByUsername(username: string, taskId: number): Promise<boolean> {
    try {
      const { data } = await apiClient.get<boolean>("/completion/username", {
        params: { username, taskId },
      });
      return Boolean(data);
    } catch {
      return false;
    }
  },

  async completeHomework(studentId: number, taskId: number): Promise<void> {
    try {
      await apiClient.post(
        "/completion",
        null,
        { params: { studentId, taskId } }
     );
    } catch {
      
    }
  },

  async deleteHomeworkCompletion(studentId: number, taskId: number): Promise<void> {
    try {
      await apiClient.delete("/completion", {
        params: { studentId, taskId },
      });
    } catch {
      
    }
  },
  
  async getHomework(): Promise<HomeworkTask[]> {
    const user = await this.getCurrentUser();
    
    if (!user.classId) {
      return [];
    }

    const tasks = await this.getTasksByClass(user.classId);
    console.log("Fetched tasks", tasks);
    const completionStatuses = await Promise.all(
      tasks.map((task, index) =>
        diaryApi
          .getHomeworkCompletionByUsername(user.id, task.taskId? task.taskId : index)
          .catch(() => false)
      )
    );

    // return tasks.map((task, index) => ({
    //   // id: `hw-${index}`,
    //   id: task.id ? task.id : index,
    //   lessonId: index,
    //   title: task.text ?? "Untitled task",
    //   description: task.text ?? "",
    //   subject: task.subjectName ?? "Subject",
    //   dueDate: task.dueTo ?? "",
    //   sourceUrl: task.sourceUrl,
    //   status: "pending" as const,
    //   completed: completionStatuses[index],
    // }));
    return tasks.map((task, index) => ({
      id: task.taskId ?? index,
      title: task.text ?? "Untitled task",
      description: task.text ?? "",
      subject: task.subjectName ?? "Subject",
      dueDate: task.dueTo ?? "",
      sourceUrl: task.sourceUrl,
      attachedFile: task.attachedFile,
      completed: completionStatuses[index],
      status: "pending" as const,
    }));
  },

  async getLibraryItems(): Promise<LibraryItem[]> {
    const { data } = await apiClient.get<ApiLibraryItem[]>('/student/library');
    return (data ?? []).map((item, index) => ({
      id: item.id ?? `library-${index}`,
      title: item.title ?? 'Untitled item',
      description: item.description ?? '',
      imageUrl: item.imageUrl,
      sourceUrl: item.sourceUrl ?? '',
    }));
  },

  async setTeacherGrade(payload: { studentId: number; lessonId: number; grade: number; comment: string }): Promise<void> {
    try {
      await apiClient.post("/teacher/grade", payload);
    } catch {
      await apiClient.put("/teacher/grade", payload);
    }
  },

  async getTeacherGrade(
    lessonId: number,
    studentId: number
  ): Promise<{ grade: number | null; comment: string }> {
    try {
      const { data } = await apiClient.get<ApiTeacherGrade>("/teacher/grade", {
        params: { lessonId, studentId },
      });

      return {
        grade: typeof data.value === "number" && data.value > 0 ? data.value : null,
        comment: data.description ?? "",
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return { grade: null, comment: "" };
      }
      throw error;
    }
  },

  async getTeacherSchedule(week: number): Promise<{
    weekStart?: string;
    weekEnd?: string;
    lessons?: Array<{
    id: number;
    date: string;
    className?: string | null;
    subject?: string;
    startTime?: string;
    endTime?: string;

    students?: {
      id?: number;
      name?: string;
    }[];

    homeTask?: string;
    homeTaskSource?: string;
    homeTaskId?: number | null;
    attachedFile?: string | null;
  }>;
  }> {
    const { data } = await apiClient.get("/teacher/schedule", { params: { week } });
    return data;
  },

  // ===== Admin panel API =====
  async adminCreateUser(payload: { role: ApiUserRole; name: string }): Promise<{ username: string; password: string }> {
    const { data } = await apiClient.post<{ username?: string; password?: string }>("/admin/user", payload);
    return {
      username: data.username ?? "",
      password: data.password ?? "",
    };
  },

  async adminGetClassById(id: number): Promise<ApiSchoolClass> {
    const { data } = await apiClient.get<ApiSchoolClass>("/class", { params: { id } });
    return data;
  },

  async adminCreateClass(className: string): Promise<ApiSchoolClass> {
    const { data } = await apiClient.post<ApiSchoolClass>("/class", className, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  async adminUpdateClass(classId: number, className: string): Promise<ApiSchoolClass> {
    console.log("Updating class", { classId, className });
    const { data } = await apiClient.put<ApiSchoolClass>("/class", className, {
      headers: { "Content-Type": "application/json" },
      params: { classId },
    });
    return data;
  },

  async adminAddStudentToClass(classId: number, studentId: number): Promise<ApiSchoolClass> {
    const { data } = await apiClient.put<ApiSchoolClass>("/class/student", undefined, {
      params: { classId, studentId },
    });
    return data;
  },

  async adminRemoveStudentFromClass(classId: number, studentId: number): Promise<ApiSchoolClass> {
    const { data } = await apiClient.delete<ApiSchoolClass>("/class/student", {
      params: { classId, studentId },
    });
    return data;
  },

  async adminGetSubjects(): Promise<ApiSubject[]> {
    const { data } = await apiClient.get<ApiSubject[]>("/subject/all");
    return data ?? [];
  },

  async adminCreateSubject(payload: { name: string; description: string }): Promise<ApiSubject> {
    const { data } = await apiClient.post<ApiSubject>("/subject", payload);
    return data;
  },

  async adminDeleteSubject(id: number): Promise<void> {
    await apiClient.delete("/subject", { params: { id } });
  },

  async adminGetNotifications(): Promise<ApiAdminNotification[]> {
    const { data } = await apiClient.get<ApiAdminNotification[]>("/notification");
    return data ?? [];
  },

  async adminCreateNotification(payload: { title: string; text: string; dueTo: string }): Promise<ApiAdminNotification> {
    const { data } = await apiClient.post<ApiAdminNotification>("/notification", payload);
    return data;
  },

  async adminDeleteNotification(id: number): Promise<void> {
    await apiClient.delete("/notification", { params: { id } });
  },

  async adminGetScheduleRules(): Promise<ApiScheduleRule[]> {
    const { data } = await apiClient.get<ApiScheduleRule[]>("/schedule");
    return data ?? [];
  },

  async adminCreateScheduleRule(payload: Omit<ApiScheduleRule, "id">): Promise<ApiScheduleRule> {
    const { data } = await apiClient.post<ApiScheduleRule>("/schedule", payload);
    return data;
  },

  async adminUpdateScheduleRule(id: number, payload: Omit<ApiScheduleRule, "id">): Promise<ApiScheduleRule> {
    const { data } = await apiClient.put<ApiScheduleRule>(`/schedule/${id}`, payload);
    return data;
  },

  async adminDeleteScheduleRule(id: number): Promise<void> {
    await apiClient.delete("/schedule", { params: { id } });
  },

  async adminGetAllUsers(): Promise<User[]> {
    const { data } = await apiClient.get("/admin/user");

    return (data ?? []).map((u: any) => ({
      id: String(u.id), // 👈 важно
      email: "", // 👈 backend не даёт → оставляем пустым
      displayName: u.name ?? "User", // 👈 правильное поле
      role: normalizeApiRole(u.role),
    }));
  },

  async adminGetAllClasses(): Promise<ApiSchoolClass[]> {
    const { data } = await apiClient.get("/class/all");
    return data ?? [];
  },

  async adminDeleteClass(classId: number): Promise<void> {
    await apiClient.delete("/class", {
      params: { classId },
    });
  },
};
