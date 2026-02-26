import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export interface PipelineDeal {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  stage: string;
  asking_price: number;
  offer_amount: number | null;
  arv: number;
  equity_percentage: number;
  lead_score: number;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_type: string;
  source: string;
  days_in_stage: number;
  created_at: string;
  last_activity: string;
  notes: string | null;
  property_type: string;
  beds: number;
  baths: number;
  sqft: number;
}

export function usePipelineDeals() {
  return useQuery({
    queryKey: ["pipeline-deals"],
    queryFn: async (): Promise<PipelineDeal[]> => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map properties to PipelineDeal format
      return (data || []).map((property) => {
        // Use estimated_value or avm_value as asking price equivalent
        const askingPrice = property.estimated_value || property.avm_value || property.mao_standard || 0;
        const arv = property.arv || (askingPrice ? askingPrice * 1.2 : 0);
        const offerAmount = property.mao_standard || null;
        
        // Calculate equity percentage
        const repairEstimate = property.repair_estimate || 0;
        const equityAmount = arv - askingPrice - repairEstimate;
        const equityPercentage = arv > 0 
          ? Math.round((equityAmount / arv) * 100) 
          : (property.equity_percent || 0);

        // Calculate days in stage based on updated_at
        // Add variety based on property ID for demo purposes
        const baseCalculatedDays = differenceInDays(
          new Date(),
          new Date(property.updated_at || property.created_at || new Date())
        );
        // Create variety: hash the ID to get a pseudo-random offset (0-7 days)
        const idHash = property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const daysInStage = baseCalculatedDays > 0 ? baseCalculatedDays : (idHash % 8);

        return {
          id: property.id,
          address: property.address || "Unknown Address",
          city: property.city || "",
          state: property.state || "",
          zip: property.zip || "",
          stage: property.status || "new",
          asking_price: Number(askingPrice) || 0,
          offer_amount: offerAmount ? Number(offerAmount) : null,
          arv: Number(arv) || 0,
          equity_percentage: equityPercentage,
          lead_score: property.motivation_score || property.velocity_score || 50,
          contact_name: property.owner_name || "Unknown",
          contact_phone: property.owner_phone || null,
          contact_email: property.owner_email || null,
          contact_type: "Seller",
          source: property.source || "Unknown",
          days_in_stage: Math.max(0, daysInStage),
          created_at: property.created_at || new Date().toISOString(),
          last_activity: property.updated_at || property.created_at || new Date().toISOString(),
          notes: property.notes || null,
          // Add variety to property types for demo
          property_type: property.property_type || (() => {
            const types = ["single_family", "duplex", "triplex", "quadplex", "condo", "townhouse", "mobile", "land"];
            return types[idHash % types.length];
          })(),
          beds: property.beds || 0,
          baths: Number(property.baths) || 0,
          sqft: property.sqft || 0,
        };
      });
    },
    refetchInterval: 30000,
  });
}

export function useUpdatePipelineDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { error } = await supabase
        .from("properties")
        .update({ 
          status: stage, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-deals"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-value-stats"] });

      if (variables.stage === "closed" || variables.stage === "sold") {
        confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 }, colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff", "#f59e0b"], zIndex: 9999 });
        setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 }, colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff", "#f59e0b"], zIndex: 9999 }), 200);
        setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { x: 0.5, y: 0.5 }, colors: ["#10b981", "#34d399", "#6ee7b7", "#ffffff", "#f59e0b"], startVelocity: 45, zIndex: 9999 }), 400);
        toast.success("🎉 Deal Closed!", { description: "Congratulations! This deal has been marked as closed.", duration: 5000 });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update deal: " + error.message);
    },
  });
}

export function useCreatePipelineDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deal: {
      address: string;
      city: string;
      state: string;
      zip: string;
      status: string;
      estimated_value: number;
      arv: number;
      owner_name: string;
      beds: number;
      baths: number;
      sqft: number;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Get user's organization
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .single();

      const { data, error } = await supabase
        .from("properties")
        .insert({
          ...deal,
          user_id: userData.user.id,
          organization_id: membership?.organization_id || null,
          source: "Manual Entry",
          property_type: "Single Family",
          motivation_score: 75,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-deals"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-stats"] });
      toast.success("Deal added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create deal: " + error.message);
    },
  });
}
