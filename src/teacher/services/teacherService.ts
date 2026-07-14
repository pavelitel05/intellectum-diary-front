import { diaryApi } from "@/services/api";
import type { TeacherClassSession, TeacherStudentRecord, TeacherWeekSchedule } from "@/teacher/services/teacherTypes";

export const teacherService = {
  async getScheduleByWeek(week: number): Promise<TeacherWeekSchedule> {
    const data = await diaryApi.getTeacherSchedule(week);

    const lessons: TeacherClassSession[] = (data.lessons ?? []).map((l) => ({
      id: `t-${l.id}`,
      lessonId: l.id,
      className: l.className ?? "Class",
      subject: l.subject ?? "Lesson",
      date: l.date,
      startTime: l.startTime ?? "00:00",
      endTime: l.endTime ?? "00:00",

      students: (l.students ?? []).map((s) => ({
        id: s.id ?? 0,
        name: s.name ?? "Student",
        grade: null,
        comment: "",
      })),

      homeTask: l.homeTask ?? "",
      homeTaskSource: l.homeTaskSource ?? "",
      homeTaskId: l.homeTaskId ?? null,
      attachedFile: l.attachedFile ?? null,
    }));

      return {
        weekStart: data.weekStart ?? "",
        weekEnd: data.weekEnd ?? "",
        lessons,
      };
  },

  async getTeacherGrade(
    lessonId: number,
    studentId: number
  ): Promise<{ grade: number | null; comment: string }> {
    return diaryApi.getTeacherGrade(lessonId, studentId);
  },

  async getStudentsByClass(lessonId: number): Promise<TeacherStudentRecord[]> {
    const weekData = await this.getScheduleByWeek(0);
    const lesson = weekData.lessons.find((x) => x.lessonId === lessonId);
    return lesson?.students ?? [];
  },

  async saveGrade(
    studentId: number,
    lessonId: number,
    grade: number | null,
    comment: string,
    name?: string // 👈 добавили
  ): Promise<TeacherStudentRecord> {
    if (grade != null) {
      await diaryApi.setTeacherGrade({ studentId, lessonId, grade, comment });
    }

    return {
      id: studentId,
      name: name ?? "Student",
      grade,
      comment,
    };
  },

  async upsertLessonTask(lessonId: number, text: string, sourceUrl: string): Promise<void> {
    try {
      await diaryApi.updateHomeTask({lessonId, text, sourceUrl: sourceUrl || undefined });
    } catch {
      await diaryApi.createHomeTask({ lessonId, text, sourceUrl: sourceUrl || undefined });
    }
  },
};

export function getWeekRangeLabel(weekStart: string, weekEnd: string, locale?: string): string {
  if (!weekStart || !weekEnd) return "Unknown week";
  const [sY, sM, sD] = weekStart.split("-").map(Number);
  const [eY, eM, eD] = weekEnd.split("-").map(Number);
  const start = new Date(sY, (sM ?? 1) - 1, sD ?? 1);
  const end = new Date(eY, (eM ?? 1) - 1, eD ?? 1);
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  return `${fmt.format(start)} – ${fmt.format(end)}, ${start.getFullYear()}`;
}
