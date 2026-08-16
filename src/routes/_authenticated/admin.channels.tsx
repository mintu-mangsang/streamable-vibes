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
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoriesQuery } from "@/lib/catalog";
import { deleteChannel, getAdminChannels, saveChannel } from "@/lib/admin-data.functions";

export const Route = createFileRoute("/_authenticated/admin/channels")({
  head: () => ({
    meta: [
      { title: "Channel management — StreamVerse admin" },
      { name: "description", content: "Add, edit and remove live TV channels, stream URLs and availability." },
      { property: "og:title", content: "Channel management — StreamVerse admin" },
      { property: "og:description", content: "Add, edit and remove live TV channels, stream URLs and availability." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminChannels,
});

type Draft = {
  id?: string;
  name: string;
  slug: string;
  category_id: string | null;
  logo_url: string;
  description: string;
  stream_url: string;
  stream_type: "hls" | "mp4" | "dash" | "embed";
  is_live: boolean;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
};

const EMPTY: Draft = {
  name: "", slug: "", category_id: null, logo_url: "", description: "",
  stream_url: "", stream_type: "hls", is_live: true, is_free: false, is_active: true, sort_order: 0,
};

function AdminChannels() {
  const fetchChannels = useServerFn(getAdminChannels);
  const save = useServerFn(saveChannel);
  const remove = useServerFn(deleteChannel);
  const queryClient = useQueryClient();
  const channels = useQuery({ queryKey: ["admin-channels"], queryFn: () => fetchChannels({}) });
  const categories = useQuery(categoriesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    try {
      await save({ data: { ...draft, logo_url: draft.logo_url || null, description: draft.description || null } });
      await queryClient.invalidateQueries({ queryKey: ["admin-channels"] });
      await queryClient.invalidateQueries({ queryKey: ["channels"] });
      setDraft(null);
      toast.success("Channel saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save channel");
    }
  };

  const onDelete = async (id: string) => {
    try {
      await remove({ data: { id } });
      await queryClient.invalidateQueries({ queryKey: ["admin-channels"] });
      toast.success("Channel deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete");
    }
  };

  return (
    <AdminPage title="Channels" subtitle="Only add streams you are licensed to distribute.">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setDraft({ ...EMPTY })}>Add channel</Button>
      </div>

      {draft && (
        <form onSubmit={submit} className="surface-card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={draft.name} maxLength={120} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={draft.slug} maxLength={120} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={draft.category_id ?? ""}
              onChange={(e) => setDraft({ ...draft, category_id: e.target.value || null })}
            >
              <option value="">Uncategorized</option>
              {(categories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Stream type</Label>
            <select
              id="type"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={draft.stream_type}
              onChange={(e) => setDraft({ ...draft, stream_type: e.target.value as Draft["stream_type"] })}
            >
              {["hls", "mp4", "dash", "embed"].map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="stream">Stream URL</Label>
            <Input id="stream" value={draft.stream_url} maxLength={1000} onChange={(e) => setDraft({ ...draft, stream_url: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input id="logo" value={draft.logo_url} maxLength={500} onChange={(e) => setDraft({ ...draft, logo_url: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={draft.description} maxLength={1000} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            {([["is_live", "Live"], ["is_free", "Free"], ["is_active", "Active"]] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft[key]}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
            <div className="flex items-center gap-2">
              <Label htmlFor="sort" className="text-sm">Sort</Label>
              <Input
                id="sort"
                type="number"
                className="w-24"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save channel</Button>
            <Button type="button" variant="secondary" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="surface-card overflow-x-auto p-2">
        {channels.isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(channels.data ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-xs">{c.slug}</TableCell>
                  <TableCell className="uppercase text-xs">{c.stream_type}</TableCell>
                  <TableCell className="space-x-1">
                    {c.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Hidden</Badge>}
                    {c.is_free && <Badge variant="outline">Free</Badge>}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setDraft({
                          id: c.id,
                          name: c.name,
                          slug: c.slug,
                          category_id: c.category_id,
                          logo_url: c.logo_url ?? "",
                          description: c.description ?? "",
                          stream_url: c.stream_url ?? "",
                          stream_type: c.stream_type as Draft["stream_type"],
                          is_live: c.is_live,
                          is_free: c.is_free,
                          is_active: c.is_active,
                          sort_order: c.sort_order,
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => void onDelete(c.id)}>Delete</Button>
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
