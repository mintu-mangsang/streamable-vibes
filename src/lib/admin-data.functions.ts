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

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nowIso = new Date().toISOString();

    const [users, channels, activeSubs, payments] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("channels").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .gt("expiry_date", nowIso),
      supabaseAdmin.from("payments").select("amount, status, created_at").eq("status", "success"),
    ]);

    const successful = payments.data ?? [];
    const revenue = successful.reduce((sum, p) => sum + Number(p.amount), 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthlyRevenue = successful
      .filter((p) => new Date(p.created_at) >= monthStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const { data: recentPayments } = await supabaseAdmin
      .from("payments")
      .select("id, transaction_id, amount, currency, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8);

    return {
      totalUsers: users.count ?? 0,
      totalChannels: channels.count ?? 0,
      activeSubscriptions: activeSubs.count ?? 0,
      revenue,
      monthlyRevenue,
      recentPayments: recentPayments ?? [],
    };
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, phone, status, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));
    return (profiles ?? []).map((p) => ({ ...p, isAdmin: adminIds.has(p.id) }));
  });

export const listAdminSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, status, start_date, expiry_date, packages(name), profiles(email, full_name)")
      .order("start_date", { ascending: false })
      .limit(200);
    return data ?? [];
  });

export const listAdminPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("payments")
      .select(
        "id, transaction_id, amount, currency, status, payment_method, created_at, paid_at, packages(name), profiles(email)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    return data ?? [];
  });

const channelInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  category_id: z.string().uuid().nullable(),
  logo_url: z.string().trim().url().max(500).nullable().or(z.literal("")),
  description: z.string().trim().max(1000).nullable().or(z.literal("")),
  stream_url: z.string().trim().url().max(1000),
  stream_type: z.enum(["hls", "mp4", "dash", "embed"]),
  is_live: z.boolean(),
  is_free: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export const saveChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => channelInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      name: data.name,
      slug: data.slug,
      category_id: data.category_id,
      logo_url: data.logo_url || null,
      description: data.description || null,
      stream_url: data.stream_url,
      stream_type: data.stream_type,
      is_live: data.is_live,
      is_free: data.is_free,
      is_active: data.is_active,
      sort_order: data.sort_order,
    };
    const { error } = data.id
      ? await supabaseAdmin.from("channels").update(row).eq("id", data.id)
      : await supabaseAdmin.from("channels").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteChannel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("channels").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAdminChannels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("channels")
      .select(
        "id, name, slug, category_id, logo_url, description, stream_url, stream_type, is_live, is_free, is_active, sort_order",
      )
      .order("sort_order");
    return data ?? [];
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(80),
        slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
        status: z.enum(["active", "inactive"]),
        sort_order: z.number().int().min(0).max(9999),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = { name: data.name, slug: data.slug, status: data.status, sort_order: data.sort_order };
    const { error } = data.id
      ? await supabaseAdmin.from("categories").update(row).eq("id", data.id)
      : await supabaseAdmin.from("categories").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const savePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(80),
        description: z.string().trim().max(500),
        price: z.number().min(0).max(100000),
        currency: z.string().trim().length(3),
        duration_days: z.number().int().min(1).max(3650),
        features: z.array(z.string().trim().max(120)).max(20),
        status: z.enum(["active", "inactive"]),
        sort_order: z.number().int().min(0).max(9999),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = {
      name: data.name,
      description: data.description,
      price: data.price,
      currency: data.currency.toUpperCase(),
      duration_days: data.duration_days,
      features: data.features,
      status: data.status,
      sort_order: data.sort_order,
    };
    const { error } = data.id
      ? await supabaseAdmin.from("packages").update(row).eq("id", data.id)
      : await supabaseAdmin.from("packages").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        paymentId: z.string().uuid(),
        status: z.enum(["pending", "success", "failed", "refunded"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("payments")
      .update({ status: data.status, paid_at: data.status === "success" ? new Date().toISOString() : null })
      .eq("id", data.paymentId);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_logs").insert({
      user_id: context.userId,
      action: "payment.status_changed",
      entity_type: "payment",
      entity_id: data.paymentId,
      metadata: { status: data.status },
    });
    return { ok: true };
  });