import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Heart, History, Tv } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DASHBOARD_NAV } from "@/components/dashboard/DashboardNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { activeSubscriptionQuery, favoritesQuery, formatDate } from "@/lib/catalog";
import { watchHistoryQuery } from "@/lib/activity";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Your dashboard — StreamVerse" },
      { name: "description", content: "See your subscription status, recent viewing and saved channels in one place." },
      { property: "og:title", content: "Your dashboard — StreamVerse" },
      { property: "og:description", content: "Subscription status, recent viewing and saved channels." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user, profile } = useAuth();
  const subscription = useQuery(activeSubscriptionQuery(user?.id));
  const favorites = useQuery(favoritesQuery(user?.id));
  const history = useQuery(watchHistoryQuery(user?.id));

  const sub = subscription.data as
    | { status: string; expiry_date: string | null; packages: { name: string } | null }
    | null
    | undefined;
  const isActive = sub?.status === "active" && (!sub.expiry_date || new Date(sub.expiry_date) > new Date());

  return (
    <DashboardLayout
      title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
      subtitle="Your subscription, viewing activity and saved channels."
      items={DASHBOARD_NAV}
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-sm text-muted-foreground">Subscription</p>
          {subscription.isLoading ? (
            <Skeleton className="mt-3 h-7 w-24" />
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : sub?.status ?? "None"}</Badge>
              <span className="text-sm">{sub?.packages?.name ?? "No plan"}</span>
            </div>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="size-3.5" /> Expires {formatDate(sub?.expiry_date)}
          </p>
        </div>
        <StatCard icon={Heart} label="Favorites" value={favorites.data?.length ?? 0} />
        <StatCard icon={History} label="Channels watched" value={history.data?.length ?? 0} />
      </div>

      <div className="surface-card mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {isActive ? "You're all set" : "Unlock premium channels"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isActive
                ? "Your package is active — jump straight into live TV."
                : "Subscribe to a package to watch every premium channel in HD."}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to={isActive ? "/live-tv" : "/pricing"}>
              <Tv className="size-4" /> {isActive ? "Watch live TV" : "View packages"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="surface-card mt-6 p-6">
        <h2 className="font-display text-lg font-semibold">Recently watched</h2>
        <div className="mt-4 space-y-3">
          {history.isLoading && <Skeleton className="h-16 w-full rounded-xl" />}
          {history.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing yet — start watching to build your history.</p>
          )}
          {(history.data ?? []).slice(0, 5).map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <span className="text-sm font-medium">{row.channels?.name ?? "Channel"}</span>
              <span className="text-xs text-muted-foreground">{formatDate(row.watched_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="surface-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 flex items-center gap-2 font-display text-2xl font-bold">
        <Icon className="size-5 text-primary" /> {value}
      </p>
    </div>
  );
}