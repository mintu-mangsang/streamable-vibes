import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DASHBOARD_NAV } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/catalog";
import { watchHistoryQuery } from "@/lib/activity";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/history")({
  head: () => ({
    meta: [
      { title: "Watch history — StreamVerse" },
      { name: "description", content: "A record of the live TV channels you recently watched on StreamVerse." },
      { property: "og:title", content: "Watch history — StreamVerse" },
      { property: "og:description", content: "The channels you recently watched." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const history = useQuery(watchHistoryQuery(user?.id));

  return (
    <DashboardLayout title="Watch history" subtitle="Your most recent viewing activity." items={DASHBOARD_NAV}>
      {history.isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : (history.data ?? []).length === 0 ? (
        <div className="surface-card p-8 text-center">
          <p className="text-muted-foreground">No viewing activity yet.</p>
          <Button className="mt-4" asChild><Link to="/live-tv">Start watching</Link></Button>
        </div>
      ) : (
        <div className="surface-card divide-y divide-border">
          {(history.data ?? []).map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{row.channels?.name ?? "Channel"}</p>
                <p className="text-xs text-muted-foreground">{formatDate(row.watched_at)}</p>
              </div>
              {row.channels?.slug && (
                <Button size="sm" variant="secondary" asChild>
                  <Link to="/channel/$slug" params={{ slug: row.channels.slug }}>Watch again</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}