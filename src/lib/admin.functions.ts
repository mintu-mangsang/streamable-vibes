import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: { rpc: Function }; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Admin access required.");
}

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["admin", "user"]), grant: z.boolean() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.grant) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: data.userId, role: data.role },
        { onConflict: "user_id,role" },
      );
    } else {
      await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
    }

    await supabaseAdmin.from("audit_logs").insert({
      user_id: context.userId,
      action: data.grant ? "role.granted" : "role.revoked",
      entity_type: "user",
      entity_id: data.userId,
      metadata: { role: data.role },
    });

    return { ok: true };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ userId: z.string().uuid(), status: z.enum(["active", "disabled"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ status: data.status }).eq("id", data.userId);
    await supabaseAdmin.from("audit_logs").insert({
      user_id: context.userId,
      action: "user.status_changed",
      entity_type: "user",
      entity_id: data.userId,
      metadata: { status: data.status },
    });
    return { ok: true };
  });

export const setSubscriptionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        subscriptionId: z.string().uuid(),
        status: z.enum(["active", "expired", "cancelled", "pending"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("subscriptions").update({ status: data.status }).eq("id", data.subscriptionId);
    await supabaseAdmin.from("audit_logs").insert({
      user_id: context.userId,
      action: "subscription.manual_change",
      entity_type: "subscription",
      entity_id: data.subscriptionId,
      metadata: { status: data.status },
    });
    return { ok: true };
  });

export const grantSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ userId: z.string().uuid(), packageId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pkg } = await supabaseAdmin
      .from("packages")
      .select("duration_days")
      .eq("id", data.packageId)
      .maybeSingle();
    const days = pkg?.duration_days ?? 30;
    await supabaseAdmin.from("subscriptions").insert({
      user_id: data.userId,
      package_id: data.packageId,
      start_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + days * 864e5).toISOString(),
      status: "active",
    });
    await supabaseAdmin.from("audit_logs").insert({
      user_id: context.userId,
      action: "subscription.granted",
      entity_type: "user",
      entity_id: data.userId,
      metadata: { package_id: data.packageId },
    });
    return { ok: true };
  });