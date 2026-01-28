import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Eye,
  Trash2,
  Star,
  FileText,
} from "lucide-react";

interface Script {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  opening: string | null;
  is_default: boolean | null;
  is_system: boolean | null;
  use_count: number | null;
  success_rate: number | null;
  created_at: string;
}

type CategoryFilter = "all" | "cold_call" | "follow_up" | "appointment" | "custom";

export default function DialerScripts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>("all");

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ["call-scripts", organizationId, categoryFilter],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from("call_scripts")
        .select("*")
        .or(`organization_id.eq.${organizationId},is_system.eq.true`)
        .eq("is_active", true)
        .order("is_default", { ascending: false })
        .order("name");

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Script[];
    },
    enabled: !!organizationId,
  });

  const duplicateScript = useMutation({
    mutationFn: async (script: Script) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error("Not authenticated");

      const { id, created_at, ...rest } = script;
      const { error } = await supabase.from("call_scripts").insert({
        ...rest,
        name: `${script.name} (Copy)`,
        user_id: user.user.id,
        organization_id: organizationId,
        is_default: false,
        is_system: false,
        use_count: 0,
        success_rate: null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-scripts"] });
      toast.success("Script duplicated");
    },
  });

  const deleteScript = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("call_scripts")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-scripts"] });
      toast.success("Script deleted");
    },
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      // First remove default from all others
      await supabase
        .from("call_scripts")
        .update({ is_default: false })
        .eq("organization_id", organizationId);
      // Then set new default
      const { error } = await supabase
        .from("call_scripts")
        .update({ is_default: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-scripts"] });
      toast.success("Default script updated");
    },
  });

  const getCategoryLabel = (category: string | null) => {
    switch (category) {
      case "cold_call":
        return "Cold Call";
      case "follow_up":
        return "Follow-up";
      case "appointment":
        return "Appointment";
      case "custom":
        return "Custom";
      default:
        return "General";
    }
  };

  const getPreviewText = (text: string | null, maxLength: number = 80) => {
    if (!text) return "";
    const clean = text.replace(/\n/g, " ").trim();
    return clean.length > maxLength ? clean.slice(0, maxLength) + "..." : clean;
  };

  const categoryFilters: { value: CategoryFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "cold_call", label: "Cold Call" },
    { value: "follow_up", label: "Follow-up" },
    { value: "appointment", label: "Appointment" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <AppLayout>
      <PageLayout
        title="Call Scripts"
        headerActions={
          <Button variant="primary" onClick={() => navigate("/dialer/scripts/new")}>
            <Plus className="h-4 w-4 mr-1" />
            Create Script
          </Button>
        }
      >
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-medium p-1 w-fit mb-6">
          {categoryFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setCategoryFilter(filter.value)}
              className={cn(
                "px-4 py-2 rounded-small text-small font-medium transition-colors",
                categoryFilter === filter.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Scripts Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border-subtle rounded-medium">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-h3 font-semibold text-foreground mb-2">
              No scripts yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first call script to get started
            </p>
            <Button variant="primary" onClick={() => navigate("/dialer/scripts/new")}>
              <Plus className="h-4 w-4 mr-1" />
              Create Script
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scripts.map((script) => (
              <Card
                key={script.id}
                variant="interactive"
                padding="md"
                className="relative"
                onClick={() => navigate(`/dialer/scripts/${script.id}`)}
              >
                {/* Default Badge */}
                {script.is_default && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="warning" size="sm" className="gap-1">
                      <Star className="h-3 w-3" />
                      Default
                    </Badge>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-small bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate pr-16">
                      {script.name}
                    </h3>
                    <Badge variant="secondary" size="sm" className="mt-1">
                      {getCategoryLabel(script.category)}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-small text-muted-foreground mb-3">
                  <span>Used: {script.use_count || 0} times</span>
                  {script.success_rate !== null && (
                    <span>Success: {script.success_rate.toFixed(1)}%</span>
                  )}
                </div>

                {/* Preview */}
                <p className="text-small text-muted-foreground line-clamp-2">
                  "{getPreviewText(script.opening)}"
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dialer/scripts/${script.id}`);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateScript.mutate(script);
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={() => navigate(`/dialer/scripts/${script.id}?preview=true`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      {!script.is_default && (
                        <DropdownMenuItem onClick={() => setDefault.mutate(script.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {!script.is_system && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteScript.mutate(script.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageLayout>
    </AppLayout>
  );
}
