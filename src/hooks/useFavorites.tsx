import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ channelId, isFavorite }: { channelId: string; isFavorite: boolean }) => {
      if (!user) throw new Error("Please sign in to save favorites.");
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("channel_id", channelId);
        if (error) throw error;
        return "removed" as const;
      }
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, channel_id: channelId });
      if (error) throw error;
      return "added" as const;
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(result === "added" ? "Added to favorites" : "Removed from favorites");
    },
    onError: (error: Error) => toast.error(error.message || "Could not update favorites"),
  });

  return {
    toggleFavorite: (channelId: string, isFavorite: boolean) =>
      mutation.mutate({ channelId, isFavorite }),
    pending: mutation.isPending,
  };
}