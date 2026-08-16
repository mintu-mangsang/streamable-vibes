import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PublicLayout } from "@/components/layout/PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  { q: "How do I start watching?", a: "Create a free account, pick a package on the Packages page, and complete payment. Free channels can be watched without any subscription." },
  { q: "What happens when my subscription expires?", a: "Premium channels lock automatically the moment your expiry date passes. Free channels remain available." },
  { q: "Can I watch on more than one device?", a: "Yes. Device limits depend on the package you choose and are listed on each plan." },
  { q: "Which video formats are supported?", a: "The player supports HLS (.m3u8) and other browser-compatible live formats configured by the platform owner." },
  { q: "How do refunds work?", a: "Contact support with your transaction ID. Refunded payments are marked in your payment history and access is adjusted accordingly." },
  { q: "Are the channels legal?", a: "Only streams the platform owner is licensed to distribute can be configured. We never carry unauthorized broadcasts." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "StreamVerse FAQ — Subscriptions, Playback & Billing" },
      { name: "description", content: "Answers about StreamVerse subscriptions, supported devices, payment handling, refunds and channel licensing." },
      { property: "og:title", content: "StreamVerse FAQ" },
      { property: "og:description", content: "Answers about subscriptions, devices, payments and licensing." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <PublicLayout>
      <PageHeader title="Frequently asked questions" subtitle="Everything you need to know before you subscribe." />
      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
        <Accordion type="single" collapsible>
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicLayout>
  );
}