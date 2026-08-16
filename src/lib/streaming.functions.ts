import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugInput = (data: unknown) => z.object({ slug: z.string().trim().min(1).max(120) }).parse(data);

export type StreamResult =
  | { allowed: true; streamUrl: string; streamType: string }
  | { allowed: false; reason: "not_found" | "subscription_required" | "auth_required" };

/** Public: only ever returns a stream link for channels marked as free. */
export const getFreeStream = createServerFn({ method: "POST" })
  .inputValidator(slugInput)
  .handler(async ({ data }): Promise<StreamResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: channel } = await supabaseAdmin
      .from("channels")
      .select("id, stream_url, stream_type, is_free, is_active")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!channel || !channel.is_active) return { allowed: false, reason: "not_found" };
    if (!channel.is_free) return { allowed: false, reason: "auth_required" };
    return {
      allowed: true,
      streamUrl: channel.stream_url ?? "",
      streamType: channel.stream_type,
    };
  });

/** Signed-in: verifies entitlement server-side before releasing the stream link. */
export const getEntitledStream = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(slugInput)
  .handler(async ({ data, context }): Promise<StreamResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: channel } = await supabaseAdmin
      .from("channels")
      .select("id, stream_url, stream_type, is_active")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!channel || !channel.is_active) return { allowed: false, reason: "not_found" };

    const { data: canWatch } = await supabaseAdmin.rpc("can_watch_channel", {
      _user_id: context.userId,
      _channel_id: channel.id,
    });

    if (!canWatch) return { allowed: false, reason: "subscription_required" };

    await supabaseAdmin.from("watch_history").insert({
      user_id: context.userId,
      channel_id: channel.id,
    });

    return {
      allowed: true,
      streamUrl: channel.stream_url ?? "",
      streamType: channel.stream_type,
    };
  });