import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StackingStats {
  totalRecords: number;
  uniqueRecords: number;
  highMotivationCount: number;
  avgMotivationScore: number;
  sourceListCount: number;
  minMatchesRequired: number;
  matchCounts: Record<number, number>;
}

export interface StackingResult {
  success: boolean;
  listId?: string;
  stats?: StackingStats;
  error?: string;
}

export function useListStacking() {
  const [isStacking, setIsStacking] = useState(false);
  const [progress, setProgress] = useState(0);

  const stackLists = async (
    name: string,
    description: string,
    sourceListIds: string[],
    stackCriteria: string,
    options: {
      includeSuppressed?: boolean;
      boostMotivation?: boolean;
    } = {}
  ): Promise<StackingResult> => {
    if (sourceListIds.length < 2) {
      toast.error("Please select at least 2 lists to stack");
      return { success: false, error: "At least 2 lists required" };
    }

    setIsStacking(true);
    setProgress(10);

    try {
      setProgress(30);

      const { data, error } = await supabase.functions.invoke("stack-lists", {
        body: {
          name,
          description,
          sourceListIds,
          stackCriteria,
          includeSuppressed: options.includeSuppressed ?? false,
          boostMotivation: options.boostMotivation ?? true,
        },
      });

      setProgress(90);

      if (error) {
        throw new Error(error.message || "Stacking failed");
      }

      if (!data.success) {
        throw new Error(data.error || "Stacking failed");
      }

      setProgress(100);
      toast.success(
        `Stacked list created! ${data.stats.uniqueRecords} properties found.`
      );

      return {
        success: true,
        listId: data.listId,
        stats: data.stats,
      };
    } catch (error: any) {
      console.error("Stacking error:", error);
      toast.error(error.message || "Failed to stack lists");
      return { success: false, error: error.message };
    } finally {
      setIsStacking(false);
      setProgress(0);
    }
  };

  const estimateStackResults = async (
    sourceListIds: string[],
    stackCriteria: string
  ): Promise<{ estimated: number; breakdown: Record<number, number> }> => {
    if (sourceListIds.length < 2) {
      return { estimated: 0, breakdown: {} };
    }

    try {
      // Get all records from source lists
      const { data: records } = await supabase
        .from("list_records")
        .select("address_hash, list_id")
        .in("list_id", sourceListIds)
        .eq("status", "active");

      if (!records) return { estimated: 0, breakdown: {} };

      // Group by address hash
      const addressGroups = new Map<string, Set<string>>();
      for (const record of records) {
        if (!record.address_hash) continue;
        if (!addressGroups.has(record.address_hash)) {
          addressGroups.set(record.address_hash, new Set());
        }
        addressGroups.get(record.address_hash)!.add(record.list_id);
      }

      // Determine minimum matches
      let minMatches = 1;
      if (stackCriteria === "all") {
        minMatches = sourceListIds.length;
      } else if (stackCriteria === "any") {
        minMatches = 1;
      } else if (!isNaN(parseInt(stackCriteria))) {
        minMatches = parseInt(stackCriteria);
      }

      // Count matches
      let estimated = 0;
      const breakdown: Record<number, number> = {};

      for (const [, listIds] of addressGroups) {
        const matchCount = listIds.size;
        breakdown[matchCount] = (breakdown[matchCount] || 0) + 1;
        if (matchCount >= minMatches) {
          estimated++;
        }
      }

      return { estimated, breakdown };
    } catch (error) {
      console.error("Estimation error:", error);
      return { estimated: 0, breakdown: {} };
    }
  };

  return {
    stackLists,
    estimateStackResults,
    isStacking,
    progress,
  };
}
