import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Cancels the caller's own subscription; access stays until the expiry date. */
export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ subscriptionId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", data.subscriptionId)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not cancel the subscription.");
    return { ok: true };
  });