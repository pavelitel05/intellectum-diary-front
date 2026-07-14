import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/Table";
import { diaryApi } from "@/services/api";

export function AdminSubjectsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subjects, setSubjects] = useState<Awaited<ReturnType<typeof diaryApi.adminGetSubjects>>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      setSubjects(await diaryApi.adminGetSubjects());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    if (!name.trim()) return;
    setErr(null);
    setLoading(true);
    try {
      await diaryApi.adminCreateSubject({ name: name.trim(), description });
      setName("");
      setDescription("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create subject");
      setLoading(false);
    }
  }

  async function remove(id: number) {
    setErr(null);
    setLoading(true);
    try {
      await diaryApi.adminDeleteSubject(id);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete subject");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Subjects</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Create subject</CardTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Subject name"
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
          />
          <Button onClick={() => void create()} isLoading={loading}>
            Create
          </Button>
        </div>
      </Card>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      <Card>
        <CardTitle className="mb-3">All subjects</CardTitle>
        <Table>
          <THead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {subjects.map((s) => (
              <Tr key={s.id}>
                <Td>{s.id}</Td>
                <Td>{s.name}</Td>
                <Td>{s.description}</Td>
                <Td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => void remove(s.id ?? 0)}
                    isLoading={loading}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
