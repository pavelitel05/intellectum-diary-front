import type {
  GradeEntry,
  HomeworkTask,
  NotificationItem,
  ScheduleLesson,
  SubjectGrades,
  User,
} from "@/types";

export const MOCK_USER: User = {
  id: "u1",
  email: "alex.student@school.edu",
  displayName: "Alex",
  role: "student",
  className: "10-B",
};

export const MOCK_SCHEDULE: ScheduleLesson[] = [
  {
    id: "l1",
    weekday: "monday",
    startTime: "08:00",
    endTime: "08:45",
    subject: "Mathematics",
    teacher: "Ms. Petrova",
    room: "201",
  },
  {
    id: "l2",
    weekday: "monday",
    startTime: "08:50",
    endTime: "09:35",
    subject: "English",
    teacher: "Mr. Smith",
    room: "105",
  },
  {
    id: "l3",
    weekday: "monday",
    startTime: "09:50",
    endTime: "10:35",
    subject: "Physics",
    teacher: "Dr. Volkov",
    room: "Lab A",
  },
  {
    id: "l4",
    weekday: "tuesday",
    startTime: "08:00",
    endTime: "08:45",
    subject: "History",
    teacher: "Ms. Ivanova",
    room: "302",
  },
  {
    id: "l5",
    weekday: "tuesday",
    startTime: "08:50",
    endTime: "09:35",
    subject: "Mathematics",
    teacher: "Ms. Petrova",
    room: "201",
  },
  {
    id: "l6",
    weekday: "wednesday",
    startTime: "08:00",
    endTime: "08:45",
    subject: "Chemistry",
    teacher: "Dr. Kozlov",
    room: "Lab B",
  },
  {
    id: "l7",
    weekday: "wednesday",
    startTime: "08:50",
    endTime: "09:35",
    subject: "Literature",
    teacher: "Ms. Orlova",
    room: "112",
  },
  {
    id: "l8",
    weekday: "thursday",
    startTime: "08:00",
    endTime: "08:45",
    subject: "Biology",
    teacher: "Ms. Sokolova",
    room: "210",
  },
  {
    id: "l9",
    weekday: "friday",
    startTime: "08:00",
    endTime: "08:45",
    subject: "Physical Education",
    teacher: "Coach Nikitin",
    room: "Gym",
  },
];

const mathGrades: GradeEntry[] = [
  {
    id: "g1",
    subject: "Mathematics",
    value: 5,
    maxValue: 100,
    label: "Quiz",
    date: "2026-03-28",
  },
  {
    id: "g2",
    subject: "Mathematics",
    value: 4,
    maxValue: 100,
    label: "Homework",
    date: "2026-03-20",
  },
];

const englishGrades: GradeEntry[] = [
  {
    id: "g3",
    subject: "English",
    value: 5,
    maxValue: 100,
    label: "Essay",
    date: "2026-03-25",
  },
];

const physicsGrades: GradeEntry[] = [
  {
    id: "g4",
    subject: "Physics",
    value: 3,
    maxValue: 100,
    label: "Lab report",
    date: "2026-03-22",
  },
  {
    id: "g5",
    subject: "Physics",
    value: 4,
    maxValue: 100,
    label: "Test",
    date: "2026-03-15",
  },
];

function avg(entries: GradeEntry[]): number {
  if (!entries.length) return 0;
  const sum = entries.reduce((a, e) => a + e.value, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}

export const MOCK_SUBJECT_GRADES: SubjectGrades[] = [
  { subject: "Mathematics", entries: mathGrades, average: avg(mathGrades) },
  { subject: "English", entries: englishGrades, average: avg(englishGrades) },
  { subject: "Physics", entries: physicsGrades, average: avg(physicsGrades) },
  {
    subject: "History",
    entries: [
      {
        id: "g6",
        subject: "History",
        value: 5,
        maxValue: 100,
        label: "Oral exam",
        date: "2026-03-18",
      },
    ],
    average: 5,
  },
];

export const MOCK_HOMEWORK: HomeworkTask[] = [
  {
    id: "h1",
    title: "Algebra exercises 12–18",
    subject: "Mathematics",
    dueDate: "2026-04-03",
    status: "pending",
  },
  {
    id: "h2",
    title: "Read chapter 4, summary (1 page)",
    subject: "Literature",
    dueDate: "2026-04-01",
    status: "pending",
  },
  {
    id: "h3",
    title: "Physics: mechanics problems set B",
    subject: "Physics",
    dueDate: "2026-03-28",
    status: "overdue",
  },
  {
    id: "h4",
    title: "Vocabulary list unit 7",
    subject: "English",
    dueDate: "2026-03-30",
    status: "done",
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "Parent meeting",
    message: "Scheduled for Friday at 17:00 in the assembly hall.",
    createdAt: "2026-04-01T09:00:00",
    read: false,
  },
  {
    id: "n2",
    title: "Homework reminder",
    message: "Mathematics assignment due tomorrow.",
    createdAt: "2026-03-31T14:30:00",
    read: false,
  },
  {
    id: "n3",
    title: "Schedule change",
    message: "Wednesday Chemistry moves to room Lab C.",
    createdAt: "2026-03-29T08:00:00",
    read: true,
  },
];
