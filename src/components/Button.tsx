import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-soft hover:shadow-soft-lg dark:bg-primary dark:hover:brightness-110",
  secondary:
    "bg-secondary/80 text-ink hover:bg-secondary dark:bg-secondary-dark/40 dark:text-ink-dark dark:hover:bg-secondary-dark/60",
  ghost:
    "bg-transparent text-ink hover:bg-primary/10 dark:text-ink-dark dark:hover:bg-primary/20",
  danger:
    "bg-red-500/90 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-5 py-3 text-base rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:pointer-events-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-surface-dark
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
