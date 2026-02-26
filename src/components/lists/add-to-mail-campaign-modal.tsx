import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, Plus, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AddToMailCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRecordIds: string[];
  onComplete: () => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/10 text-primary",
  sending: "bg-warning/10 text-warning",
  sent: "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
};

export function AddToMailCampaignModal({
  open,
  onOpenChange,
  selectedRecordIds,
  onComplete,
}: AddToMailCampaignModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState("existing");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Fetch campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["mail-campaigns-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mail_campaigns")
        .select("id, name, status, total_recipients")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ["mail-templates-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mail_templates")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    enabled: open && tab === "new",
  });

  const addRecordsToCampaign = async (campaignId: string, campaignName: string) => {
    setIsAdding(true);
    try {
      // Fetch record details
      const { data: records, error: fetchErr } = await supabase
        .from("list_records")
        .select("id, owner_name, address, city, state, zip")
        .in("id", selectedRecordIds);
      if (fetchErr) throw fetchErr;
      if (!records?.length) {
        toast.error("No records found");
        return;
      }

      // Check existing to avoid duplicates
      const { data: existing } = await supabase
        .from("mail_pieces")
        .select("list_record_id")
        .eq("campaign_id", campaignId)
        .in("list_record_id", selectedRecordIds);

      const existingIds = new Set((existing || []).map((e: any) => e.list_record_id));
      const newRecords = records.filter((r) => !existingIds.has(r.id));
      const skippedCount = records.length - newRecords.length;

      if (newRecords.length > 0) {
        const pieces = newRecords.map((r) => ({
          campaign_id: campaignId,
          list_record_id: r.id,
          recipient_name: r.owner_name || null,
          recipient_address: r.address || null,
          recipient_city: r.city || null,
          recipient_state: r.state || null,
          recipient_zip: r.zip || null,
          status: "pending",
        }));

        const { error: insertErr } = await supabase.from("mail_pieces").insert(pieces);
        if (insertErr) throw insertErr;

        // Update campaign recipient count
        await supabase
          .from("mail_campaigns")
          .update({ total_recipients: (campaigns.find((c) => c.id === campaignId)?.total_recipients || 0) + newRecords.length })
          .eq("id", campaignId);
      }

      const msg = skippedCount > 0
        ? `Added ${newRecords.length} new records (${skippedCount} already in campaign)`
        : `Added ${newRecords.length} records to ${campaignName}`;
      toast.success(msg);
      onOpenChange(false);
      onComplete();
    } catch (err) {
      console.error("Add to campaign error:", err);
      toast.error("Failed to add records to campaign");
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newName.trim() || !user) return;
    setIsAdding(true);
    try {
      const { data: campaign, error } = await supabase
        .from("mail_campaigns")
        .insert({
          name: newName.trim(),
          user_id: user.id,
          template_id: selectedTemplateId || null,
          status: "draft",
        })
        .select("id, name")
        .single();
      if (error) throw error;

      await addRecordsToCampaign(campaign.id, campaign.name);
      navigate(`/mail/campaigns/${campaign.id}`);
    } catch (err) {
      console.error("Create campaign error:", err);
      toast.error("Failed to create campaign");
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[80vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Add {selectedRecordIds.length} Records To Mail Campaign
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="existing">Existing Campaign</TabsTrigger>
            <TabsTrigger value="new">New Campaign</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="flex-1 min-h-0 mt-4">
            {loadingCampaigns ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">No campaigns yet</p>
                <Button variant="outline" size="sm" onClick={() => setTab("new")}>
                  <Plus className="h-4 w-4 mr-1" /> Create One
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-3">
                  {campaigns.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={statusColors[c.status] || ""}>
                            {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "Draft"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {c.total_recipients || 0} Recipients
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 ml-3"
                        disabled={isAdding}
                        onClick={() => addRecordsToCampaign(c.id, c.name)}
                      >
                        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input
                placeholder="e.g. March Mailers - Distressed List"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mail Template (Optional)</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full gap-2"
              disabled={!newName.trim() || isAdding}
              onClick={handleCreateAndAdd}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create & Add {selectedRecordIds.length} Records
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
