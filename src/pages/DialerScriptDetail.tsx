import * as React from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScriptEditor } from "@/components/dialer/script-editor";
import { MergeFieldsSidebar } from "@/components/dialer/merge-fields-sidebar";
import { ScriptPreviewModal } from "@/components/dialer/script-preview-modal";
import {
  ArrowLeft,
  Eye,
  Save,
  TrendingUp,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";

interface ScriptData {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  opening: string | null;
  body: string | null;
  closing: string | null;
  objection_handlers: Array<{ objection: string; response: string }> | any;
  is_default: boolean | null;
  is_system: boolean | null;
  use_count: number | null;
  success_rate: number | null;
}

const CATEGORIES = [
  { value: "cold_call", label: "Cold Call" },
  { value: "follow_up", label: "Follow-up" },
  { value: "appointment", label: "Appointment Confirm" },
  { value: "custom", label: "Custom" },
];

export default function DialerScriptDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();

  const isNew = id === "new";
  const showPreviewOnLoad = searchParams.get("preview") === "true";

  const [showPreview, setShowPreview] = React.useState(showPreviewOnLoad);
  const [formData, setFormData] = React.useState({
    name: "",
    category: "cold_call",
    description: "",
    opening: "",
    body: "",
    closing: "",
    objectionHandlers: [] as Array<{ objection: string; response: string }>,
    isDefault: false,
  });

  const { data: script, isLoading } = useQuery({
    queryKey: ["call-script", id],
    queryFn: async () => {
      if (isNew || !id) return null;
      const { data, error } = await supabase
        .from("call_scripts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as ScriptData;
    },
    enabled: !isNew && !!id,
  });

  // Populate form when script loads
  React.useEffect(() => {
    if (script) {
      setFormData({
        name: script.name || "",
        category: script.category || "cold_call",
        description: script.description || "",
        opening: script.opening || "",
        body: script.body || "",
        closing: script.closing || "",
        objectionHandlers: script.objection_handlers || [],
        isDefault: script.is_default || false,
      });
    }
  }, [script]);

  const saveScript = useMutation({
    mutationFn: async () => {
      if (!user?.id || !organizationId) throw new Error("Not authenticated");

      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description || null,
        opening: formData.opening || null,
        body: formData.body || null,
        closing: formData.closing || null,
        objection_handlers: formData.objectionHandlers,
        is_default: formData.isDefault,
        user_id: user.id,
        organization_id: organizationId,
        is_active: true,
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("call_scripts")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("call_scripts")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["call-scripts"] });
      queryClient.invalidateQueries({ queryKey: ["call-script", id] });
      toast.success(isNew ? "Script created" : "Script saved");
      if (isNew && data?.id) {
        navigate(`/dialer/scripts/${data.id}`, { replace: true });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save script");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Script name is required");
      return;
    }
    saveScript.mutate();
  };

  if (!isNew && isLoading) {
    return (
      <AppLayout>
        <PageLayout title="">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </PageLayout>
      </AppLayout>
    );
  }

  // Mock analytics for existing scripts
  const analytics = script
    ? {
        used: script.use_count || 0,
        reached: Math.round((script.use_count || 0) * 0.48),
        reachedPercent: 48,
        appointments: Math.round((script.use_count || 0) * 0.048),
        appointmentPercent: script.success_rate || 10,
        avgTalkTime: "4:32",
        vsAverage: "+23%",
      }
    : null;

  return (
    <AppLayout>
      <PageLayout
        title=""
        headerActions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={saveScript.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              {saveScript.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        {/* Back Button & Title */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dialer/scripts")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Scripts
          </Button>
          <h1 className="text-h1 font-bold text-foreground">
            {isNew ? "Create Script" : "Edit Script"}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card variant="default" padding="none">
                <CardHeader>
                  <CardTitle className="text-h3">Basic Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Script Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((d) => ({ ...d, name: e.target.value }))
                        }
                        placeholder="e.g., Motivated Seller Cold Call"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(v) =>
                          setFormData((d) => ({ ...d, category: v }))
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((d) => ({ ...d, description: e.target.value }))
                      }
                      placeholder="Brief description of when to use this script..."
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="isDefault"
                      checked={formData.isDefault}
                      onCheckedChange={(checked) =>
                        setFormData((d) => ({ ...d, isDefault: checked === true }))
                      }
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                      Set as default script
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Script Builder */}
              <div>
                <h2 className="text-h2 font-semibold text-foreground mb-4">
                  Script Builder
                </h2>
                <ScriptEditor
                  opening={formData.opening}
                  body={formData.body}
                  closing={formData.closing}
                  objectionHandlers={formData.objectionHandlers}
                  onOpeningChange={(v) =>
                    setFormData((d) => ({ ...d, opening: v }))
                  }
                  onBodyChange={(v) => setFormData((d) => ({ ...d, body: v }))}
                  onClosingChange={(v) =>
                    setFormData((d) => ({ ...d, closing: v }))
                  }
                  onObjectionHandlersChange={(v) =>
                    setFormData((d) => ({ ...d, objectionHandlers: v }))
                  }
                />
              </div>

              {/* Analytics (only for existing scripts) */}
              {analytics && !isNew && (
                <Card variant="default" padding="none">
                  <CardHeader>
                    <CardTitle className="text-h3">Script Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/30 rounded-medium">
                        <Phone className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-h3 font-semibold">{analytics.used}</p>
                        <p className="text-tiny text-muted-foreground">Times Used</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-medium">
                        <TrendingUp className="h-5 w-5 mx-auto mb-1 text-success" />
                        <p className="text-h3 font-semibold">
                          {analytics.reached} ({analytics.reachedPercent}%)
                        </p>
                        <p className="text-tiny text-muted-foreground">
                          Contacts Reached
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-medium">
                        <Calendar className="h-5 w-5 mx-auto mb-1 text-warning" />
                        <p className="text-h3 font-semibold">
                          {analytics.appointments} ({analytics.appointmentPercent}%)
                        </p>
                        <p className="text-tiny text-muted-foreground">
                          Appointments Set
                        </p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-medium">
                        <Clock className="h-5 w-5 mx-auto mb-1 text-info" />
                        <p className="text-h3 font-semibold">{analytics.avgTalkTime}</p>
                        <p className="text-tiny text-muted-foreground">
                          Avg Talk Time
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-success/10 border border-success/20 rounded-medium text-center">
                      <p className="text-small text-success font-medium">
                        This script performs {analytics.vsAverage} better than your
                        other scripts
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <MergeFieldsSidebar />
            </div>
          </div>
        </form>

        {/* Preview Modal */}
        <ScriptPreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          script={{
            name: formData.name || "Untitled Script",
            opening: formData.opening,
            body: formData.body,
            closing: formData.closing,
            objection_handlers: formData.objectionHandlers,
          }}
        />
      </PageLayout>
    </AppLayout>
  );
}
