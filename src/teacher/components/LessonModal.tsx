import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import type { TeacherClassSession, TeacherStudentRecord } from "@/teacher/services/teacherTypes";
import { teacherService } from "@/teacher/services/teacherService";
import { apiClient, diaryApi } from "@/services/api";
import type { HomeworkTask } from "@/types/index";
const GRADE_MIN = 1;
const GRADE_MAX = 100;

function parseGradeInput(raw: string): { ok: true; value: number | null } | { ok: false; message: string } {
  const t = raw.trim();
  if (t === "") return { ok: true, value: null };
  const n = Number(t);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, message: "Grade must be a whole number or empty." };
  }
  if (n < GRADE_MIN || n > GRADE_MAX) {
    return { ok: false, message: `Grade must be between ${GRADE_MIN} and ${GRADE_MAX}, or empty.` };
  }
  return { ok: true, value: n };
}

type RowEdit = {
  gradeInput: string;
  comment: string;
  homeworkDone: boolean;
};

export function LessonModal({
  open,
  lesson,
  onClose,
  onSaved,
}: {
  open: boolean;
  lesson: TeacherClassSession | null;
  homework?: HomeworkTask | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<TeacherStudentRecord[]>([]);
  const [edits, setEdits] = useState<Record<string, RowEdit>>({});
  const [taskText, setTaskText] = useState("");
  const [taskSourceUrl, setTaskSourceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");

  const fileUrl = uploadedFileUrl || lesson?.attachedFile || "";
  const hasFileAttached = Boolean(fileUrl);
  
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !lesson) {
      setStudents([]);
      setEdits({});
      setTaskText("");
      setTaskSourceUrl("");
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const roster = lesson.students ?? [];

        const resolvedStudents = await Promise.all(
          roster.map(async (s) => {
            if (!s.id) {
              return {
                id: 0,
                name: s.name ?? "Student",
                grade: null,
                comment: "",
              };
            }

            try {
              const saved = await teacherService.getTeacherGrade(lesson.lessonId, s.id);

              const homeworkDone = await diaryApi.getHomeworkCompletion(
                s.id,
                lesson.homeTaskId ? lesson.homeTaskId : -1
              );

              return {
                id: s.id,
                name: s.name ?? "Student",
                grade: saved.grade,
                comment: saved.comment,
                homeworkDone,
              };
            } catch {
              return {
                id: s.id,
                name: s.name ?? "Student",
                grade: null,
                comment: "",
              };
            }
          })
        );

        if (cancelled) return;

        setStudents(resolvedStudents);
        setTaskText(lesson.homeTask ?? "");
        setTaskSourceUrl(lesson.homeTaskSource ?? "");

        const next: Record<string, RowEdit> = {};
        for (const s of resolvedStudents) {
          next[String(s.id)] = {
            gradeInput: s.grade != null ? String(s.grade) : "",
            comment: s.comment ?? "",
            homeworkDone: (s as any).homeworkDone ?? false,
          };
        }
        setEdits(next);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load students");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, lesson]);

  if (!open || !lesson) return null;

  async function handleSaveAll() {
    if (!lesson) return;
    setError(null);

    const payloads: Array<{ studentId: number; grade: number | null; comment: string }> = [];

    for (const s of students) {
      if (!s.id) continue;

      const e = edits[String(s.id)] ?? {
        gradeInput: "",
        comment: "",
        homeworkDone: false,
      };
      if (!e) continue;

      const parsed = parseGradeInput(e.gradeInput);
      if (!parsed.ok) {
        setError(parsed.message);
        return;
      }

      payloads.push({
        studentId: s.id,
        grade: parsed.value,
        comment: e.comment,
      });
    }

    setSaving(true);
    try {
      const updated: TeacherStudentRecord[] = [];

      for (const p of payloads) {
        const student = students.find(s => s.id === p.studentId);
        const e = edits[String(p.studentId)];

        const row = await teacherService.saveGrade(
          p.studentId,
          lesson.lessonId,
          p.grade,
          p.comment,
          student?.name
        );

        if (e?.homeworkDone) {
          await diaryApi.completeHomework(
            p.studentId,
            lesson.homeTaskId ? lesson.homeTaskId : -1
          );
        } else {
          await diaryApi.deleteHomeworkCompletion(
            p.studentId,
            lesson.homeTaskId ? lesson.homeTaskId : -1
          );
        }

        updated.push(row);
      }

      await teacherService.upsertLessonTask(lesson.lessonId, taskText, taskSourceUrl);

      setStudents((prev) =>
        prev.map((r) => {
          const u = updated.find((x) => x.id === r.id);
          return u ? { ...r, ...u } : r;
        })
      );

      setEdits((prev) => {
        const next = { ...prev };

        for (const u of updated) {
          const prevEdit = prev[String(u.id)];

          next[String(u.id)] = {
            gradeInput: u.grade != null ? String(u.grade) : "",
            comment: u.comment,
            homeworkDone: prevEdit?.homeworkDone ?? false,
          };
        }

        return next;
      });

      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadHomeworkFile() {
    if (!selectedFile || !lesson) return;

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("lessonId", String(lesson.lessonId));

    const response = await apiClient.post(
      "/task/attach",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setUploadedFileUrl(response.data.filePath);
    setSelectedFile(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] dark:bg-black/60"
        aria-label="Close modal backdrop"
        onClick={onClose}
      />

      <div
        className="
          relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-ink/10
          bg-white shadow-soft-lg dark:border-ink-dark/20 dark:bg-[#2a2b30] sm:rounded-2xl
        "
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ink/8 px-4 py-4 dark:border-ink-dark/15 sm:px-5">
          <div className="min-w-0">
            <h2 id="lesson-modal-title" className="mb-1 text-lg font-semibold text-ink dark:text-ink-dark">
              {lesson.className}
            </h2>
            <p className="text-sm text-ink/60 dark:text-ink-dark/65">
              {lesson.date} · {lesson.startTime}–{lesson.endTime}
              {lesson.subject ? ` · ${lesson.subject}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium text-ink/70 hover:bg-primary/10 dark:text-ink-dark/80"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {error ? (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : !students.length ? (
            <EmptyState title="No students" description="No students are enrolled in this class." />
          ) : (
            <ul className="space-y-4">
              {students.map((s) => {
                const e = edits[String(s.id)] ?? { gradeInput: "", comment: "" };

                return (
                  <li
                    key={s.id}
                    className="rounded-xl border border-ink/8 bg-surface/80 p-3 dark:border-ink-dark/12 dark:bg-ink/5"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-ink dark:text-ink-dark">{s.name}</p>
                      <Badge tone="muted" className="tabular-nums text-xs">
                        Saved: {s.grade != null ? `${s.grade} / ${GRADE_MAX}` : "—"}
                      </Badge>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label
                          className="mb-1 block text-xs font-medium text-ink/70 dark:text-ink-dark/75"
                          htmlFor={`m-grade-${s.id}`}
                        >
                          Grade ({GRADE_MIN}–{GRADE_MAX})
                        </label>
                        <input
                          id={`m-grade-${s.id}`}
                          type="text"
                          inputMode="numeric"
                          value={e.gradeInput}
                          onChange={(ev) =>
                            setEdits((prev) => ({
                              ...prev,
                              [String(s.id)]: { ...e, gradeInput: ev.target.value },
                            }))
                          }
                          className="
                            w-full max-w-[6rem] rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm tabular-nums
                            outline-none focus:border-primary focus:ring-2 focus:ring-primary/25
                            dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark
                          "
                          placeholder="—"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          id={`m-homework-${s.id}`}
                          type="checkbox"
                          checked={e.homeworkDone}
                          onChange={(ev) =>
                            setEdits((prev) => ({
                              ...prev,
                              [String(s.id)]: {
                                ...e,
                                homeworkDone: ev.target.checked,
                              },
                            }))
                          }
                          className="
                            h-4 w-4 rounded border-ink/20 text-primary
                            focus:ring-2 focus:ring-primary/25
                          "
                        />

                        <label
                          htmlFor={`m-homework-${s.id}`}
                          className="text-sm text-ink dark:text-ink-dark"
                        >
                          Homework completed
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          className="mb-1 block text-xs font-medium text-ink/70 dark:text-ink-dark/75"
                          htmlFor={`m-comment-${s.id}`}
                        >
                          Comment
                        </label>
                        <textarea
                          id={`m-comment-${s.id}`}
                          rows={2}
                          value={e.comment}
                          onChange={(ev) =>
                            setEdits((prev) => ({
                              ...prev,
                              [String(s.id)]: { ...e, comment: ev.target.value },
                            }))
                          }
                          className="
                            w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm text-ink
                            outline-none focus:border-primary focus:ring-2 focus:ring-primary/25
                            dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark
                          "
                          placeholder="Optional feedback…"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading ? (
            <div className="mt-4 space-y-2 rounded-xl border border-ink/8 p-3 dark:border-ink-dark/12">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/55 dark:text-ink-dark/60">
                Home task for this lesson
              </p>
              <textarea
                rows={3}
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="
                  w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm text-ink
                  outline-none focus:border-primary focus:ring-2 focus:ring-primary/25
                  dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark
                "
                placeholder="Task description..."
              />
              <input
                type="url"
                value={taskSourceUrl}
                onChange={(e) => setTaskSourceUrl(e.target.value)}
                className="
                  w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm text-ink
                  outline-none focus:border-primary focus:ring-2 focus:ring-primary/25
                  dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark
                "
                placeholder="Optional source URL"
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => void uploadHomeworkFile()}
                  disabled={!selectedFile}
                >
                  Upload
                </Button>
              </div>
              {hasFileAttached && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">✓ File attached</span>

                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 underline"
                  >
                    Open file
                  </a>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-ink/8 px-4 py-3 dark:border-ink-dark/15 sm:px-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSaveAll()}
            isLoading={saving}
            disabled={loading || !students.length || saving}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}