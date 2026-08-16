import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

const eventSchema = z.object({
  event_id: z.string().min(1).max(200),
  type: z.string().min(1).max(80),
  transaction_id: z.string().min(1).max(120),
  status: z.enum(["pending", "processing", "paid", "failed", "cancelled", "refunded"]),
  method: z.string().max(40).optional(),
});

/**
 * Gateway webhook. Signature is verified before anything is trusted, and the
 * subscription is only activated here (server-side), never from the browser.
 */
export const Route = createFileRoute("/api/public/webhooks/payments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYMENT_WEBHOOK_SECRET"];
        if (!secret) return new Response("Webhook not configured", { status: 503 });

        const body = await request.text();
        const signature = request.headers.get("x-payment-signature") ?? "";
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const sig = Buffer.from(signature);
        const exp = Buffer.from(expected);
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const parsed = eventSchema.safeParse(JSON.parse(body));
        if (!parsed.success) return new Response("Invalid payload", { status: 400 });
        const event = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: existing } = await supabaseAdmin
          .from("payment_webhooks")
          .select("id")
          .eq("event_id", event.event_id)
          .maybeSingle();
        if (existing) return Response.json({ ok: true, duplicate: true });

        const { data: hook } = await supabaseAdmin
          .from("payment_webhooks")
          .insert({ gateway: process.env["PAYMENT_GATEWAY"] ?? "manual", event_id: event.event_id, payload: event })
          .select("id")
          .single();

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("id, user_id, package_id, status")
          .eq("transaction_id", event.transaction_id)
          .maybeSingle();

        if (!payment) return new Response("Unknown transaction", { status: 404 });

        await supabaseAdmin
          .from("payments")
          .update({
            status: event.status,
            payment_method: event.method ?? null,
            gateway_response: event,
            paid_at: event.status === "paid" ? new Date().toISOString() : null,
          })
          .eq("id", payment.id);

        if (event.status === "paid" && payment.package_id) {
          const { data: pkg } = await supabaseAdmin
            .from("packages")
            .select("duration_days")
            .eq("id", payment.package_id)
            .maybeSingle();

          const days = pkg?.duration_days ?? 30;
          const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

          await supabaseAdmin.from("subscriptions").insert({
            user_id: payment.user_id,
            package_id: payment.package_id,
            start_date: new Date().toISOString(),
            expiry_date: expiry,
            status: "active",
            payment_id: payment.id,
          });

          await supabaseAdmin.from("audit_logs").insert({
            user_id: payment.user_id,
            action: "subscription.activated",
            entity_type: "payment",
            entity_id: payment.id,
            metadata: { transaction_id: event.transaction_id },
          });
        }

        if (hook) {
          await supabaseAdmin
            .from("payment_webhooks")
            .update({ status: "processed", processed_at: new Date().toISOString() })
            .eq("id", hook.id);
        }

        return Response.json({ ok: true });
      },
    },
  },
});