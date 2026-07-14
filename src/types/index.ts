export type UserRole = "student" | "teacher" | "admin" | "parent";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  className?: string;
  classId?: number;
  avatarUrl?: string;
}

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface ScheduleLesson {
  id: string;
  lessonId?: number;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room?: string;
  homeTask?: string;
}

export interface GradeEntry {
  id: string;
  subject: string;
  value: number;
  maxValue: number;
  label: string;
  date: string;
}

export interface SubjectGrades {
  subject: string;
  entries: GradeEntry[];
  average: number;
}

export type HomeworkStatus = "pending" | "done" | "overdue";

export interface HomeworkTask {
  id: number;
  lessonId?: number;
  title: string;
  subject: string;
  dueDate: string;
  status: HomeworkStatus;
  description?: string;
  attachedFile?: string;
  sourceUrl?: string;
  completed?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  sourceUrl: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DashboardData {
  name: string;
  currentLessons: ScheduleLesson[];
  recentGrades: GradeEntry[];
  notifications: NotificationItem[];
}

export interface HomeworkCompletionState {
    taskId: number;
    completed: boolean;
}