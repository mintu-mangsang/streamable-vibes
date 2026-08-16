import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Tv } from "lucide-react";
import { PageHeader, PublicLayout } from "@/components/layout/PublicLayout";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery, channelsQuery, favoritesQuery } from "@/lib/catalog";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

export const Route = createFileRoute("/live-tv")({
  head: () => ({
    meta: [
      { title: "Live TV Channels — StreamVerse" },
      { name: "description", content: "Browse licensed live TV channels by category: news, sports, entertainment, movies, kids and more." },
      { property: "og:title", content: "Live TV Channels — StreamVerse" },
      { property: "og:description", content: "Browse licensed live TV channels by category and start watching instantly." },
    ],
  }),
  component: LiveTvPage,
});

function LiveTvPage() {
  const { user } = useAuth();
  const channels = useQuery(channelsQuery);
  const categories = useQuery(categoriesQuery);
  const favorites = useQuery(favoritesQuery(user?.id));
  const { toggleFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const favoriteIds = useMemo(
    () => new Set((favorites.data ?? []).map((f) => f.channel_id)),
    [favorites.data],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (channels.data ?? []).filter((c) => {
      const matchesCategory = category === "all" || c.category_id === category;
      const matchesTerm = !term || c.name.toLowerCase().includes(term) || (c.description ?? "").toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  }, [channels.data, search, category]);

  const categoryName = (id: string | null) =>
    (categories.data ?? []).find((c) => c.id === id)?.name ?? "Other";

  return (
    <PublicLayout>
      <PageHeader
        title="Live TV"
        subtitle="Every channel below is streamed from sources the platform owner is licensed to distribute."
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value.slice(0, 80))}
              placeholder="Search channels"
              className="pl-9"
              aria-label="Search channels"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setCategory("all")}
            >
              All
            </Button>
            {(categories.data ?? []).map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "secondary"}
                size="sm"
                onClick={() => setCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {channels.isLoading &&
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}

          {!channels.isLoading &&
            filtered.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                categoryName={categoryName(channel.category_id)}
                isFavorite={favoriteIds.has(channel.id)}
                onToggleFavorite={user ? (c) => toggleFavorite(c.id, favoriteIds.has(c.id)) : undefined}
              />
            ))}
        </div>

        {!channels.isLoading && filtered.length === 0 && (
          <div className="surface-card mt-8 grid place-items-center gap-3 p-14 text-center">
            <Tv className="size-10 text-muted-foreground" />
            <p className="font-medium">No channels match your search</p>
            <p className="text-sm text-muted-foreground">Try a different keyword or category.</p>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}