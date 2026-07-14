import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { IconMenu, IconMoon, IconSun } from "@/components/Layout/icons";
import { Badge } from "@/components/Badge";
import type { UserRole } from "@/types";

const roleLabels: Record<UserRole, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
  parent: "Parent",
};

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggle);

  return (
    <header
      className="
        sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-ink/8
        bg-surface/90 px-4 backdrop-blur-md dark:border-ink-dark/15 dark:bg-surface-dark/90
        sm:px-6
      "
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl p-2 text-ink/70 hover:bg-primary/10 md:hidden dark:text-ink-dark/75"
          onClick={onOpenMenu}
          aria-label="Open menu"
        >
          <IconMenu className="h-6 w-6" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs uppercase tracking-wide text-ink/45 dark:text-ink-dark/50">
            Signed in
          </p>
          <p className="text-sm font-semibold text-ink dark:text-ink-dark">
            {user?.displayName ?? "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <Badge tone="secondary" className="hidden capitalize sm:inline-flex">
            {roleLabels[user.role]}
          </Badge>
        ) : null}
        <button
          type="button"
          onClick={toggleTheme}
          className="
            rounded-xl border border-ink/10 p-2.5 text-ink/70 transition-colors
            hover:bg-accent/40 hover:border-accent/50 dark:border-ink-dark/20 dark:text-ink-dark/80
            dark:hover:bg-accent-dark/20
          "
          aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? (
            <IconSun className="h-5 w-5" />
          ) : (
            <IconMoon className="h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => void logout()}
          className="
            rounded-xl px-3 py-2 text-sm font-medium text-ink/75 transition-colors
            hover:bg-primary/10 hover:text-ink dark:text-ink-dark/80 dark:hover:bg-primary/15 dark:hover:text-ink-dark
          "
        >
          Log out
        </button>
      </div>
    </header>
  );
}
