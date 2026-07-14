import type { HTMLAttributes, ReactNode } from "react";

type Tone = "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "muted";

const tones: Record<Tone, string> = {
  default: "bg-ink/8 text-ink dark:bg-ink-dark/15 dark:text-ink-dark",
  primary: "bg-primary/20 text-primary-dark dark:bg-primary/30 dark:text-accent",
  secondary: "bg-secondary/35 text-ink dark:bg-secondary-dark/25 dark:text-ink-dark",
  accent: "bg-accent/80 text-ink dark:bg-accent-dark/50 dark:text-ink-dark",
  success: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  warning: "bg-amber-500/20 text-amber-900 dark:text-amber-200",
  muted: "bg-ink/5 text-ink/70 dark:bg-ink-dark/10 dark:text-ink-dark/80",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: Tone;
}

export function Badge({ children, tone = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium
        ${tones[tone]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
