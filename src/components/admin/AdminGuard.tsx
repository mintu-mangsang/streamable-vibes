import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ADMIN_NAV } from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export function AdminPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { isAdmin, loading } = useAuth();

  return (
    <DashboardLayout title={title} {...(subtitle ? { subtitle } : {})} items={ADMIN_NAV}>
      {loading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : isAdmin ? (
        children
      ) : (
        <div className="surface-card flex flex-col items-center gap-3 p-10 text-center">
          <ShieldAlert className="size-8 text-destructive" />
          <h2 className="font-display text-lg font-semibold">Admin access required</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your account doesn't have administrator permissions for this area.
          </p>
          <Button asChild className="mt-2"><Link to="/dashboard">Back to dashboard</Link></Button>
        </div>
      )}
    </DashboardLayout>
  );
}