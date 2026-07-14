import { NavLink } from "react-router-dom";
import { IconBook, IconCalendar, IconClose, IconHome, IconUser } from "@/components/Layout/icons";

const nav = [
  { to: "/admin", label: "Overview", Icon: IconHome, end: true },
  { to: "/admin/users", label: "Users", Icon: IconUser, end: false },
  { to: "/admin/classes", label: "Classes", Icon: IconHome, end: false },
  { to: "/admin/subjects", label: "Subjects", Icon: IconBook, end: false },
  { to: "/admin/schedule", label: "Schedule", Icon: IconCalendar, end: false },
  { to: "/admin/notifications", label: "Notifications", Icon: IconBook, end: false },
] as const;

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `
    flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
    transition-colors duration-200
    ${
      isActive
        ? "bg-primary text-white shadow-soft dark:bg-primary dark:text-white"
        : "text-ink/75 hover:bg-primary/10 hover:text-ink dark:text-ink-dark/80 dark:hover:bg-primary/15 dark:hover:text-ink-dark"
    }
  `.trim();

  const aside = (
    <aside
      className={`
        flex min-h-screen w-64 shrink-0 flex-col border-r border-ink/8 bg-white/95 px-3 py-6
        dark:border-ink-dark/15 dark:bg-[#25262a]
        md:static md:translate-x-0
        fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-out
        ${mobileOpen ? "translate-x-0 shadow-soft-lg" : "-translate-x-full md:translate-x-0"}
      `.trim()}
    >
      <div className="mb-8 flex items-center justify-between px-2 md:justify-start">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold">
            I
          </div>
          <div>
            <p className="text-sm font-semibold text-ink dark:text-ink-dark">Intellectum</p>
            <p className="text-xs text-ink/55 dark:text-ink-dark/55">Admin panel</p>
          </div>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-ink/60 hover:bg-primary/10 md:hidden dark:text-ink-dark/70"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <IconClose className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={onCloseMobile}>
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      {aside}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-[1px] md:hidden dark:bg-black/50"
          aria-label="Close overlay"
          onClick={onCloseMobile}
        />
      ) : null}
    </>
  );
}
