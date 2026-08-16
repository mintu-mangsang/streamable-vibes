import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  status: string;
  sort_order: number;
};

export type Channel = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  stream_type: string;
  is_live: boolean;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
};

export type Package = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  status: string;
  sort_order: number;
};

const CHANNEL_COLUMNS =
  "id, category_id, name, slug, logo_url, description, stream_type, is_live, is_free, is_active, sort_order";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, status, sort_order")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export const channelsQuery = queryOptions({
  queryKey: ["channels"],
  queryFn: async (): Promise<Channel[]> => {
    const { data, error } = await supabase
      .from("channels")
      .select(CHANNEL_COLUMNS)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as Channel[];
  },
});

export const packagesQuery = queryOptions({
  queryKey: ["packages"],
  queryFn: async (): Promise<Package[]> => {
    const { data, error } = await supabase
      .from("packages")
      .select("id, name, description, price, currency, duration_days, features, status, sort_order")
      .eq("status", "active")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((p) => ({
      ...p,
      price: Number(p.price),
      features: Array.isArray(p.features) ? (p.features as string[]) : [],
    })) as Package[];
  },
});

export function channelBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["channel", slug],
    queryFn: async (): Promise<Channel | null> => {
      const { data, error } = await supabase
        .from("channels")
        .select(CHANNEL_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as Channel | null) ?? null;
    },
  });
}

export function activeSubscriptionQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["subscription", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, status, start_date, expiry_date, package_id, packages(name, price, currency, duration_days)")
        .eq("user_id", userId!)
        .order("expiry_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function favoritesQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["favorites", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("id, channel_id, created_at")
        .eq("user_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}