import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  children,
  className = "",
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl bg-white/90 shadow-soft border border-ink/5
        dark:bg-ink/10 dark:border-ink-dark/10 dark:shadow-none
        transition-shadow duration-200 hover:shadow-soft-lg
        ${paddingMap[padding]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-lg font-semibold text-ink dark:text-ink-dark ${className}`}
    >
      {children}
    </h2>
  );
}
