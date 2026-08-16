import { CreditCard, LayoutDashboard, ListTree, Package, Receipt, Tv, Users } from "lucide-react";
import type { NavItem } from "@/components/layout/DashboardLayout";

export const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/channels", label: "Channels", icon: Tv },
  { to: "/admin/categories", label: "Categories", icon: ListTree },
  { to: "/admin/packages", label: "Packages", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/payments", label: "Payments", icon: Receipt },
];