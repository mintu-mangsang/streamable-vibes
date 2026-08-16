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
import { categoriesQuery } from "@/lib/catalog";
import { deleteCategory, saveCategory } from "@/lib/admin-data.functions";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({
    meta: [
      { title: "Category management — StreamVerse admin" },
      { name: "description", content: "Create and organise the channel categories shown across the site." },
      { property: "og:title", content: "Category management — StreamVerse admin" },
      { property: "og:description", content: "Create and organise the channel categories shown across the site." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCategories,
});

type Draft = { id?: string; name: string; slug: string; status: "active" | "inactive"; sort_order: number };
const EMPTY: Draft = { name: "", slug: "", status: "active", sort_order: 0 };

function AdminCategories() {
  const categories = useQuery(categoriesQuery);
  const save = useServerFn(saveCategory);
  const remove = useServerFn(deleteCategory);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    try {
      await save({ data: draft });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDraft(null);
      toast.success("Category saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    }
  };

  return (
    <AdminPage title="Categories" subtitle="Group channels for easier browsing.">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setDraft({ ...EMPTY })}>Add category</Button>
      </div>
      {draft && (
        <form onSubmit={submit} className="surface-card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" maxLength={80} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" maxLength={80} value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort order</Label>
            <Input id="sort" type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as Draft["status"] })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(categories.data ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-xs">{c.slug}</TableCell>
                <TableCell><Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge></TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="secondary" onClick={() => setDraft({ id: c.id, name: c.name, slug: c.slug, status: c.status as Draft["status"], sort_order: c.sort_order })}>Edit</Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await remove({ data: { id: c.id } });
                        await queryClient.invalidateQueries({ queryKey: ["categories"] });
                        toast.success("Category deleted");
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
