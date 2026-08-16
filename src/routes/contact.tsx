import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { PageHeader, PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact StreamVerse Support" },
      { name: "description", content: "Get in touch with the StreamVerse team about subscriptions, billing, playback issues or channel requests." },
      { property: "og:title", content: "Contact StreamVerse Support" },
      { property: "og:description", content: "Questions about billing, playback or packages? Talk to our team." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Please add a few more details").max(1000),
});

function ContactPage() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setValues({ name: "", email: "", message: "" });
    toast.success("Thanks! Our support team will reply within one business day.");
  };

  return (
    <PublicLayout>
      <PageHeader title="Contact us" subtitle="We usually reply within a few hours, 7 days a week." />
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: "support@streamverse.example" },
            { icon: Phone, label: "Phone", value: "+1 (555) 013-8890" },
            { icon: MessageSquare, label: "Live chat", value: "Available 24/7 from your dashboard" },
          ].map((item) => (
            <div key={item.label} className="surface-card flex items-start gap-3 p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="surface-card space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={values.name} maxLength={100} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={values.email} maxLength={255} onChange={(e) => setValues({ ...values, email: e.target.value })} />
            {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={6} maxLength={1000} value={values.message} onChange={(e) => setValues({ ...values, message: e.target.value })} />
            {errors["message"] && <p className="text-xs text-destructive">{errors["message"]}</p>}
          </div>
          <Button type="submit" className="w-full">Send message</Button>
        </form>
      </section>
    </PublicLayout>
  );
}