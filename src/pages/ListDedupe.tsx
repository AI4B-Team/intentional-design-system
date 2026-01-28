import { useState, useMemo } from "react";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Layers3,
  Merge,
  CheckCircle2,
  XCircle,
  SkipForward,
  Loader2,
  Settings2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Step = "select" | "review" | "settings" | "processing" | "complete";

interface DuplicateGroup {
  id: string;
  records: {
    id: string;
    listName: string;
    address: string;
    owner: string;
    isPrimary: boolean;
  }[];
  confidence: number;
}

export default function ListDedupe() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("select");
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [dedupeAll, setDedupeAll] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [processedGroups, setProcessedGroups] = useState<Set<string>>(new Set());
  const [mergeStrategy, setMergeStrategy] = useState("most_complete");
  const [afterMerge, setAfterMerge] = useState("mark_duplicate");
  const [progress, setProgress] = useState(0);
  const [fuzzyThreshold, setFuzzyThreshold] = useState([85]);

  // Fetch lists
  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("id, name, total_records, list_type")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleList = (listId: string) => {
    if (dedupeAll) return;
    setSelectedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const handleFindDuplicates = async () => {
    const listsToCheck = dedupeAll ? lists.map((l) => l.id) : selectedLists;
    if (listsToCheck.length < 1) {
      toast.error("Select at least one list");
      return;
    }

    // Simulate finding duplicates (in production, this would call an edge function)
    setStep("processing");
    setProgress(0);

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200));
      setProgress(i);
    }

    // Generate mock duplicate groups
    const mockGroups: DuplicateGroup[] = [
      {
        id: "1",
        confidence: 95,
        records: [
          { id: "r1", listName: "Tax Delinquent", address: "123 Main St, Austin TX 78701", owner: "John Smith", isPrimary: true },
          { id: "r2", listName: "Pre-Foreclosure", address: "123 Main Street, Austin TX", owner: "J Smith", isPrimary: false },
          { id: "r3", listName: "Absentee Owners", address: "123 Main St, Austin, TX 78701", owner: "John D Smith", isPrimary: false },
        ],
      },
      {
        id: "2",
        confidence: 88,
        records: [
          { id: "r4", listName: "High Equity", address: "456 Oak Ave, Dallas TX 75201", owner: "Jane Doe", isPrimary: true },
          { id: "r5", listName: "Probate", address: "456 Oak Avenue, Dallas TX", owner: "Jane M Doe", isPrimary: false },
        ],
      },
      {
        id: "3",
        confidence: 92,
        records: [
          { id: "r6", listName: "Tax Delinquent", address: "789 Elm Rd, Houston TX 77001", owner: "Bob Wilson", isPrimary: true },
          { id: "r7", listName: "Vacant Properties", address: "789 Elm Road, Houston TX 77001", owner: "Robert Wilson", isPrimary: false },
        ],
      },
    ];

    setDuplicateGroups(mockGroups);
    setStep("review");
  };

  const handleGroupAction = (groupId: string, action: "merge" | "not_duplicate" | "skip") => {
    setProcessedGroups((prev) => new Set([...prev, groupId]));
    if (action === "merge") {
      toast.success("Group merged");
    } else if (action === "not_duplicate") {
      toast.info("Marked as not duplicates");
    }
  };

  const handleAutoMerge = () => {
    const highConfidence = duplicateGroups.filter((g) => g.confidence >= 90 && !processedGroups.has(g.id));
    highConfidence.forEach((g) => {
      setProcessedGroups((prev) => new Set([...prev, g.id]));
    });
    toast.success(`Auto-merged ${highConfidence.length} high-confidence groups`);
  };

  const handleProcessMerges = async () => {
    setStep("processing");
    setProgress(0);

    for (let i = 0; i <= 100; i += 20) {
      await new Promise((r) => setTimeout(r, 300));
      setProgress(i);
    }

    setStep("complete");
  };

  const unprocessedCount = duplicateGroups.filter((g) => !processedGroups.has(g.id)).length;
  const totalRecordsMerged = duplicateGroups.reduce((sum, g) => sum + (processedGroups.has(g.id) ? g.records.length - 1 : 0), 0);

  return (
    <PageLayout
      breadcrumbs={[
        { label: "Marketing", href: "/marketing" },
        { label: "Deduplication Tool" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Deduplication Tool</h1>
          <p className="text-muted-foreground">Find and merge duplicate records across lists</p>
        </div>

        {/* Step 1: Select Lists */}
        {step === "select" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                Select Lists to Deduplicate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  id="dedupe-all"
                  checked={dedupeAll}
                  onCheckedChange={(c) => {
                    setDedupeAll(!!c);
                    if (c) setSelectedLists([]);
                  }}
                />
                <label htmlFor="dedupe-all" className="font-medium cursor-pointer">
                  Dedupe my entire database
                </label>
              </div>

              {!dedupeAll && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading lists...</div>
                  ) : lists.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No lists found</div>
                  ) : (
                    lists.map((list) => (
                      <div
                        key={list.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLists.includes(list.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleList(list.id)}
                      >
                        <Checkbox checked={selectedLists.includes(list.id)} />
                        <div className="flex-1">
                          <p className="font-medium">{list.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {list.total_records?.toLocaleString() || 0} records
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {list.list_type}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Matching Settings */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Matching Settings</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Fuzzy match threshold: {fuzzyThreshold[0]}%</Label>
                    <Slider
                      value={fuzzyThreshold}
                      onValueChange={setFuzzyThreshold}
                      min={50}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Include in matching:</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox id="match-address" defaultChecked />
                        <label htmlFor="match-address" className="text-sm">Address</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="match-city" defaultChecked />
                        <label htmlFor="match-city" className="text-sm">City</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="match-state" defaultChecked />
                        <label htmlFor="match-state" className="text-sm">State</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="match-zip" />
                        <label htmlFor="match-zip" className="text-sm">Zip</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox id="match-owner" />
                        <label htmlFor="match-owner" className="text-sm">Owner name</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleFindDuplicates}
                  disabled={!dedupeAll && selectedLists.length === 0}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Duplicates
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review Duplicates */}
        {step === "review" && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                    Review Duplicates
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{duplicateGroups.length} groups found</Badge>
                    <Badge variant="outline">{unprocessedCount} remaining</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" onClick={handleAutoMerge}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto-merge high-confidence
                  </Button>
                  <Button variant="outline" onClick={() => setProcessedGroups(new Set(duplicateGroups.map((g) => g.id)))}>
                    Mark all as reviewed
                  </Button>
                </div>

                <Accordion type="multiple" className="space-y-2">
                  {duplicateGroups.map((group, idx) => {
                    const isProcessed = processedGroups.has(group.id);

                    return (
                      <AccordionItem
                        key={group.id}
                        value={group.id}
                        className={`border rounded-lg ${isProcessed ? "opacity-50" : ""}`}
                      >
                        <AccordionTrigger className="px-4 hover:no-underline">
                          <div className="flex items-center gap-4 flex-1">
                            <span className="font-medium">Duplicate Group {idx + 1}</span>
                            <Badge variant="outline">{group.records.length} records</Badge>
                            <Badge
                              className={
                                group.confidence >= 90
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : group.confidence >= 80
                                  ? "bg-yellow-500/10 text-yellow-700"
                                  : "bg-orange-500/10 text-orange-600"
                              }
                            >
                              {group.confidence}% match
                            </Badge>
                            {isProcessed && (
                              <Badge variant="secondary">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Processed
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>List</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.records.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>
                                    <Badge variant="outline">{record.listName}</Badge>
                                  </TableCell>
                                  <TableCell className="font-medium">{record.address}</TableCell>
                                  <TableCell>{record.owner}</TableCell>
                                  <TableCell>
                                    {record.isPrimary ? (
                                      <Badge className="bg-emerald-500/10 text-emerald-600">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Keep (Primary)
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-muted-foreground">
                                        <ArrowRight className="h-3 w-3 mr-1" />
                                        Merge →
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          {!isProcessed && (
                            <div className="flex gap-2 mt-4 pt-4 border-t">
                              <Button size="sm" onClick={() => handleGroupAction(group.id, "merge")}>
                                <Merge className="h-4 w-4 mr-1" />
                                Confirm Merge
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleGroupAction(group.id, "not_duplicate")}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Not Duplicates
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleGroupAction(group.id, "skip")}>
                                <SkipForward className="h-4 w-4 mr-1" />
                                Skip
                              </Button>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>

            {/* Merge Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                  Merge Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">When merging, how to handle data?</Label>
                  <RadioGroup value={mergeStrategy} onValueChange={setMergeStrategy}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="most_complete" id="most_complete" />
                      <label htmlFor="most_complete" className="text-sm cursor-pointer">
                        Keep most complete data (prefer non-empty values)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="newest" id="newest" />
                      <label htmlFor="newest" className="text-sm cursor-pointer">
                        Keep newest data
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="primary_list" id="primary_list" />
                      <label htmlFor="primary_list" className="text-sm cursor-pointer">
                        Keep data from primary list
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-3 block">What to do with merged records?</Label>
                  <RadioGroup value={afterMerge} onValueChange={setAfterMerge}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delete" id="delete" />
                      <label htmlFor="delete" className="text-sm cursor-pointer">
                        Delete from source lists
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mark_duplicate" id="mark_duplicate" />
                      <label htmlFor="mark_duplicate" className="text-sm cursor-pointer">
                        Mark as duplicate (keep but flag)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suppress" id="suppress" />
                      <label htmlFor="suppress" className="text-sm cursor-pointer">
                        Move to suppression list
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep("select")}>
                    Back
                  </Button>
                  <Button onClick={handleProcessMerges} disabled={processedGroups.size === 0}>
                    Process {processedGroups.size} Merges
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Processing */}
        {step === "processing" && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <h3 className="font-medium text-lg mb-2">Processing...</h3>
              <Progress value={progress} className="max-w-xs mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{progress}% complete</p>
            </CardContent>
          </Card>
        )}

        {/* Complete */}
        {step === "complete" && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Deduplication Complete!</h2>
              <div className="flex justify-center gap-8 mb-6">
                <div>
                  <p className="text-3xl font-bold text-primary">{processedGroups.size}</p>
                  <p className="text-sm text-muted-foreground">Groups Processed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-600">{totalRecordsMerged}</p>
                  <p className="text-sm text-muted-foreground">Records Merged</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{processedGroups.size}</p>
                  <p className="text-sm text-muted-foreground">Unique Remain</p>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => {
                  setStep("select");
                  setProcessedGroups(new Set());
                  setDuplicateGroups([]);
                }}>
                  Run Again
                </Button>
                <Button onClick={() => window.location.href = "/marketing/lists"}>
                  View Cleaned Lists
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
