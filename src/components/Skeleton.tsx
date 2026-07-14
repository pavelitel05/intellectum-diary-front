export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`
        animate-pulse rounded-xl bg-ink/10 dark:bg-ink-dark/15
        ${className}
      `.trim()}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-ink/5 p-5 dark:border-ink-dark/10">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
