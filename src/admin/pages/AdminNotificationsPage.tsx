import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/Table";
import { diaryApi } from "@/services/api";

export function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [items, setItems] = useState<Awaited<ReturnType<typeof diaryApi.adminGetNotifications>>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      setItems(await diaryApi.adminGetNotifications());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  async function create() {
    if (!title.trim() || !text.trim() || !dueTo) return;
    setErr(null);
    setLoading(true);
    try {
      await diaryApi.adminCreateNotification({ title: title.trim(), text: text.trim(), dueTo });
      setTitle("");
      setText("");
      setDueTo("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create notification");
      setLoading(false);
    }
  }

  async function remove(id: number) {
    setErr(null);
    setLoading(true);
    try {
      await diaryApi.adminDeleteNotification(id);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete notification");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Notifications</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Create notification</CardTitle>
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text"
            rows={4}
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark resize-y"
          />
          <input
            type="datetime-local"
            value={dueTo}
            onChange={(e) => setDueTo(e.target.value)}
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
          />
          <Button onClick={() => void create()} isLoading={loading}>
            Create
          </Button>
        </div>
      </Card>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      <Card>
        <CardTitle className="mb-3">All notifications</CardTitle>
        <Table>
          <THead>
            <Tr>
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Text</Th>
              <Th>Posted At</Th>
              <Th>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {items.map((n) => (
              <Tr key={n.id}>
                <Td>{n.id}</Td>
                <Td>{n.title}</Td>
                <Td className="whitespace-pre-wrap">{n.text}</Td>
                <Td>{n.postedAt}</Td>
                <Td>
                  <Button variant="danger" size="sm" onClick={() => void remove(n.id ?? 0)} isLoading={loading}>
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
