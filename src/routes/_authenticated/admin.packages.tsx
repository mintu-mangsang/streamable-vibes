import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice, packagesQuery } from "@/lib/catalog";
import { deletePackage, savePackage } from "@/lib/admin-data.functions";

export const Route = createFileRoute("/_authenticated/admin/packages")({
  head: () => ({
    meta: [
      { title: "Package management — StreamVerse admin" },
      { name: "description", content: "Create and price subscription packages and their feature lists." },
      { property: "og:title", content: "Package management — StreamVerse admin" },
      { property: "og:description", content: "Create and price subscription packages and their feature lists." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPackages,
});

type Draft = {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  featuresText: string;
  status: "active" | "inactive";
  sort_order: number;
};

const EMPTY: Draft = {
  name: "", description: "", price: 0, currency: "USD", duration_days: 30,
  featuresText: "", status: "active", sort_order: 0,
};

function AdminPackages() {
  const packages = useQuery(packagesQuery);
  const save = useServerFn(savePackage);
  const remove = useServerFn(deletePackage);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const { featuresText, ...rest } = draft;
    try {
      await save({
        data: { ...rest, features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean) },
      });
      await queryClient.invalidateQueries({ queryKey: ["packages"] });
      setDraft(null);
      toast.success("Package saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    }
  };

  return (
    <AdminPage title="Packages" subtitle="Pricing and feature lists for subscriptions.">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setDraft({ ...EMPTY })}>Add package</Button>
      </div>
      {draft && (
        <form onSubmit={submit} className="surface-card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" maxLength={80} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" maxLength={3} value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="days">Duration (days)</Label>
            <Input id="days" type="number" value={draft.duration_days} onChange={(e) => setDraft({ ...draft, duration_days: Number(e.target.value) })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" maxLength={500} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <textarea
              id="features"
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-sm"
              value={draft.featuresText}
              onChange={(e) => setDraft({ ...draft, featuresText: e.target.value })}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </form>
      )}
      <div className="surface-card overflow-x-auto p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(packages.data ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{formatPrice(p.price, p.currency)}</TableCell>
                <TableCell>{p.duration_days} days</TableCell>
                <TableCell><Badge>{p.status}</Badge></TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setDraft({
                        id: p.id,
                        name: p.name,
                        description: p.description ?? "",
                        price: p.price,
                        currency: p.currency,
                        duration_days: p.duration_days,
                        featuresText: p.features.join("\n"),
                        status: p.status as Draft["status"],
                        sort_order: p.sort_order,
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await remove({ data: { id: p.id } });
                        await queryClient.invalidateQueries({ queryKey: ["packages"] });
                        toast.success("Package deleted");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Could not delete");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminPage>
  );
}
