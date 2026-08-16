import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Lock, LogIn } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { LivePlayer } from "@/components/player/LivePlayer";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery, channelBySlugQuery, channelsQuery, favoritesQuery } from "@/lib/catalog";
import { getEntitledStream, getFreeStream, type StreamResult } from "@/lib/streaming.functions";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

export const Route = createFileRoute("/channel/$slug")({
  head: ({ params }) => {
    const title = `Watch ${params.slug.replace(/-/g, " ")} live — StreamVerse`;
    return {
      meta: [
        { title },
        { name: "description", content: `Stream this channel live in HD on StreamVerse across desktop, tablet and mobile.` },
        { property: "og:title", content: title },
        { property: "og:description", content: "Stream this channel live in HD on StreamVerse." },
      ],
    };
  },
  component: ChannelPage,
});

function ChannelPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const channel = useQuery(channelBySlugQuery(slug));
  const categories = useQuery(categoriesQuery);
  const allChannels = useQuery(channelsQuery);
  const { toggleFavorite, pending } = useFavorites();
  const favorites = useQuery(favoritesQuery(user?.id));
  const isFavorite = (favorites.data ?? []).some((f) => f.channel_id === channel.data?.id);

  const freeStream = useServerFn(getFreeStream);
  const entitledStream = useServerFn(getEntitledStream);

  const stream = useQuery({
    queryKey: ["stream", slug, user?.id ?? "anon"],
    enabled: Boolean(channel.data),
    staleTime: 0,
    queryFn: async (): Promise<StreamResult> =>
      user ? entitledStream({ data: { slug } }) : freeStream({ data: { slug } }),
  });

  if (channel.isLoading) {
    return (
      <PublicLayout>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
          <Skeleton className="aspect-video w-full rounded-2xl" />
        </div>
      </PublicLayout>
    );
  }

  if (!channel.data) {
    return (
      <PublicLayout>
        <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-3xl font-bold">Channel not found</h1>
          <p className="mt-2 text-muted-foreground">This channel may have been removed or renamed.</p>
          <Button className="mt-6" asChild><Link to="/live-tv">Browse channels</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const current = channel.data;
  const categoryName =
    (categories.data ?? []).find((c) => c.id === current.category_id)?.name ?? "Other";
  const related = (allChannels.data ?? [])
    .filter((c) => c.category_id === current.category_id && c.id !== current.id)
    .slice(0, 4);

  return (
    <PublicLayout>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-black">
          {stream.isLoading ? (
            <Skeleton className="aspect-video w-full rounded-none" />
          ) : stream.data?.allowed ? (
            <LivePlayer streamUrl={stream.data.streamUrl} streamType={stream.data.streamType} title={current.name} />
          ) : (
            <LockedState reason={stream.data?.reason ?? "subscription_required"} signedIn={Boolean(user)} />
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{current.name}</h1>
              {current.is_live && <Badge variant="destructive">LIVE</Badge>}
              <Badge variant="secondary">{categoryName}</Badge>
              {current.is_free ? <Badge variant="outline">Free</Badge> : <Badge variant="outline">Premium</Badge>}
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {current.description ?? "Live programming, streamed in HD."}
            </p>
          </div>
          {user && (
            <Button
              variant={isFavorite ? "default" : "secondary"}
              disabled={pending}
              onClick={() => toggleFavorite(current.id, isFavorite)}
              className="gap-2"
            >
              <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "In favorites" : "Add to favorites"}
            </Button>
          )}
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-semibold">More in {categoryName}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((c) => (
                <ChannelCard key={c.id} channel={c} categoryName={categoryName} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}

function LockedState({ reason, signedIn }: { reason: string; signedIn: boolean }) {
  const needsAuth = !signedIn || reason === "auth_required";
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-card px-6 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
        {needsAuth ? <LogIn className="size-6" /> : <Lock className="size-6" />}
      </span>
      <div>
        <h2 className="font-display text-xl font-semibold">
          {needsAuth ? "Sign in to watch this channel" : "Subscription required"}
        </h2>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          {needsAuth
            ? "Create a free account or sign in — premium channels also need an active package."
            : "This channel is included in our subscription packages. Choose a plan to unlock instant access."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {needsAuth ? (
          <>
            <Button asChild><Link to="/login">Sign in</Link></Button>
            <Button variant="secondary" asChild><Link to="/register">Create account</Link></Button>
          </>
        ) : (
          <Button asChild><Link to="/pricing">View packages</Link></Button>
        )}
      </div>
    </div>
  );
}