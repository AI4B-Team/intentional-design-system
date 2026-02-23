import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useSyncContacts() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("bulk_sync_contacts", {
        p_user_id: user.id,
      });

      if (error) throw error;
      return data as { success: boolean; synced: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources"] });
      queryClient.invalidateQueries({ queryKey: ["deal-sources-stats"] });
      const synced = (data as any)?.synced || 0;
      toast.success(`Sync complete — ${synced} contacts synced/updated`);
    },
    onError: (error) => {
      console.error("Error syncing contacts:", error);
      toast.error("Failed to sync contacts");
    },
  });
}
