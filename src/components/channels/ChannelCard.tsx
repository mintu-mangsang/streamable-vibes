import { Link } from "@tanstack/react-router";
import { Heart, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Channel } from "@/lib/catalog";

export function ChannelLogo({ channel, className }: { channel: Channel; className?: string }) {
  if (channel.logo_url) {
    return (
      <img
        src={channel.logo_url}
        alt={`${channel.name} logo`}
        loading="lazy"
        className={cn("size-12 rounded-xl object-cover", className)}
      />
    );
  }
  const initials = channel.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-xl bg-secondary font-display text-base font-bold text-primary",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function LiveBadge() {
  return (
    <Badge className="gap-1.5 border-0 bg-live text-live-foreground">
      <span className="size-1.5 animate-pulse rounded-full bg-live-foreground" />
      LIVE
    </Badge>
  );
}

type Props = {
  channel: Channel;
  categoryName?: string | undefined;
  isFavorite?: boolean | undefined;
  onToggleFavorite?: ((channel: Channel) => void) | undefined;
};

export function ChannelCard({ channel, categoryName, isFavorite, onToggleFavorite }: Props) {
  return (
    <article className="surface-card group flex flex-col gap-4 p-5 transition-transform duration-200 hover:-translate-y-1 hover:glow-ring">
      <div className="flex items-start gap-3">
        <ChannelLogo channel={channel} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold">{channel.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{categoryName ?? "Other"}</p>
        </div>
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onToggleFavorite(channel)}
          >
            <Heart className={cn("size-4", isFavorite && "fill-live text-live")} />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {channel.is_live && <LiveBadge />}
        <Badge variant={channel.is_free ? "secondary" : "outline"} className="gap-1">
          {channel.is_free ? "Free" : <><Lock className="size-3" /> Premium</>}
        </Badge>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{channel.description}</p>

      <Button asChild className="mt-auto w-full gap-2">
        <Link to="/channel/$slug" params={{ slug: channel.slug }}>
          <Play className="size-4" /> Watch now
        </Link>
      </Button>
    </article>
  );
}