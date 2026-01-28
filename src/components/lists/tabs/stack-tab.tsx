import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Layers3,
  Info,
  ListFilter,
  Upload,
  PenLine,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StackTabProps {
  onSuccess: () => void;
}

type StackCriteria = "any" | "all" | "2" | "3";

const listTypeIcons: Record<string, React.ElementType> = {
  criteria: ListFilter,
  uploaded: Upload,
  stacked: Layers3,
  manual: PenLine,
};

export function StackTab({ onSuccess }: StackTabProps) {
  const { user } = useAuth();
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [stackName, setStackName] = useState("");
  const [stackCriteria, setStackCriteria] = useState<StackCriteria>("any");
  const [isCreating, setIsCreating] = useState(false);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["lists-for-stacking", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("id, name, list_type, total_records, unique_records")
        .neq("status", "archived")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleList = (listId: string) => {
    setSelectedLists((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    );
  };

  const handleCreateStack = async () => {
    if (selectedLists.length < 2) {
      toast.error("Please select at least 2 lists to stack");
      return;
    }

    if (!stackName.trim()) {
      toast.error("Please enter a name for your stacked list");
      return;
    }

    setIsCreating(true);

    try {
      // Create the stacked list
      const { data: newList, error } = await supabase
        .from("lists")
        .insert({
          name: stackName,
          list_type: "stacked",
          status: "building",
          stacked_from: selectedLists,
          stack_criteria: stackCriteria,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Stacked list created! Processing records...");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create stacked list");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const selectedListsData = lists.filter((l) => selectedLists.includes(l.id));
  const totalRecords = selectedListsData.reduce((sum, l) => sum + (l.unique_records || 0), 0);

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">List Stacking</p>
              <p className="text-muted-foreground">
                Combine multiple lists to find properties that appear on more than one list.
                Properties hitting multiple distress indicators are often the most motivated sellers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Select Lists */}
      <div>
        <Label className="mb-3 block">Select Lists to Stack</Label>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading lists...</p>
        ) : lists.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Layers3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="font-medium mb-1">No Lists Available</p>
              <p className="text-sm text-muted-foreground">
                Create or upload some lists first before stacking.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
            {lists.map((list) => {
              const Icon = listTypeIcons[list.list_type] || ListFilter;
              const isSelected = selectedLists.includes(list.id);

              return (
                <div
                  key={list.id}
                  onClick={() => toggleList(list.id)}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox checked={isSelected} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{list.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(list.unique_records || 0).toLocaleString()} records
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {list.list_type}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stack Criteria */}
      {selectedLists.length >= 2 && (
        <div className="space-y-3">
          <Label>Stack Criteria</Label>
          <RadioGroup
            value={stackCriteria}
            onValueChange={(value) => setStackCriteria(value as StackCriteria)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any" />
              <label htmlFor="any" className="text-sm cursor-pointer">
                <span className="font-medium">Any match</span>
                <span className="text-muted-foreground"> - Include if property appears in any selected list</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <label htmlFor="all" className="text-sm cursor-pointer">
                <span className="font-medium">All match</span>
                <span className="text-muted-foreground"> - Only include if property appears in ALL lists</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="two" />
              <label htmlFor="two" className="text-sm cursor-pointer">
                <span className="font-medium">At least 2</span>
                <span className="text-muted-foreground"> - Property must appear in 2+ lists</span>
              </label>
            </div>
            {selectedLists.length >= 3 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="three" />
                <label htmlFor="three" className="text-sm cursor-pointer">
                  <span className="font-medium">At least 3</span>
                  <span className="text-muted-foreground"> - Property must appear in 3+ lists (Golden List)</span>
                </label>
              </div>
            )}
          </RadioGroup>
        </div>
      )}

      {/* Stack Name */}
      {selectedLists.length >= 2 && (
        <div>
          <Label htmlFor="stack-name">Stacked List Name</Label>
          <Input
            id="stack-name"
            value={stackName}
            onChange={(e) => setStackName(e.target.value)}
            placeholder="e.g., High Motivation Stack"
            className="mt-1.5"
          />
        </div>
      )}

      {/* Summary & Create */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {selectedLists.length} lists selected · ~{totalRecords.toLocaleString()} total records
        </div>
        <Button
          onClick={handleCreateStack}
          disabled={selectedLists.length < 2 || !stackName.trim() || isCreating}
        >
          {isCreating ? "Creating..." : "Create Stacked List"}
        </Button>
      </div>
    </div>
  );
}
