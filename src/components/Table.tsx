import type { HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({
  children,
  className = "",
  ...props
}: TableHTMLAttributes<HTMLTableElement> & { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-ink/8 dark:border-ink-dark/15">
      <table
        className={`w-full min-w-[520px] text-left text-sm ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function THead({
  children,
  className = "",
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`
        bg-primary/10 text-ink/80 dark:bg-primary/15 dark:text-ink-dark/85
        ${className}
      `.trim()}
    >
      {children}
    </thead>
  );
}

export function TBody({
  children,
  className = "",
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className}>{children}</tbody>;
}

export function Tr({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`
        border-b border-ink/6 last:border-0 transition-colors
        hover:bg-primary/5 dark:border-ink-dark/10 dark:hover:bg-primary/10
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </tr>
  );
}

export function Th({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-4 py-3 font-semibold first:rounded-tl-xl last:rounded-tr-xl ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
}
