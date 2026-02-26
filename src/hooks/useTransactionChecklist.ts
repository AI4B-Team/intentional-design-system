import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";
import { toast } from "sonner";

export interface ChecklistItem {
  stage: string;
  itemKey: string;
  label: string;
  completed: boolean;
  completedAt: string | null;
}

export interface StageNote {
  stage: string;
  notes: string;
}

export const ROADMAP_STAGES = [
  {
    id: "lead",
    emoji: "🔍",
    label: "Lead",
    items: [
      { key: "property_identified", label: "Property Identified" },
      { key: "contact_made", label: "Contact Made" },
      { key: "motivation_confirmed", label: "Motivation Confirmed" },
    ],
  },
  {
    id: "under_contract",
    emoji: "📋",
    label: "Under Contract",
    items: [
      { key: "loi_sent", label: "LOI Sent" },
      { key: "contract_signed", label: "Contract Signed" },
      { key: "earnest_money_collected", label: "Earnest Money Collected" },
      { key: "title_opened", label: "Title Opened" },
    ],
  },
  {
    id: "due_diligence",
    emoji: "🔬",
    label: "Due Diligence",
    items: [
      { key: "inspection_scheduled", label: "Inspection Scheduled" },
      { key: "repair_estimate_complete", label: "Repair Estimate Complete" },
      { key: "title_search_clear", label: "Title Search Clear" },
      { key: "liens_resolved", label: "Liens Resolved" },
    ],
  },
  {
    id: "disposition",
    emoji: "💼",
    label: "Disposition",
    items: [
      { key: "deal_listed", label: "Deal Listed To Buyers" },
      { key: "pof_collected", label: "POF Collected" },
      { key: "buyer_under_contract", label: "Buyer Under Contract" },
      { key: "close_ready", label: "Double Close Or Assignment Ready" },
    ],
  },
  {
    id: "closing",
    emoji: "🏁",
    label: "Closing",
    items: [
      { key: "hud_reviewed", label: "HUD/Settlement Statement Reviewed" },
      { key: "wires_confirmed", label: "Wires Confirmed" },
      { key: "deed_recorded", label: "Deed Recorded" },
      { key: "funds_received", label: "Funds Received" },
    ],
  },
] as const;

export type StageId = (typeof ROADMAP_STAGES)[number]["id"];

export function useTransactionChecklist(dealId: string) {
  const { user } = useAuth();
  const organizationId = useCurrentOrganizationId();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Fetch checklist + notes
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [checkRes, notesRes] = await Promise.all([
        supabase
          .from("transaction_checklist")
          .select("stage, item_key, completed")
          .eq("deal_id", dealId)
          .eq("user_id", user.id),
        supabase
          .from("transaction_stage_notes")
          .select("stage, notes")
          .eq("deal_id", dealId)
          .eq("user_id", user.id),
      ]);

      const map: Record<string, boolean> = {};
      checkRes.data?.forEach((row: any) => {
        map[`${row.stage}::${row.item_key}`] = row.completed;
      });
      setChecklist(map);

      const notesMap: Record<string, string> = {};
      notesRes.data?.forEach((row: any) => {
        notesMap[row.stage] = row.notes;
      });
      setStageNotes(notesMap);
    } catch (err) {
      console.error("Failed to load checklist:", err);
    } finally {
      setLoading(false);
    }
  }, [dealId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleItem = useCallback(
    async (stage: string, itemKey: string) => {
      if (!user || !organizationId) return;
      const key = `${stage}::${itemKey}`;
      const newVal = !checklist[key];
      setChecklist((prev) => ({ ...prev, [key]: newVal }));

      const { error } = await supabase.from("transaction_checklist").upsert(
        {
          deal_id: dealId,
          stage,
          item_key: itemKey,
          completed: newVal,
          completed_at: newVal ? new Date().toISOString() : null,
          completed_by: newVal ? user.id : null,
          organization_id: organizationId,
          user_id: user.id,
        },
        { onConflict: "deal_id,stage,item_key,user_id" }
      );

      if (error) {
        console.error("Toggle error:", error);
        setChecklist((prev) => ({ ...prev, [key]: !newVal }));
        toast.error("Failed to save");
      }
    },
    [checklist, dealId, user, organizationId]
  );

  const updateStageNote = useCallback(
    (stage: string, value: string) => {
      setStageNotes((prev) => ({ ...prev, [stage]: value }));

      // Debounce save
      if (debounceTimers.current[stage]) clearTimeout(debounceTimers.current[stage]);
      debounceTimers.current[stage] = setTimeout(async () => {
        if (!user || !organizationId) return;
        const { error } = await supabase.from("transaction_stage_notes").upsert(
          {
            deal_id: dealId,
            stage,
            notes: value,
            organization_id: organizationId,
            user_id: user.id,
          },
          { onConflict: "deal_id,stage,user_id" }
        );
        if (error) console.error("Note save error:", error);
      }, 800);
    },
    [dealId, user, organizationId]
  );

  const isItemChecked = useCallback(
    (stage: string, itemKey: string) => !!checklist[`${stage}::${itemKey}`],
    [checklist]
  );

  // Compute stats
  const totalItems = ROADMAP_STAGES.reduce((s, st) => s + st.items.length, 0);
  const completedItems = Object.values(checklist).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Next action: first uncompleted item in order
  let nextAction: { stage: string; stageLabel: string; itemKey: string; itemLabel: string } | null = null;
  for (const stage of ROADMAP_STAGES) {
    for (const item of stage.items) {
      if (!checklist[`${stage.id}::${item.key}`]) {
        nextAction = { stage: stage.id, stageLabel: stage.label, itemKey: item.key, itemLabel: item.label };
        break;
      }
    }
    if (nextAction) break;
  }

  return {
    loading,
    checklist,
    stageNotes,
    isItemChecked,
    toggleItem,
    updateStageNote,
    totalItems,
    completedItems,
    progressPercent,
    nextAction,
    refetch: fetchData,
  };
}
