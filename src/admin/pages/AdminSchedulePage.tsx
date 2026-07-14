import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Button } from "@/components/Button";
import { ErrorState } from "@/components/ErrorState";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/Table";
import { diaryApi } from "@/services/api";

type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";


export function AdminSchedulePage() {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("MONDAY");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("08:45");
  const [editId, setEditId] = useState("");
  const [items, setItems] = useState<Awaited<ReturnType<typeof diaryApi.adminGetScheduleRules>>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setErr(null);
    setLoading(true);
    try {
      setItems(await diaryApi.adminGetScheduleRules());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  function payload() {
    return {
      classId: Number(classId),
      subjectId: Number(subjectId),
      teacherId: Number(teacherId),
      dayOfWeek,
      startTime: startTime + ":00", // "08:00:00"
      endTime: endTime + ":00",
    };
  }

  async function createRule() {
    setErr(null);
    setLoading(true);
    try {
      await diaryApi.adminCreateScheduleRule(payload());
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create schedule rule");
      setLoading(false);
    }
  }

  async function updateRule() {
    const id = Number(editId);
    if (!Number.isFinite(id)) return;
    setErr(null);
    setLoading(true);
    try {
      await diaryApi.adminUpdateScheduleRule(id, payload());
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update schedule rule");
      setLoading(false);
    }
  }

  async function removeRule(id: number) {
    setErr(null);
    setLoading(true);
    try {
      await diaryApi.adminDeleteScheduleRule(id);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to delete schedule rule");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Schedule</h1>
      </div>

      <Card>
        <CardTitle className="mb-3">Create / update schedule rule</CardTitle>
        <div className="grid gap-3 sm:grid-cols-4">
          <input value={editId} onChange={(e) => setEditId(e.target.value)} placeholder="Rule ID (for update)" className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark" />
          <input value={classId} onChange={(e) => setClassId(e.target.value)} placeholder="classId" className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark" />
          <input value={subjectId} onChange={(e) => setSubjectId(e.target.value)} placeholder="subjectId" className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark" />
          <input value={teacherId} onChange={(e) => setTeacherId(e.target.value)} placeholder="teacherId" className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark" />
          <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)} className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark">
            {["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"].map((d)=>(
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark" />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl border border-ink/12 bg-white px-4 py-2.5 text-sm dark:border-ink-dark/20 dark:bg-ink/10 dark:text-ink-dark" />
          <div className="flex gap-2">
            <Button onClick={() => void createRule()} isLoading={loading}>Create</Button>
            <Button variant="secondary" onClick={() => void updateRule()} isLoading={loading}>Update</Button>
          </div>
        </div>
      </Card>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      <Card>
        <CardTitle className="mb-3">Rules</CardTitle>
        <Table>
          <THead>
            <Tr>
              <Th>ID</Th><Th>Class</Th><Th>Subject</Th><Th>Teacher</Th><Th>Day</Th><Th>Start</Th><Th>End</Th><Th>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {items.map((r) => (
              <Tr key={r.id}>
                <Td>{r.id}</Td>
                <Td>{r.classId}</Td>
                <Td>{r.subjectId}</Td>
                <Td>{r.teacherId}</Td>
                <Td>{r.dayOfWeek}</Td>
                <Td>{r.startTime}</Td>
                <Td>{r.endTime}</Td>
                {/* <Td>{localTimeToString(r.startTime)}</Td>
                <Td>{localTimeToString(r.endTime)}</Td> */}
                <Td>
                  <Button variant="danger" size="sm" onClick={() => void removeRule(r.id ?? 0)} isLoading={loading}>
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
