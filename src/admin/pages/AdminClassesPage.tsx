import { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/Table";
import { diaryApi } from "@/services/api";

export function AdminClassesPage() {
  const [queryId, setQueryId] = useState("");
  const [classNameInput, setClassNameInput] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [loaded, setLoaded] = useState<Awaited<ReturnType<typeof diaryApi.adminGetClassById>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [classes, setClasses] = useState<
    Awaited<ReturnType<typeof diaryApi.adminGetAllClasses>>
  >([]);

  useEffect(() => {
    loadClasses();
  }, []);

  async function lookup() {
    const id = Number(queryId);
    if (!Number.isFinite(id)) return;
    setErr(null);
    setLoading(true);
    try {
      const data = await diaryApi.adminGetClassById(id);
      setLoaded(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load class");
    } finally {
      setLoading(false);
    }
  }

  async function createClass() {
    if (!classNameInput.trim()) return;
    setErr(null);
    setLoading(true);
    try {
      const data = await diaryApi.adminCreateClass(classNameInput.trim());
      setLoaded(data);
      setQueryId(String(data.id ?? ""));
      await loadClasses();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create class");
    } finally {
      setLoading(false);
    }
  }

  async function updateClass() {
    if (!classNameInput.trim()) return;
    if (!queryId) return;
    setErr(null);
    setLoading(true);
    try {
      const data = await diaryApi.adminUpdateClass(Number(queryId), classNameInput.trim());
      setLoaded(data);
      setQueryId(String(data.id ?? ""));
      await loadClasses();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update class");
    } finally {
      setLoading(false);
    }
  }

  async function addStudent() {
    if (!loaded?.id) return;
    const studentId = Number(studentIdInput);
    if (!Number.isFinite(studentId)) return;
    setErr(null);
    setLoading(true);
    try {
      const data = await diaryApi.adminAddStudentToClass(loaded.id, studentId);
      setLoaded(data);
      setStudentIdInput("");
      loadClasses();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to add student");
    } finally {
      setLoading(false);
    }
  }

  async function removeStudent(studentId: number) {
    if (!loaded?.id) return;
    setErr(null);
    setLoading(true);
    try {
      const data = await diaryApi.adminRemoveStudentFromClass(loaded.id, studentId);
      setLoaded(data);
      loadClasses();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to remove student");
    } finally {
      setLoading(false);
    }
  }

  async function loadClasses() {
    try {
      const data = await diaryApi.adminGetAllClasses();
      setClasses(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load classes");
    }
  }

  async function deleteClass(id: number) {
    try {
      await diaryApi.adminDeleteClass(id);
      await loadClasses();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete class");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Classes</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Class operations</CardTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            placeholder="Class id"
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
          />
          <input
            value={classNameInput}
            onChange={(e) => setClassNameInput(e.target.value)}
            placeholder="Class name"
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => void lookup()} isLoading={loading}>
              Get by id
            </Button>
            <Button onClick={() => void createClass()} isLoading={loading}>
              Create
            </Button>
            <Button variant="secondary" onClick={() => void updateClass()} isLoading={loading}>
              Update
            </Button>
          </div>
        </div>
      </Card>

      {err ? <ErrorState message={err} /> : null}

      {loaded ? (
        <Card>
          <CardTitle className="mb-3">Class: {loaded.className ?? "—"}</CardTitle>
          <p className="mb-3 text-sm text-ink/60 dark:text-ink-dark/65">ID: {loaded.id ?? "—"}</p>

          <div className="mb-4 flex gap-2">
            <input
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              placeholder="Student id"
              className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
            />
            <Button onClick={() => void addStudent()} isLoading={loading}>
              Add student
            </Button>
          </div>

          <Table>
            <THead>
              <Tr>
                <Th>Name</Th>
                <Th>Actions</Th>
              </Tr>
            </THead>
            <TBody>
              {(loaded.students ?? []).map((s) => (
                <Tr key={s.id}>
                  <Td>{s.name}</Td>
                  <Td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => void removeStudent(s.id ?? 0)}
                      isLoading={loading}
                    >
                      Remove
                    </Button>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Card>
      ) : null}

      <Card>
        <CardTitle className="mb-3">All classes</CardTitle>

        <Table>
          <THead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Students</Th>
              <Th>Actions</Th>
            </Tr>
          </THead>

          <TBody>
            {classes.map((c) => (
              <Tr key={c.id}>
                <Td>{c.id}</Td>
                <Td>{c.className}</Td>
                <Td>{c.students?.length ?? 0}</Td>
                <Td>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => void deleteClass(c.id ?? 0)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void setLoaded(c)}
                      >
                      Open
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>

    </div>
  );
}
