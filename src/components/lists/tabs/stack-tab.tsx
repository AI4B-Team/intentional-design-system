import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Layers3,
  Info,
  ListFilter,
  Upload,
  PenLine,
  Loader2,
  Check,
  Flame,
  Star,
  Target,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useListStacking, StackingStats } from "@/hooks/useListStacking";

interface StackTabProps {
  onSuccess: () => void;
}

type StackCriteria = "any" | "all" | "2" | "3" | "custom";

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
  const [stackCriteria, setStackCriteria] = useState<StackCriteria>("2");
  const [customMinimum, setCustomMinimum] = useState("2");
  const [options, setOptions] = useState({
    boostMotivation: true,
    skipSuppressed: true,
    combineIndicators: true,
  });
  const [estimatedResults, setEstimatedResults] = useState<{
    estimated: number;
    breakdown: Record<number, number>;
  }>({ estimated: 0, breakdown: {} });
  const [stackingResult, setStackingResult] = useState<StackingStats | null>(null);

  const { stackLists, estimateStackResults, isStacking, progress } = useListStacking();

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["lists-for-stacking", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("id, name, list_type, total_records, unique_records")
        .neq("status", "archived")
        .neq("list_type", "stacked")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Estimate results when selection or criteria changes
  useEffect(() => {
    const estimate = async () => {
      if (selectedLists.length < 2) {
        setEstimatedResults({ estimated: 0, breakdown: {} });
        return;
      }

      const criteria = stackCriteria === "custom" ? customMinimum : stackCriteria;
      const result = await estimateStackResults(selectedLists, criteria);
      setEstimatedResults(result);
    };

    estimate();
  }, [selectedLists, stackCriteria, customMinimum]);

  const toggleList = (listId: string) => {
    setSelectedLists((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    );
  };

  const handleCreateStack = async () => {
    if (selectedLists.length < 2) return;
    if (!stackName.trim()) return;

    const criteria = stackCriteria === "custom" ? customMinimum : stackCriteria;

    const result = await stackLists(
      stackName,
      `Stacked from ${selectedLists.length} lists`,
      selectedLists,
      criteria,
      {
        includeSuppressed: !options.skipSuppressed,
        boostMotivation: options.boostMotivation,
      }
    );

    if (result.success && result.stats) {
      setStackingResult(result.stats);
    }
  };

  const selectedListsData = lists.filter((l) => selectedLists.includes(l.id));
  const totalRecords = selectedListsData.reduce(
    (sum, l) => sum + (l.unique_records || 0),
    0
  );

  // Show results after successful stacking
  if (stackingResult) {
    return (
      <div className="py-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Target className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">🎯 Stack Complete!</h3>
          <p className="text-muted-foreground">
            Found {stackingResult.uniqueRecords.toLocaleString()} matching properties
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
          <Card>
            <CardContent className="p-4 text-center">
              <Layers3 className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{stackingResult.uniqueRecords}</p>
              <p className="text-xs text-muted-foreground">Properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stackingResult.highMotivationCount}</p>
              <p className="text-xs text-muted-foreground">High Motivation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stackingResult.avgMotivationScore}</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Check className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{stackingResult.sourceListCount}</p>
              <p className="text-xs text-muted-foreground">Lists Stacked</p>
            </CardContent>
          </Card>
        </div>

        {/* Match breakdown */}
        {Object.keys(stackingResult.matchCounts).length > 0 && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 text-sm">Match Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(stackingResult.matchCounts)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([count, num]) => (
                    <div key={count} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {parseInt(count) >= 3 && <Flame className="h-4 w-4 text-orange-500" />}
                        {parseInt(count) === stackingResult.sourceListCount && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                        In {count} list{parseInt(count) > 1 ? "s" : ""}
                      </span>
                      <Badge variant="secondary">{num.toLocaleString()}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={onSuccess}>View Stacked List</Button>
      </div>
    );
  }

  // Show progress during stacking
  if (isStacking) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
        <h3 className="font-medium mb-2">Stacking your lists...</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Analyzing {totalRecords.toLocaleString()} records across {selectedLists.length} lists
        </p>
        <Progress value={progress} className="max-w-xs mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
      </div>
    );
  }

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
        <Label className="mb-3 block">
          Select Lists to Stack{" "}
          <span className="text-muted-foreground font-normal">(at least 2)</span>
        </Label>
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
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
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

        {selectedLists.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Selected: {selectedLists.length} lists · Combined:{" "}
            {totalRecords.toLocaleString()} records
          </p>
        )}
      </div>

      {/* Stack Criteria */}
      {selectedLists.length >= 2 && (
        <div className="space-y-3">
          <Label>How many lists must a property appear in?</Label>
          <RadioGroup
            value={stackCriteria}
            onValueChange={(value) => setStackCriteria(value as StackCriteria)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="any" id="any" />
              <label htmlFor="any" className="text-sm cursor-pointer flex-1">
                <span className="font-medium">Any list (OR)</span>
                <p className="text-xs text-muted-foreground">
                  Returns all unique properties from selected lists
                </p>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="two" />
              <label htmlFor="two" className="text-sm cursor-pointer flex-1">
                <span className="font-medium">At least 2 lists</span>
                <p className="text-xs text-muted-foreground">
                  Properties appearing in 2 or more lists
                </p>
              </label>
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            </div>
            {selectedLists.length >= 3 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="three" />
                <label htmlFor="three" className="text-sm cursor-pointer flex-1">
                  <span className="font-medium flex items-center gap-1">
                    At least 3 lists <Flame className="h-3 w-3 text-orange-500" />
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Highly motivated - in 3+ lists
                  </p>
                </label>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <label htmlFor="all" className="text-sm cursor-pointer flex-1">
                <span className="font-medium flex items-center gap-1">
                  All selected lists (AND) <Star className="h-3 w-3 text-yellow-500" />
                </span>
                <p className="text-xs text-muted-foreground">
                  Must appear in every selected list
                </p>
              </label>
            </div>
            {selectedLists.length > 3 && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <label htmlFor="custom" className="text-sm cursor-pointer">
                  <span className="font-medium">Custom:</span>
                </label>
                <Input
                  type="number"
                  min={2}
                  max={selectedLists.length}
                  value={customMinimum}
                  onChange={(e) => setCustomMinimum(e.target.value)}
                  className="w-16 h-8"
                  onClick={() => setStackCriteria("custom")}
                />
                <span className="text-sm text-muted-foreground">lists minimum</span>
              </div>
            )}
          </RadioGroup>

          {/* Estimated Results */}
          {estimatedResults.estimated > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-3">
                <p className="text-sm">
                  <span className="font-medium">Estimated results:</span>{" "}
                  ~{estimatedResults.estimated.toLocaleString()} properties match your criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Options */}
      {selectedLists.length >= 2 && (
        <div className="space-y-3">
          <Label>Options</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="boost-motivation"
                checked={options.boostMotivation}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, boostMotivation: !!checked }))
                }
              />
              <label htmlFor="boost-motivation" className="text-sm cursor-pointer">
                Boost motivation score based on match count (+100 per additional list)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="skip-suppressed"
                checked={options.skipSuppressed}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, skipSuppressed: !!checked }))
                }
              />
              <label htmlFor="skip-suppressed" className="text-sm cursor-pointer">
                Skip addresses in suppression list
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="combine-indicators"
                checked={options.combineIndicators}
                onCheckedChange={(checked) =>
                  setOptions((prev) => ({ ...prev, combineIndicators: !!checked }))
                }
              />
              <label htmlFor="combine-indicators" className="text-sm cursor-pointer">
                Combine distress indicators from all matched lists
              </label>
            </div>
          </div>
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
            placeholder="e.g., Golden Leads - Tax + Pre-Foreclosure"
            className="mt-1.5"
          />
        </div>
      )}

      {/* Summary & Create */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {selectedLists.length} lists selected ·{" "}
          {estimatedResults.estimated > 0
            ? `~${estimatedResults.estimated.toLocaleString()} matches`
            : `${totalRecords.toLocaleString()} total records`}
        </div>
        <Button
          onClick={handleCreateStack}
          disabled={selectedLists.length < 2 || !stackName.trim() || isStacking}
        >
          <Layers3 className="h-4 w-4 mr-2" />
          Stack Lists
        </Button>
      </div>
    </div>
  );
}
