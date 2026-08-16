import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPrice } from "@/lib/catalog";
import { listAdminPayments, setPaymentStatus } from "@/lib/admin-data.functions";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payment management — StreamVerse admin" },
      { name: "description", content: "Review transactions, verify payments and mark refunds." },
      { property: "og:title", content: "Payment management — StreamVerse admin" },
      { property: "og:description", content: "Review transactions, verify payments and mark refunds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPayments,
});

function AdminPayments() {
  const fetchPayments = useServerFn(listAdminPayments);
  const statusFn = useServerFn(setPaymentStatus);
  const queryClient = useQueryClient();
  const payments = useQuery({ queryKey: ["admin-payments"], queryFn: () => fetchPayments({}) });

  const update = async (id: string, status: "success" | "failed" | "refunded") => {
    try {
      await statusFn({ data: { paymentId: id, status } });
      await queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success("Payment updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  return (
    <AdminPage title="Payments" subtitle="Transactions across the platform.">
      <div className="surface-card overflow-x-auto p-2">
        {payments.isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(payments.data ?? []).map((p) => {
                const profile = p.profiles as unknown as { email: string | null } | null;
                const pkg = p.packages as unknown as { name: string } | null;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.transaction_id}</TableCell>
                    <TableCell className="text-xs">{profile?.email ?? "—"}</TableCell>
                    <TableCell>{pkg?.name ?? "—"}</TableCell>
                    <TableCell>{formatPrice(Number(p.amount), p.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "success" ? "default" : p.status === "failed" ? "destructive" : "secondary"}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(p.created_at)}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button size="sm" variant="secondary" onClick={() => void update(p.id, "refunded")}>Refund</Button>
                      <Button size="sm" variant="destructive" onClick={() => void update(p.id, "failed")}>Mark failed</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminPage>
  );
}
