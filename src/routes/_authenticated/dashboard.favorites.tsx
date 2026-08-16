import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DASHBOARD_NAV } from "@/components/dashboard/DashboardNav";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery, channelsQuery, favoritesQuery } from "@/lib/catalog";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/favorites")({
  head: () => ({
    meta: [
      { title: "Your favorite channels — StreamVerse" },
      { name: "description", content: "Quick access to the live TV channels you saved as favorites." },
      { property: "og:title", content: "Your favorite channels — StreamVerse" },
      { property: "og:description", content: "Quick access to your saved channels." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const favorites = useQuery(favoritesQuery(user?.id));
  const channels = useQuery(channelsQuery);
  const categories = useQuery(categoriesQuery);

  const ids = new Set((favorites.data ?? []).map((f) => f.channel_id));
  const saved = (channels.data ?? []).filter((c) => ids.has(c.id));
  const categoryName = (id: string | null) =>
    (categories.data ?? []).find((c) => c.id === id)?.name ?? "Other";

  return (
    <DashboardLayout title="Favorites" subtitle="Channels you saved for quick access." items={DASHBOARD_NAV}>
      {favorites.isLoading || channels.isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : saved.length === 0 ? (
        <div className="surface-card p-8 text-center">
          <p className="text-muted-foreground">No favorites yet. Tap the heart on any channel to save it.</p>
          <Button className="mt-4" asChild><Link to="/live-tv">Browse channels</Link></Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((c) => (
            <ChannelCard key={c.id} channel={c} categoryName={categoryName(c.category_id)} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}