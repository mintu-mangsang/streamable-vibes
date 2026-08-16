import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, packagesQuery } from "@/lib/catalog";
import { createCheckout } from "@/lib/payments.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Subscription Packages & Pricing — StreamVerse" },
      { name: "description", content: "Compare StreamVerse live TV packages: 30, 90 and 365 day plans with HD streaming and premium channel access." },
      { property: "og:title", content: "Subscription Packages & Pricing — StreamVerse" },
      { property: "og:description", content: "Flexible live TV plans with HD streaming and premium channel access." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const packages = useQuery(packagesQuery);
  const { user } = useAuth();
  const navigate = useNavigate();
  const checkout = useServerFn(createCheckout);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const subscribe = async (packageId: string) => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    setPendingId(packageId);
    try {
      const result = await checkout({ data: { packageId } });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      toast.info(
        `Order ${result.transactionId} created and is pending. Connect a payment gateway to complete checkout — access activates only after the gateway confirms payment.`,
      );
      navigate({ to: "/dashboard/payments" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <PublicLayout>
      <PageHeader
        title="Packages & pricing"
        subtitle="Every plan includes HD streaming and access on all your devices. No hidden fees."
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {packages.isLoading &&
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          {(packages.data ?? []).map((pkg, index) => (
            <div key={pkg.id} className={`surface-card flex flex-col p-7 ${index === 1 ? "glow-ring" : ""}`}>
              {index === 1 && <Badge className="mb-3 w-fit">Most popular</Badge>}
              <h2 className="font-display text-xl font-semibold">{pkg.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
              <p className="mt-5 font-display text-4xl font-bold">
                {formatPrice(pkg.price, pkg.currency)}
              </p>
              <p className="text-sm text-muted-foreground">for {pkg.duration_days} days</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-7 w-full"
                variant={index === 1 ? "default" : "secondary"}
                disabled={pendingId === pkg.id}
                onClick={() => void subscribe(pkg.id)}
              >
                {pendingId === pkg.id ? "Starting…" : user ? "Subscribe" : "Sign in to subscribe"}
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Payments are processed by a secure gateway and verified on our servers. Your subscription is
          activated only after the gateway confirms a successful payment.
        </p>
      </section>
    </PublicLayout>
  );
}