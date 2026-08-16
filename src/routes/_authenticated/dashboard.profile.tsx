import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DASHBOARD_NAV } from "@/components/dashboard/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "Profile settings — StreamVerse" },
      { name: "description", content: "Update your name, phone number and password for your StreamVerse account." },
      { property: "og:title", content: "Profile settings — StreamVerse" },
      { property: "og:description", content: "Update your account details and password." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z.string().trim().max(30),
});

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse({ fullName, phone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.fullName, phone: parsed.data.phone || null })
      .eq("id", user!.id);
    setBusy(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    await refreshProfile();
    toast.success("Profile updated.");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().min(8, "Use at least 8 characters").max(128).safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    toast.success("Password changed.");
  };

  return (
    <DashboardLayout title="Profile" subtitle="Manage your personal details and password." items={DASHBOARD_NAV}>
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="surface-card space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">Personal details</h2>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile?.email ?? user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        </form>

        <form onSubmit={changePassword} className="surface-card h-fit space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">Change password</h2>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary">Update password</Button>
        </form>
      </div>
    </DashboardLayout>
  );
}