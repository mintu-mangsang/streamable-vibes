import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Clapperboard, Play, ShieldCheck, Smartphone, Sparkles, Zap } from "lucide-react";
import heroImage from "@/assets/hero-livetv.jpg";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ChannelCard } from "@/components/channels/ChannelCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { categoriesQuery, channelsQuery, formatPrice, packagesQuery, type Channel } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StreamVerse — Watch Live TV Anytime, Anywhere" },
      {
        name: "description",
        content:
          "Stream licensed live TV channels in HD on any device. News, sports, movies, kids and more with flexible subscription packages.",
      },
      { property: "og:title", content: "StreamVerse — Watch Live TV Anytime, Anywhere" },
      {
        property: "og:description",
        content: "Licensed live TV streaming in HD on every device, with flexible packages.",
      },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: Zap, title: "Instant playback", text: "Adaptive HLS streaming starts in seconds on any connection." },
  { icon: Smartphone, title: "Every screen", text: "Phone, tablet, laptop or TV browser — one account, all devices." },
  { icon: ShieldCheck, title: "Licensed only", text: "We distribute channels the platform owner is authorized to carry." },
  { icon: Clapperboard, title: "Curated line-up", text: "News, sports, movies, kids and international channels in one place." },
];

const FAQS = [
  { q: "Do I need a subscription to watch?", a: "Free channels are open to everyone. Premium channels need an active package on your account." },
  { q: "Can I cancel any time?", a: "Yes. Your access stays active until the current period expires and it will not auto-renew." },
  { q: "Which devices are supported?", a: "Any modern browser on desktop, tablet, mobile or smart TV." },
  { q: "How is payment handled?", a: "Payments run through a secure gateway and are verified server-side before access is granted." },
];

function Index() {
  const channels = useQuery(channelsQuery);
  const categories = useQuery(categoriesQuery);
  const packages = useQuery(packagesQuery);

  const categoryName = (id: string | null) =>
    (categories.data ?? []).find((c) => c.id === id)?.name ?? "Other";
  const featured = (channels.data ?? []).slice(0, 4);
  const popular = (channels.data ?? []).slice(4, 8);

  return (
    <PublicLayout>
      <section className="hero-surface relative overflow-hidden border-b border-border/70">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge variant="secondary" className="gap-1.5">
              <Sparkles className="size-3.5" /> Now streaming in HD
            </Badge>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Watch Live TV <span className="text-gradient-brand">Anytime, Anywhere</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Hundreds of hours of live news, sports, movies and entertainment — streamed to every
              screen you own, with one simple subscription.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="gap-2">
                <Link to="/live-tv"><Play className="size-4" /> Start watching</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/pricing">View packages</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Living room with a large TV streaming live content"
              width={1600}
              height={1008}
              className="w-full rounded-3xl border border-border object-cover glow-ring"
            />
          </div>
        </div>
      </section>

      <ChannelStrip
        title="Featured channels"
        subtitle="Hand-picked highlights from our line-up"
        loading={channels.isLoading}
        items={featured}
        categoryName={categoryName}
      />

      <ChannelStrip
        title="Popular right now"
        subtitle="What other viewers are watching today"
        loading={channels.isLoading}
        items={popular}
        categoryName={categoryName}
      />

      <section className="border-y border-border/70 bg-card/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold">Subscription packages</h2>
          <p className="mt-2 text-muted-foreground">Pick a plan, upgrade or cancel whenever you like.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {packages.isLoading &&
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            {(packages.data ?? []).map((pkg, index) => (
              <div key={pkg.id} className={`surface-card flex flex-col p-6 ${index === 1 ? "glow-ring" : ""}`}>
                {index === 1 && <Badge className="mb-3 w-fit">Most popular</Badge>}
                <h3 className="font-display text-xl font-semibold">{pkg.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                <p className="mt-4 font-display text-3xl font-bold">
                  {formatPrice(pkg.price, pkg.currency)}
                  <span className="text-sm font-normal text-muted-foreground"> / {pkg.duration_days} days</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={index === 1 ? "default" : "secondary"} asChild>
                  <Link to="/pricing">Choose {pkg.name}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold">Why choose StreamVerse</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface-card p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 bg-card/30">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-3xl font-bold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQS.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </PublicLayout>
  );
}

function ChannelStrip({
  title,
  subtitle,
  items,
  loading,
  categoryName,
}: {
  title: string;
  subtitle: string;
  items: Channel[];
  loading: boolean;
  categoryName: (id: string | null) => string;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/live-tv">See all channels</Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        {items.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} categoryName={categoryName(channel.category_id)} />
        ))}
      </div>
    </section>
  );
}
