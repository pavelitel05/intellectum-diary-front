import { Link } from "react-router-dom";
import { Card, CardTitle } from "@/components/Card";
import { IconCalendar } from "@/components/Layout/icons";

export function TeacherDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-ink-dark sm:text-3xl">
          Teacher dashboard
        </h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-ink-dark/65">
          Open your schedule to view the week and manage grades inside each lesson.
        </p>
      </div>

      <div className="max-w-md">
        <Link to="/teacher/schedule" className="group block rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40">
          <Card className="h-full transition-shadow group-hover:shadow-soft-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary dark:bg-primary/25">
                <IconCalendar className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="mb-1">Schedule</CardTitle>
                <p className="text-sm text-ink/60 dark:text-ink-dark/65">
                  Week view, lesson details, and grading in one place.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
