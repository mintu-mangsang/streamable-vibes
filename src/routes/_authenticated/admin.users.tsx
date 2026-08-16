import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/catalog";
import { listAdminUsers } from "@/lib/admin-data.functions";
import { setUserRole, setUserStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "User management — StreamVerse admin" },
      { name: "description", content: "Search users, change account status and manage administrator roles." },
      { property: "og:title", content: "User management — StreamVerse admin" },
      { property: "og:description", content: "Search users, change account status and manage administrator roles." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const fetchUsers = useServerFn(listAdminUsers);
  const roleFn = useServerFn(setUserRole);
  const statusFn = useServerFn(setUserStatus);
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => fetchUsers({}) });

  const run = async (fn: () => Promise<unknown>, message: string) => {
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
  };

  return (
    <AdminPage title="Users" subtitle="Manage accounts and permissions.">
      <div className="surface-card overflow-x-auto p-2">
        {users.isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users.data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.full_name ?? "—"}</TableCell>
                  <TableCell className="text-xs">{u.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                  </TableCell>
                  <TableCell>{u.isAdmin ? <Badge>Admin</Badge> : <Badge variant="secondary">User</Badge>}</TableCell>
                  <TableCell className="text-xs">{formatDate(u.created_at)}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        void run(
                          () => roleFn({ data: { userId: u.id, role: "admin", grant: !u.isAdmin } }),
                          u.isAdmin ? "Admin role revoked" : "Admin role granted",
                        )
                      }
                    >
                      {u.isAdmin ? "Revoke admin" : "Make admin"}
                    </Button>
                    <Button
                      size="sm"
                      variant={u.status === "active" ? "destructive" : "default"}
                      onClick={() =>
                        void run(
                          () =>
                            statusFn({
                              data: { userId: u.id, status: u.status === "active" ? "disabled" : "active" },
                            }),
                          "Account status updated",
                        )
                      }
                    >
                      {u.status === "active" ? "Disable" : "Enable"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </AdminPage>
  );
}
