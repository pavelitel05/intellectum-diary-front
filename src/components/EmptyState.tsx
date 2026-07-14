import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-ink/[0.02] px-6 py-14 text-center dark:border-ink-dark/20 dark:bg-ink-dark/5">
      {icon ? (
        <div className="mb-4 text-primary dark:text-secondary">{icon}</div>
      ) : null}
      <p className="text-base font-medium text-ink dark:text-ink-dark">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-ink/60 dark:text-ink-dark/65">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
