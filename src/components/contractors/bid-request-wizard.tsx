import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Star,
  Send,
  Calendar,
} from "lucide-react";
import { useContractors, useCreateBid, type Contractor } from "@/hooks/useContractors";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScopeItem {
  id: string;
  category: string;
  description: string;
  notes?: string;
}

interface BidRequestWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyAddress: string;
  repairDetails?: any[];
}

const categoryOptions = [
  "General",
  "Kitchen",
  "Bathroom",
  "Roofing",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Flooring",
  "Paint",
  "Exterior",
  "Foundation",
  "Windows/Doors",
];

function StarRating({ rating }: { rating: number | null }) {
  const stars = rating || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i <= stars ? "fill-warning text-warning" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export function BidRequestWizard({
  open,
  onOpenChange,
  propertyId,
  propertyAddress,
  repairDetails,
}: BidRequestWizardProps) {
  const { data: contractors } = useContractors();
  const createBid = useCreateBid();
  
  const [currentStep, setCurrentStep] = React.useState(1);
  const [scopeItems, setScopeItems] = React.useState<ScopeItem[]>([]);
  const [freeformScope, setFreeformScope] = React.useState("");
  const [useAiScope, setUseAiScope] = React.useState(true);
  const [selectedContractorIds, setSelectedContractorIds] = React.useState<Set<string>>(new Set());
  const [bidNeededBy, setBidNeededBy] = React.useState(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"));
  const [accessInstructions, setAccessInstructions] = React.useState("");
  const [specialNotes, setSpecialNotes] = React.useState("");

  // Initialize scope from repair details
  React.useEffect(() => {
    if (repairDetails && repairDetails.length > 0 && useAiScope) {
      const items: ScopeItem[] = repairDetails.map((item, index) => ({
        id: `ai-${index}`,
        category: item.category || "General",
        description: item.description || item.item || "",
        notes: item.notes,
      }));
      setScopeItems(items);
    }
  }, [repairDetails, useAiScope]);

  const steps = [
    { number: 1, title: "Scope of Work" },
    { number: 2, title: "Select Contractors" },
    { number: 3, title: "Request Details" },
    { number: 4, title: "Review & Send" },
  ];

  const activeContractors = contractors?.filter(c => c.status === "active") || [];

  // Match contractors based on scope categories
  const matchingContractors = React.useMemo(() => {
    const scopeCategories = scopeItems.map(item => item.category.toLowerCase());
    return activeContractors.filter(c => {
      if (!c.specialties || c.specialties.length === 0) return true;
      return c.specialties.some(spec => 
        scopeCategories.includes(spec) || spec === "general"
      );
    });
  }, [activeContractors, scopeItems]);

  const addScopeItem = () => {
    setScopeItems(prev => [...prev, {
      id: crypto.randomUUID(),
      category: "General",
      description: "",
    }]);
  };

  const updateScopeItem = (id: string, updates: Partial<ScopeItem>) => {
    setScopeItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeScopeItem = (id: string) => {
    setScopeItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleContractor = (id: string) => {
    setSelectedContractorIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllContractors = () => {
    setSelectedContractorIds(new Set(matchingContractors.map(c => c.id)));
  };

  const handleSubmit = async () => {
    const scopeText = scopeItems.length > 0
      ? scopeItems.map(item => `${item.category}: ${item.description}${item.notes ? ` (${item.notes})` : ""}`).join("\n")
      : freeformScope;

    const bids = Array.from(selectedContractorIds).map(contractorId => ({
      property_id: propertyId,
      contractor_id: contractorId,
      scope_of_work: scopeText,
      scope_items: scopeItems,
      valid_until: bidNeededBy,
      status: "requested",
      notes: [accessInstructions, specialNotes].filter(Boolean).join("\n\n"),
    }));

    await createBid.mutateAsync(bids);
    onOpenChange(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return scopeItems.length > 0 || freeformScope.trim().length > 0;
      case 2:
        return selectedContractorIds.size > 0;
      case 3:
        return !!bidNeededBy;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const selectedContractors = contractors?.filter(c => selectedContractorIds.has(c.id)) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-brand" />
            Request Contractor Bids
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <button
                onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                className={cn(
                  "flex items-center gap-2 text-small transition-colors",
                  currentStep === step.number
                    ? "text-brand font-semibold"
                    : currentStep > step.number
                    ? "text-success cursor-pointer"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-tiny font-medium",
                    currentStep === step.number
                      ? "bg-brand text-white"
                      : currentStep > step.number
                      ? "bg-success text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.number ? <Check className="h-3.5 w-3.5" /> : step.number}
                </div>
                <span className="hidden md:inline">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    currentStep > step.number ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Scope of Work */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-small text-muted-foreground">
                Define the scope of work for {propertyAddress}
              </p>

              {repairDetails && repairDetails.length > 0 && (
                <Card variant="default" padding="sm" className="bg-brand/5 border-brand/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={useAiScope}
                      onCheckedChange={(checked) => {
                        setUseAiScope(!!checked);
                        if (!checked) setScopeItems([]);
                      }}
                    />
                    <Sparkles className="h-4 w-4 text-brand" />
                    <span className="text-small font-medium">Use AI-generated repair estimate</span>
                  </label>
                </Card>
              )}

              {(useAiScope && scopeItems.length > 0) || !useAiScope ? (
                <div className="space-y-3">
                  {scopeItems.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-start p-3 bg-background-secondary rounded-medium">
                      <select
                        value={item.category}
                        onChange={(e) => updateScopeItem(item.id, { category: e.target.value })}
                        className="h-9 px-2 rounded-small border border-border text-small bg-white"
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <Input
                        value={item.description}
                        onChange={(e) => updateScopeItem(item.id, { description: e.target.value })}
                        placeholder="Description"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive"
                        onClick={() => removeScopeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" icon={<Plus />} onClick={addScopeItem}>
                    Add Line Item
                  </Button>
                </div>
              ) : null}

              {!useAiScope && scopeItems.length === 0 && (
                <div className="space-y-2">
                  <Label>Or enter free-form scope</Label>
                  <Textarea
                    value={freeformScope}
                    onChange={(e) => setFreeformScope(e.target.value)}
                    placeholder="Describe the work needed..."
                    rows={6}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Contractors */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-small text-muted-foreground">
                  Select contractors to request bids from ({matchingContractors.length} matching)
                </p>
                <Button variant="ghost" size="sm" onClick={selectAllContractors}>
                  Select All
                </Button>
              </div>

              {matchingContractors.length === 0 ? (
                <Card variant="default" padding="lg" className="text-center">
                  <p className="text-muted-foreground">No matching contractors found.</p>
                </Card>
              ) : (
                <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                  {matchingContractors.map((contractor) => (
                    <label
                      key={contractor.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-medium border cursor-pointer transition-colors",
                        selectedContractorIds.has(contractor.id)
                          ? "border-brand bg-brand/5"
                          : "border-border-subtle hover:bg-background-secondary"
                      )}
                    >
                      <Checkbox
                        checked={selectedContractorIds.has(contractor.id)}
                        onCheckedChange={() => toggleContractor(contractor.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{contractor.name}</span>
                          {contractor.company && (
                            <span className="text-small text-muted-foreground">
                              ({contractor.company})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={contractor.overall_rating} />
                          <span className="text-tiny text-muted-foreground">
                            {contractor.jobs_completed} jobs
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {contractor.specialties?.slice(0, 2).map((spec) => (
                          <Badge key={spec} variant="secondary" size="sm" className="capitalize">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <p className="text-tiny text-muted-foreground">
                💡 Tip: Request at least 3 bids for better comparison
              </p>
            </div>
          )}

          {/* Step 3: Request Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bidNeededBy">Bid Needed By</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="bidNeededBy"
                    type="date"
                    value={bidNeededBy}
                    onChange={(e) => setBidNeededBy(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access">Property Access Instructions</Label>
                <Textarea
                  id="access"
                  value={accessInstructions}
                  onChange={(e) => setAccessInstructions(e.target.value)}
                  placeholder="e.g., Lockbox code is 1234, enter through back gate..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Notes</Label>
                <Textarea
                  id="notes"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="Any additional information for contractors..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Send */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Card variant="default" padding="md" className="bg-muted/30">
                <h3 className="text-body font-semibold mb-3">Summary</h3>
                <div className="space-y-2 text-small">
                  <p>
                    <span className="text-muted-foreground">Property:</span>{" "}
                    <span className="font-medium">{propertyAddress}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Scope Items:</span>{" "}
                    <span className="font-medium">{scopeItems.length || "Free-form"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Bid Due:</span>{" "}
                    <span className="font-medium">{format(new Date(bidNeededBy), "MMM d, yyyy")}</span>
                  </p>
                </div>
              </Card>

              <div>
                <h4 className="text-small font-medium mb-2">
                  Requesting bids from {selectedContractors.length} contractor(s):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedContractors.map((c) => (
                    <Badge key={c.id} variant="secondary" size="md">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Card variant="default" padding="sm" className="bg-info/10 border-info/20">
                <p className="text-small text-info">
                  📧 Bid requests will be created and you can track responses in the property's Bids section.
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-4">
          <Button
            variant="ghost"
            onClick={() => (currentStep === 1 ? onOpenChange(false) : setCurrentStep(currentStep - 1))}
            icon={currentStep > 1 ? <ChevronLeft /> : undefined}
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              icon={<ChevronRight className="ml-1" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={createBid.isPending}
              icon={<Send />}
            >
              {createBid.isPending ? "Sending..." : `Send ${selectedContractors.length} Bid Request(s)`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
