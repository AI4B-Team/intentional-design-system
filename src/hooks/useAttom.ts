import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  getPropertyByAddress, 
  getAVM, 
  testAttomConnection,
  type AttomPropertyData,
  type AVMData 
} from "@/lib/attom";
import { toast } from "sonner";

export function useAttomLookup() {
  return useMutation({
    mutationFn: async ({
      address,
      city,
      state,
      zip,
    }: {
      address: string;
      city: string;
      state: string;
      zip: string;
    }) => {
      const result = await getPropertyByAddress(address, city, state, zip);
      
      if (!result.success) {
        throw new Error(result.error || "Property not found");
      }
      
      return result.data as AttomPropertyData;
    },
    onError: (error: Error) => {
      console.error("ATTOM lookup error:", error);
    },
  });
}

export function useAttomAVM() {
  return useMutation({
    mutationFn: async ({
      address,
      city,
      state,
      zip,
    }: {
      address: string;
      city: string;
      state: string;
      zip: string;
    }) => {
      const result = await getAVM(address, city, state, zip);
      
      if (!result.success) {
        throw new Error(result.error || "AVM not available");
      }
      
      return result.data as AVMData;
    },
    onError: (error: Error) => {
      console.error("ATTOM AVM error:", error);
    },
  });
}

export function useUpdatePropertyWithAttom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      attomData,
    }: {
      propertyId: string;
      attomData: Partial<AttomPropertyData>;
    }) => {
      const { data, error } = await supabase
        .from("properties")
        .update({
          ...attomData,
          last_data_pull: new Date().toISOString(),
        } as any)
        .eq("id", propertyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property", data.id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Property updated with ATTOM data");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update property");
    },
  });
}

export function useUpdatePropertyAVM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      avmData,
    }: {
      propertyId: string;
      avmData: AVMData;
    }) => {
      const { data, error } = await supabase
        .from("properties")
        .update({
          avm_value: avmData.value,
          avm_high: avmData.high,
          avm_low: avmData.low,
          avm_confidence: avmData.confidence,
          last_data_pull: new Date().toISOString(),
        } as any)
        .eq("id", propertyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["property", data.id] });
      toast.success("AVM data updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update AVM");
    },
  });
}

export function useTestAttomConnection() {
  return useMutation({
    mutationFn: async () => {
      const result = await testAttomConnection();
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: () => {
      toast.success("ATTOM connection successful!");
    },
    onError: (error: Error) => {
      toast.error(`Connection failed: ${error.message}`);
    },
  });
}
