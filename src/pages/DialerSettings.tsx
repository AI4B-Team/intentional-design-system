import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout";
import { PageLayout } from "@/components/layout/page-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Phone, Mic, Link2, Check } from "lucide-react";
import {
  defaultSettings,
  type Disposition,
  type DialerSettingsValues,
} from "@/components/dialer-settings/dialer-settings-constants";
import { GeneralTab } from "@/components/dialer-settings/GeneralTab";
import { DispositionsTab } from "@/components/dialer-settings/DispositionsTab";
import { CallerIdTab } from "@/components/dialer-settings/CallerIdTab";
import { RecordingTab } from "@/components/dialer-settings/RecordingTab";
import { IntegrationsTab } from "@/components/dialer-settings/IntegrationsTab";
import { DispositionDialog } from "@/components/dialer-settings/DispositionDialog";

export default function DialerSettings() {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const queryClient = useQueryClient();

  const [settings, setSettings] = React.useState<DialerSettingsValues>(defaultSettings);
  const [editingDisposition, setEditingDisposition] = React.useState<Disposition | null>(null);
  const [isAddingDisposition, setIsAddingDisposition] = React.useState(false);
  const [newDisposition, setNewDisposition] = React.useState<Partial<Disposition>>({
    name: "",
    category: "neutral",
    icon: "📞",
    color: "#6366f1",
    keyboard_shortcut: null,
    removes_from_queue: false,
    adds_to_dnc: false,
    schedules_followup: false,
    default_followup_days: 3,
    marks_as_success: false,
    is_active: true,
  });

  // Fetch dispositions
  const { data: dispositions = [], isLoading: loadingDispositions } = useQuery({
    queryKey: ["call-dispositions", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("call_dispositions")
        .select("*")
        .eq("organization_id", organizationId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Disposition[];
    },
    enabled: !!organizationId,
  });

  // Save disposition
  const saveDispositionMutation = useMutation({
    mutationFn: async (disposition: Partial<Disposition>) => {
      if (!organizationId || !user) throw new Error("Missing context");

      if (disposition.id) {
        const { error } = await supabase
          .from("call_dispositions")
          .update(disposition)
          .eq("id", disposition.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("call_dispositions").insert([{
          name: disposition.name || "",
          category: disposition.category || "neutral",
          icon: disposition.icon,
          color: disposition.color,
          keyboard_shortcut: disposition.keyboard_shortcut,
          removes_from_queue: disposition.removes_from_queue,
          adds_to_dnc: disposition.adds_to_dnc,
          schedules_followup: disposition.schedules_followup,
          default_followup_days: disposition.default_followup_days,
          marks_as_success: disposition.marks_as_success,
          is_active: disposition.is_active,
          organization_id: organizationId,
          user_id: user.id,
          sort_order: dispositions.length,
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-dispositions"] });
      setEditingDisposition(null);
      setIsAddingDisposition(false);
      setNewDisposition({
        name: "",
        category: "neutral",
        icon: "📞",
        color: "#6366f1",
        keyboard_shortcut: null,
        removes_from_queue: false,
        adds_to_dnc: false,
        schedules_followup: false,
        default_followup_days: 3,
        marks_as_success: false,
        is_active: true,
      });
      toast.success("Disposition saved");
    },
    onError: (error) => {
      toast.error("Failed to save disposition");
      console.error(error);
    },
  });

  // Toggle disposition active
  const toggleDispositionMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("call_dispositions")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-dispositions"] });
    },
  });

  // Delete disposition
  const deleteDispositionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("call_dispositions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-dispositions"] });
      toast.success("Disposition deleted");
    },
  });

  const handleSettingChange = <K extends keyof DialerSettingsValues>(
    key: K,
    value: DialerSettingsValues[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCallingDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      defaultCallingDays: prev.defaultCallingDays.includes(day)
        ? prev.defaultCallingDays.filter((d) => d !== day)
        : [...prev.defaultCallingDays, day],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const webhookUrls = {
    voice: `https://${organizationId}.functions.supabase.co/twilio-twiml`,
    status: `https://${organizationId}.functions.supabase.co/twilio-webhook`,
    recording: `https://${organizationId}.functions.supabase.co/twilio-recording`,
  };

  return (
    <AppLayout>
      <PageLayout title="Dialer Settings">
        <Tabs defaultValue="general" className="space-y-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="dispositions" className="gap-2">
              <Check className="h-4 w-4" />
              Dispositions
            </TabsTrigger>
            <TabsTrigger value="caller-id" className="gap-2">
              <Phone className="h-4 w-4" />
              Caller ID
            </TabsTrigger>
            <TabsTrigger value="recording" className="gap-2">
              <Mic className="h-4 w-4" />
              Recording
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <GeneralTab
              settings={settings}
              handleSettingChange={handleSettingChange}
              toggleCallingDay={toggleCallingDay}
            />
          </TabsContent>

          <TabsContent value="dispositions" className="space-y-6">
            <DispositionsTab
              dispositions={dispositions}
              setEditingDisposition={setEditingDisposition}
              setIsAddingDisposition={setIsAddingDisposition}
              toggleDispositionMutation={toggleDispositionMutation}
              deleteDispositionMutation={deleteDispositionMutation}
            />
          </TabsContent>

          <TabsContent value="caller-id" className="space-y-6">
            <CallerIdTab />
          </TabsContent>

          <TabsContent value="recording" className="space-y-6">
            <RecordingTab settings={settings} handleSettingChange={handleSettingChange} />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsTab
              settings={settings}
              handleSettingChange={handleSettingChange}
              copyToClipboard={copyToClipboard}
              webhookUrls={webhookUrls}
            />
          </TabsContent>
        </Tabs>

        <DispositionDialog
          editingDisposition={editingDisposition}
          isAddingDisposition={isAddingDisposition}
          newDisposition={newDisposition}
          setEditingDisposition={setEditingDisposition}
          setIsAddingDisposition={setIsAddingDisposition}
          setNewDisposition={setNewDisposition}
          saveDispositionMutation={saveDispositionMutation}
        />
      </PageLayout>
    </AppLayout>
  );
}
