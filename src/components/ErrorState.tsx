import { Button } from "@/components/Button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/80 px-5 py-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
