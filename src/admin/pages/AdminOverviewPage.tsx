import { Link } from "react-router-dom";
import { Card, CardTitle } from "@/components/Card";

const links = [
  { to: "/admin/users", title: "Users", desc: "Create admin/teacher/student users" },
  { to: "/admin/classes", title: "Classes", desc: "Create/update class and assign students" },
  { to: "/admin/subjects", title: "Subjects", desc: "Manage subjects list" },
  { to: "/admin/schedule", title: "Schedule", desc: "Manage schedule rules" },
  { to: "/admin/notifications", title: "Notifications", desc: "Publish and delete notifications" },
] as const;

export function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">
          Admin panel
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/65">
          Manage core school entities synced with backend APIs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/35"
          >
            <Card className="h-full">
              <CardTitle className="mb-1">{l.title}</CardTitle>
              <p className="text-sm text-ink/60 dark:text-ink-dark/65">{l.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
