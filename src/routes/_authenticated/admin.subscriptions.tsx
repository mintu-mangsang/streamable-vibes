import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/catalog";
import { listAdminSubscriptions } from "@/lib/admin-data.functions";
import { setSubscriptionStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscription management — StreamVerse admin" },
      { name: "description", content: "Review every subscription, its package, expiry date and status." },
      { property: "og:title", content: "Subscription management — StreamVerse admin" },
      { property: "og:description", content: "Review every subscription, its package, expiry date and status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSubscriptions,
});

function AdminSubscriptions() {
  const fetchSubs = useServerFn(listAdminSubscriptions);
  const statusFn = useServerFn(setSubscriptionStatus);
  const queryClient = useQueryClient();
  const subs = useQuery({ queryKey: ["admin-subscriptions"], queryFn: () => fetchSubs({}) });

  const update = async (id: string, status: "active" | "cancelled" | "expired") => {
    try {
      await statusFn({ data: { subscriptionId: id, status } });
      await queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Subscription updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  return (
    <AdminPage title="Subscriptions" subtitle="All subscriptions across the platform.">
      <div className="surface-card overflow-x-auto p-2">
        {subs.isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(subs.data ?? []).map((s) => {
                const profile = s.profiles as unknown as { email: string | null } | null;
                const pkg = s.packages as unknown as { name: string } | null;
                return (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs">{profile?.email ?? s.user_id}</TableCell>
                    <TableCell>{pkg?.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">{formatDate(s.start_date)}</TableCell>
                    <TableCell className="text-xs">{formatDate(s.expiry_date)}</TableCell>
                    <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="secondary" onClick={() => void update(s.id, "active")}>Activate</Button>
                      <Button size="sm" variant="destructive" onClick={() => void update(s.id, "cancelled")}>Cancel</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminPage>
  );
}
