import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CheckoutResult = {
  transactionId: string;
  status: "pending";
  /** Non-null once a real gateway is configured; the UI redirects there. */
  checkoutUrl: string | null;
  gateway: string;
};

/**
 * Creates a PENDING payment record and (when a gateway is wired up) returns the
 * gateway checkout URL. Subscriptions are never activated here — activation only
 * happens in the verified webhook handler at /api/public/webhooks/payments.
 */
export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ packageId: z.string().uuid(), method: z.string().trim().max(40).optional() }).parse(data),
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: pkg, error: pkgError } = await supabaseAdmin
      .from("packages")
      .select("id, name, price, currency, status")
      .eq("id", data.packageId)
      .maybeSingle();

    if (pkgError || !pkg || pkg.status !== "active") {
      throw new Error("This package is not available for purchase.");
    }

    const gateway = process.env["PAYMENT_GATEWAY"] ?? "manual";
    const transactionId = `TXN-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const { error } = await supabaseAdmin.from("payments").insert({
      user_id: context.userId,
      package_id: pkg.id,
      transaction_id: transactionId,
      amount: pkg.price,
      currency: pkg.currency,
      payment_method: data.method ?? gateway,
      status: "pending",
    });
    if (error) throw new Error("Could not start the payment. Please try again.");

    await supabaseAdmin.from("audit_logs").insert({
      user_id: context.userId,
      action: "payment.created",
      entity_type: "payment",
      metadata: { transaction_id: transactionId, package: pkg.name },
    });

    return { transactionId, status: "pending", checkoutUrl: null, gateway };
  });

export const getMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("payments")
      .select("id, transaction_id, amount, currency, payment_method, status, paid_at, created_at, packages(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });