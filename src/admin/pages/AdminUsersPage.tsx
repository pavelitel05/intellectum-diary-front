import { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/Badge";
import { diaryApi } from "@/services/api";
import type { User } from "@/types";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/Table";

type RoleOption = "ADMIN" | "TEACHER" | "STUDENT";

export function AdminUsersPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<RoleOption>("STUDENT");
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await diaryApi.adminGetAllUsers();
      setUsers(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load users");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const result = await diaryApi.adminCreateUser({ role, name });
      setCreated(result);
      setName("");
      await loadUsers();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Users</h1>
      </div>

      {err ? <ErrorState message={err} /> : null}

      <Card>
        <CardTitle className="mb-4">Create user</CardTitle>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            required
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleOption)}
            className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark"
          >
            <option value="STUDENT">STUDENT</option>
            <option value="TEACHER">TEACHER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <Button type="submit" isLoading={loading}>
            Create
          </Button>
        </form>
      </Card>

      {created ? (
        <Card>
          <CardTitle className="mb-3">Created credentials</CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge tone="secondary">username: {created.username}</Badge>
            <Badge tone="accent">password: {created.password}</Badge>
          </div>
        </Card>
      ) : null}

      <Card>
        <CardTitle className="mb-3">All users</CardTitle>
        <Table>
          <THead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Role</Th>
            </Tr>
          </THead>

          <TBody>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td>{u.id}</Td>
                <Td>{u.displayName}</Td>
                <Td>
                  <Badge tone="secondary">{u.role}</Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
