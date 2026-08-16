import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About StreamVerse — Licensed Live TV Streaming" },
      { name: "description", content: "Learn how StreamVerse delivers licensed live television to viewers on every device, with a focus on quality and legality." },
      { property: "og:title", content: "About StreamVerse — Licensed Live TV Streaming" },
      { property: "og:description", content: "How we deliver licensed live television to every screen." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <PageHeader title="About us" subtitle="Live television, rebuilt for the way people watch today." />
      <section className="mx-auto w-full max-w-3xl space-y-6 px-4 py-14 text-muted-foreground sm:px-6">
        <p>
          StreamVerse is a live television platform built for viewers who want their channels to follow
          them across devices. We combine a curated channel line-up with a fast, adaptive player and a
          subscription model that stays simple and transparent.
        </p>
        <h2 className="font-display text-2xl font-semibold text-foreground">Our commitment to licensing</h2>
        <p>
          Every channel available here is configured by the platform owner from sources they are legally
          authorized to distribute. We do not host, index or provide unauthorized broadcasts, and any
          channel found to be misconfigured is removed immediately.
        </p>
        <h2 className="font-display text-2xl font-semibold text-foreground">Built on solid foundations</h2>
        <p>
          Accounts, subscriptions and payments are protected by row-level security and server-side
          verification. Nobody — including us — can activate a subscription without a verified payment
          confirmation from the gateway.
        </p>
      </section>
    </PublicLayout>
  );
}