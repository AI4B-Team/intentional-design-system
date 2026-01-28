import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganizationId } from "./useOrganizationId";
import { toast } from "sonner";

export interface MaterialItem {
  id: string;
  user_id: string;
  organization_id: string | null;
  name: string;
  category: string;
  image_url: string;
  image_key: string | null;
  source_url: string | null;
  source_name: string | null;
  brand: string | null;
  product_name: string | null;
  color: string | null;
  price_per_unit: number | null;
  unit: string | null;
  material_description: string;
  is_favorite: boolean;
  use_count: number;
  created_at: string;
}

export interface CreateMaterialInput {
  name: string;
  category: string;
  image_url: string;
  image_key?: string;
  source_url?: string;
  source_name?: string;
  brand?: string;
  product_name?: string;
  color?: string;
  price_per_unit?: number;
  unit?: string;
  material_description: string;
}

export const MATERIAL_CATEGORIES = [
  { id: "flooring", name: "Flooring", icon: "🪵" },
  { id: "backsplash", name: "Backsplash", icon: "🧱" },
  { id: "countertops", name: "Countertops", icon: "🪨" },
  { id: "cabinets", name: "Cabinets", icon: "🚪" },
  { id: "paint", name: "Wall Paint", icon: "🎨" },
  { id: "roofing", name: "Roofing", icon: "🏠" },
  { id: "siding", name: "Siding", icon: "🏘️" },
  { id: "windows", name: "Windows", icon: "🪟" },
  { id: "landscaping", name: "Landscaping", icon: "🌳" },
] as const;

export type MaterialCategory = typeof MATERIAL_CATEGORIES[number]["id"];

export const MATERIAL_SOURCES = [
  { id: "lowes", name: "Lowe's" },
  { id: "home_depot", name: "Home Depot" },
  { id: "floor_decor", name: "Floor & Decor" },
  { id: "custom", name: "Custom/Other" },
] as const;

export const MATERIAL_PLACEHOLDERS: Record<string, string> = {
  flooring: "light oak hardwood with matte finish",
  backsplash: "white subway tile with dark grout",
  countertops: "white marble with gray veining",
  cabinets: "navy blue shaker style cabinets",
  paint: "warm greige, Benjamin Moore Revere Pewter",
  roofing: "charcoal architectural shingles",
  siding: "white horizontal lap siding",
  windows: "black-framed casement windows",
  landscaping: "modern drought-tolerant landscaping with gravel",
};

export function useMaterialLibrary() {
  const { user } = useAuth();
  const organizationId = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  const {
    data: materials = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["material-library", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("material_library")
        .select("*")
        .eq("organization_id", organizationId)
        .order("is_favorite", { ascending: false })
        .order("use_count", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MaterialItem[];
    },
    enabled: !!user && !!organizationId,
  });

  const createMaterial = useMutation({
    mutationFn: async (input: CreateMaterialInput) => {
      if (!user || !organizationId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("material_library")
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          name: input.name,
          category: input.category,
          image_url: input.image_url,
          image_key: input.image_key || null,
          source_url: input.source_url || null,
          source_name: input.source_name || null,
          brand: input.brand || null,
          product_name: input.product_name || null,
          color: input.color || null,
          price_per_unit: input.price_per_unit || null,
          unit: input.unit || null,
          material_description: input.material_description,
          is_favorite: false,
          use_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-library"] });
      toast.success("Material saved to library");
    },
    onError: (error) => {
      toast.error("Failed to save material: " + error.message);
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MaterialItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("material_library")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-library"] });
    },
    onError: (error) => {
      toast.error("Failed to update material: " + error.message);
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("material_library")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-library"] });
      toast.success("Material deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete material: " + error.message);
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { data, error } = await supabase
        .from("material_library")
        .update({ is_favorite: isFavorite })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-library"] });
    },
  });

  const incrementUseCount = useMutation({
    mutationFn: async (id: string) => {
      const material = materials.find((m) => m.id === id);
      if (!material) return;

      const { error } = await supabase
        .from("material_library")
        .update({ use_count: (material.use_count || 0) + 1 })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-library"] });
    },
  });

  return {
    materials,
    isLoading,
    refetch,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    toggleFavorite,
    incrementUseCount,
  };
}
