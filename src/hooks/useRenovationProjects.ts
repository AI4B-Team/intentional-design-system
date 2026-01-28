import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganizationId } from "./useOrganizationId";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface RenovationProject {
  id: string;
  user_id: string;
  organization_id: string | null;
  property_id: string | null;
  name: string;
  description: string | null;
  status: "active" | "completed" | "archived";
  cover_image_url: string | null;
  total_images: number;
  created_at: string;
  updated_at: string;
  property?: {
    address: string;
  } | null;
}

export interface RenovationImage {
  id: string;
  project_id: string;
  user_id: string;
  organization_id: string | null;
  original_image_url: string;
  original_image_key: string | null;
  room_type: string | null;
  area_label: string | null;
  generated_images: GeneratedImage[];
  selected_after_url: string | null;
  selected_after_id: string | null;
  width: number | null;
  height: number | null;
  total_credits_used: number;
  created_at: string;
  updated_at: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  type: "staging" | "material_swap";
  style?: string;
  prompt?: string;
  created_at: string;
}

export interface CreateProjectInput {
  name: string;
  property_id?: string | null;
  description?: string | null;
}

export function useRenovationProjects() {
  const { user } = useAuth();
  const organizationId = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ["renovation-projects", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("renovation_projects")
        .select(`
          *,
          property:properties(address)
        `)
        .eq("organization_id", organizationId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as RenovationProject[];
    },
    enabled: !!user && !!organizationId,
  });

  const { data: stats } = useQuery({
    queryKey: ["renovation-stats", organizationId],
    queryFn: async () => {
      if (!organizationId) return { totalProjects: 0, totalImages: 0, thisMonth: 0 };

      const { data: projectsData, error: projectsError } = await supabase
        .from("renovation_projects")
        .select("id, total_images")
        .eq("organization_id", organizationId);

      if (projectsError) throw projectsError;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonth, error: imagesError } = await supabase
        .from("renovation_images")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .gte("created_at", startOfMonth.toISOString());

      if (imagesError) throw imagesError;

      const totalImages = projectsData?.reduce((sum, p) => sum + (p.total_images || 0), 0) || 0;

      return {
        totalProjects: projectsData?.length || 0,
        totalImages,
        thisMonth: thisMonth || 0,
      };
    },
    enabled: !!user && !!organizationId,
  });

  const createProject = useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      if (!user || !organizationId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("renovation_projects")
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          name: input.name,
          property_id: input.property_id || null,
          description: input.description || null,
          status: "active",
          total_images: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovation-projects"] });
      queryClient.invalidateQueries({ queryKey: ["renovation-stats"] });
      toast.success("Project created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create project: " + error.message);
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RenovationProject> & { id: string }) => {
      const { data, error } = await supabase
        .from("renovation_projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovation-projects"] });
      toast.success("Project updated");
    },
    onError: (error) => {
      toast.error("Failed to update project: " + error.message);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("renovation_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovation-projects"] });
      queryClient.invalidateQueries({ queryKey: ["renovation-stats"] });
      toast.success("Project deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete project: " + error.message);
    },
  });

  return {
    projects,
    stats,
    isLoading,
    refetch,
    createProject,
    updateProject,
    deleteProject,
  };
}

export function useRenovationProject(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["renovation-project", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from("renovation_projects")
        .select(`
          *,
          property:properties(id, address)
        `)
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return data as RenovationProject;
    },
    enabled: !!user && !!projectId,
  });

  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ["renovation-images", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from("renovation_images")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map((item) => ({
        ...item,
        generated_images: (item.generated_images as unknown as GeneratedImage[]) || [],
      })) as RenovationImage[];
    },
    enabled: !!user && !!projectId,
  });

  const addImages = useMutation({
    mutationFn: async (
      imageData: Array<{
        original_image_url: string;
        original_image_key: string;
        room_type: string;
        area_label?: string;
      }>
    ) => {
      if (!user || !projectId) throw new Error("Not authenticated");

      const { data: projectData } = await supabase
        .from("renovation_projects")
        .select("organization_id")
        .eq("id", projectId)
        .single();

      const inserts = imageData.map((img) => ({
        project_id: projectId,
        user_id: user.id,
        organization_id: projectData?.organization_id || null,
        original_image_url: img.original_image_url,
        original_image_key: img.original_image_key,
        room_type: img.room_type,
        area_label: img.area_label || null,
        generated_images: [],
        total_credits_used: 0,
      }));

      const { data, error } = await supabase
        .from("renovation_images")
        .insert(inserts)
        .select();

      if (error) throw error;

      // Update project image count
      await supabase
        .from("renovation_projects")
        .update({
          total_images: (project?.total_images || 0) + imageData.length,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovation-images", projectId] });
      queryClient.invalidateQueries({ queryKey: ["renovation-project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["renovation-stats"] });
      toast.success("Photos uploaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to upload photos: " + error.message);
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from("renovation_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      // Update project image count
      if (project) {
        await supabase
          .from("renovation_projects")
          .update({
            total_images: Math.max(0, (project.total_images || 0) - 1),
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovation-images", projectId] });
      queryClient.invalidateQueries({ queryKey: ["renovation-project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["renovation-stats"] });
      toast.success("Image deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete image: " + error.message);
    },
  });

  const updateImage = useMutation({
    mutationFn: async ({ id, generated_images, ...updates }: Partial<RenovationImage> & { id: string }) => {
      const updatePayload: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      // Convert generated_images to Json type if present
      if (generated_images) {
        updatePayload.generated_images = generated_images as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from("renovation_images")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renovation-images", projectId] });
    },
    onError: (error) => {
      toast.error("Failed to update image: " + error.message);
    },
  });

  return {
    project,
    images,
    isLoading: projectLoading || imagesLoading,
    addImages,
    deleteImage,
    updateImage,
  };
}
