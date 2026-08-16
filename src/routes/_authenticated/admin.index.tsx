import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminPage } from "@/components/admin/AdminGuard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPrice } from "@/lib/catalog";
import { getAdminOverview } from "@/lib/admin-data.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — StreamVerse" },
      { name: "description", content: "Platform statistics: users, channels, active subscriptions and revenue." },
      { property: "og:title", content: "Admin overview — StreamVerse" },
      { property: "og:description", content: "Platform statistics: users, channels, active subscriptions and revenue." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const fetchOverview = useServerFn(getAdminOverview);
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => fetchOverview({}) });
  const d = overview.data;

  return (
    <AdminPage title="Admin overview" subtitle="Platform health at a glance.">
      {overview.isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total users", value: String(d?.totalUsers ?? 0) },
              { label: "Channels", value: String(d?.totalChannels ?? 0) },
              { label: "Active subscriptions", value: String(d?.activeSubscriptions ?? 0) },
              { label: "Revenue (all time)", value: formatPrice(d?.revenue ?? 0, "USD") },
            ].map((s) => (
              <div key={s.label} className="surface-card p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="surface-card mt-6 p-6">
            <h2 className="font-display text-lg font-semibold">
              This month: {formatPrice(d?.monthlyRevenue ?? 0, "USD")}
            </h2>
            <div className="mt-4 space-y-2">
              {(d?.recentPayments ?? []).map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3">
                  <span className="font-mono text-xs">{p.transaction_id}</span>
                  <span className="text-sm">{formatPrice(Number(p.amount), p.currency)}</span>
                  <Badge variant={p.status === "success" ? "default" : p.status === "failed" ? "destructive" : "secondary"}>{p.status}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(p.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminPage>
  );
}
