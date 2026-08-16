import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DASHBOARD_NAV } from "@/components/dashboard/DashboardNav";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/catalog";
import { getMyPayments } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/dashboard/payments")({
  head: () => ({
    meta: [
      { title: "Payment history — StreamVerse" },
      { name: "description", content: "View every StreamVerse transaction with amount, method, status and invoice date." },
      { property: "og:title", content: "Payment history — StreamVerse" },
      { property: "og:description", content: "Every transaction with amount, method and status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const fetchPayments = useServerFn(getMyPayments);
  const payments = useQuery({ queryKey: ["my-payments"], queryFn: () => fetchPayments({}) });

  return (
    <DashboardLayout title="Payments" subtitle="All transactions on your account." items={DASHBOARD_NAV}>
      <div className="surface-card overflow-x-auto p-2">
        {payments.isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (payments.data ?? []).length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments.data ?? []).map((p) => {
                const pkg = p.packages as unknown as { name: string } | null;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.transaction_id}</TableCell>
                    <TableCell>{pkg?.name ?? "—"}</TableCell>
                    <TableCell>{formatPrice(Number(p.amount), p.currency)}</TableCell>
                    <TableCell className="capitalize">{p.payment_method ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "success" ? "default" : p.status === "failed" ? "destructive" : "secondary"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(p.paid_at ?? p.created_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
}