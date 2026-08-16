import { CreditCard, Heart, History, LayoutDashboard, Receipt, User } from "lucide-react";
import type { NavItem } from "@/components/layout/DashboardLayout";

export const DASHBOARD_NAV: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { to: "/dashboard/payments", label: "Payments", icon: Receipt },
  { to: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { to: "/dashboard/history", label: "Watch history", icon: History },
  { to: "/dashboard/profile", label: "Profile", icon: User },
];