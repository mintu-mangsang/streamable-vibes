import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WatchHistoryRow = {
  id: string;
  channel_id: string;
  watched_at: string;
  channels: { name: string; slug: string; logo_url: string | null } | null;
};

export function watchHistoryQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["watch-history", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<WatchHistoryRow[]> => {
      const { data, error } = await supabase
        .from("watch_history")
        .select("id, channel_id, watched_at, channels(name, slug, logo_url)")
        .eq("user_id", userId!)
        .order("watched_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as WatchHistoryRow[];
    },
  });
}

export function mySubscriptionsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-subscriptions", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, status, start_date, expiry_date, package_id, packages(name, price, currency, duration_days)")
        .eq("user_id", userId!)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}