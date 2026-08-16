import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DASHBOARD_NAV } from "@/components/dashboard/DashboardNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatPrice } from "@/lib/catalog";
import { mySubscriptionsQuery } from "@/lib/activity";
import { cancelMySubscription } from "@/lib/subscriptions.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/subscription")({
  head: () => ({
    meta: [
      { title: "Manage your subscription — StreamVerse" },
      { name: "description", content: "Review your current live TV package, expiry date and subscription history." },
      { property: "og:title", content: "Manage your subscription — StreamVerse" },
      { property: "og:description", content: "Review your plan, expiry date and history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const { user } = useAuth();
  const subs = useQuery(mySubscriptionsQuery(user?.id));
  const cancel = useServerFn(cancelMySubscription);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const onCancel = async (id: string) => {
    setBusy(id);
    try {
      await cancel({ data: { subscriptionId: id } });
      toast.success("Subscription cancelled. Access continues until the expiry date.");
      await queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <DashboardLayout title="Subscription" subtitle="Your current plan and past subscriptions." items={DASHBOARD_NAV}>
      {subs.isLoading && <Skeleton className="h-40 w-full rounded-2xl" />}
      {subs.data?.length === 0 && (
        <div className="surface-card p-8 text-center">
          <p className="text-muted-foreground">You don't have a subscription yet.</p>
          <Button className="mt-4" asChild><Link to="/pricing">Browse packages</Link></Button>
        </div>
      )}
      <div className="space-y-4">
        {(subs.data ?? []).map((sub) => {
          const pkg = sub.packages as unknown as { name: string; price: number; currency: string } | null;
          const active = sub.status === "active" && new Date(sub.expiry_date) > new Date();
          return (
            <div key={sub.id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">{pkg?.name ?? "Package"}</h2>
                  <Badge variant={active ? "default" : "secondary"}>{active ? "Active" : sub.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(sub.start_date)} → {formatDate(sub.expiry_date)}
                  {pkg && ` · ${formatPrice(Number(pkg.price), pkg.currency)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" asChild><Link to="/pricing">Change plan</Link></Button>
                {active && (
                  <Button variant="destructive" disabled={busy === sub.id} onClick={() => void onCancel(sub.id)}>
                    {busy === sub.id ? "Cancelling…" : "Cancel"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}