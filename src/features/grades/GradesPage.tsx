import { useEffect, useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/Table";
import { Skeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { diaryApi } from "@/services/api";
import type { SubjectGrades } from "@/types";
import { gradeTone } from "@/utils/grades";

function GradeDot({ value, max }: { value: number; max: number }) {
  const tone = gradeTone(value, max);
  const bg =
    tone === "high"
      ? "bg-emerald-500"
      : tone === "mid"
        ? "bg-primary"
        : "bg-red-500";
  return (
    <span
      className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg text-sm font-semibold text-white ${bg}`}
      title={`${value}/${max}`}
    >
      {value}
    </span>
  );
}

export function GradesPage() {
  const [subjects, setSubjects] = useState<SubjectGrades[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await diaryApi.getGrades();
      setSubjects(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-ink-dark sm:text-3xl">Grades</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/65">
          Per-subject performance and recent marks.
        </p>
      </div>

      {err ? <ErrorState message={err} onRetry={() => void load()} /> : null}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : !subjects?.length ? (
        <EmptyState title="No grades" description="Grades will show up when teachers publish them." />
      ) : (
        <div className="space-y-6">
          {subjects.map((sg) => {
            const avgTone = gradeTone(sg.average, 100);
            const avgBadge =
              avgTone === "high" ? "success" : avgTone === "mid" ? "primary" : "warning";
            return (
              <Card key={sg.subject}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="mb-0">{sg.subject}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-ink/55 dark:text-ink-dark/60">Average</span>
                    <Badge tone={avgBadge} className="text-sm tabular-nums">
                      {sg.average.toFixed(1)} / 100
                    </Badge>
                  </div>
                </div>
                <Table>
                  <THead>
                    <Tr>
                      <Th>Grade</Th>
                      <Th>Comment</Th>
                      <Th>Date</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {sg.entries.map((e) => (
                      <Tr key={e.id}>
                        <Td>
                          <div className="flex items-center gap-2">
                            <GradeDot value={e.value} max={e.maxValue} />
                            <span className="text-ink/50 dark:text-ink-dark/55">/{e.maxValue}</span>
                          </div>
                        </Td>
                        <Td className="whitespace-pre-wrap text-ink/80 dark:text-ink-dark/85">
                          {e.label}
                        </Td>                        
                        <Td className="text-ink/60 dark:text-ink-dark/65">{e.date}</Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
