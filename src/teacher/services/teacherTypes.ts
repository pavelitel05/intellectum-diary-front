export interface TeacherStudentRecord {
  id: number;
  name: string;
  grade: number | null;
  comment: string;
}

export interface TeacherClassSession {
  id: string;
  lessonId: number;
  className: string;
  subject?: string;
  date: string;
  startTime: string;
  endTime: string;
  students: TeacherStudentRecord[];
  homeTask: string;
  homeTaskId: number | null;
  homeTaskSource: string;
  attachedFile: string | null;
}

export interface TeacherWeekSchedule {
  weekStart: string;
  weekEnd: string;
  lessons: TeacherClassSession[];
}
