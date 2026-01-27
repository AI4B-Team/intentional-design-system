import * as React from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Camera,
  Save,
  Check,
  TrendingUp,
  Target,
} from "lucide-react";
import { usePropertyComps, useDeleteComp } from "@/hooks/usePropertyComps";
import { usePropertyTitleReport, calculateTitleMetrics, type TitleReportSummary } from "@/hooks/useTitleReports";
import { useProperty, useUpdateProperty } from "@/hooks/useProperty";
import { AddCompModal } from "./add-comp-modal";
import { AddRepairModal } from "./add-repair-modal";
import { BidsSection } from "@/components/contractors/bids-section";
import { format } from "date-fns";
import { toast } from "sonner";
import { AIAnalysisButton, AIBadge, ARVAnalysisModal, RepairEstimateModal, OfferRecommendationModal, ExitStrategyModal } from "@/components/ai";
import {
  calculateARV,
  estimateRepairs,
  generateOfferRecommendation,
  analyzeExitStrategies,
  type ARVAnalysis,
  type RepairEstimate,
  type OfferRecommendation,
  type ExitStrategyAnalysis,
  type PropertyAnalysisInput,
} from "@/lib/ai-analysis";

interface UnderwritingTabProps {
  property: {
    arv?: number;
    repairs?: number;
  };
}

interface RepairItem {
  category: string;
  description: string;
  cost: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getRatingVariant(rating: string | null): "success" | "warning" | "secondary" {
  switch (rating?.toLowerCase()) {
    case "strong":
      return "success";
    case "moderate":
      return "warning";
    default:
      return "secondary";
  }
}

function getConfidenceVariant(confidence: string | null): "success" | "warning" | "secondary" {
  switch (confidence?.toUpperCase()) {
    case "HIGH":
      return "success";
    case "MEDIUM":
      return "warning";
    default:
      return "secondary";
  }
}

export function UnderwritingTab({ property: propFromParent }: UnderwritingTabProps) {
  const { id } = useParams();
  const { data: property, isLoading: propertyLoading } = useProperty(id);
  const { data: comps, isLoading: compsLoading } = usePropertyComps(id);
  const { data: titleReport } = usePropertyTitleReport(id);
  const deleteComp = useDeleteComp();
  const updateProperty = useUpdateProperty();

  const [showAddCompModal, setShowAddCompModal] = React.useState(false);
  const [showAddRepairModal, setShowAddRepairModal] = React.useState(false);
  const [editingRepair, setEditingRepair] = React.useState<{ category: string; description: string; cost: number; index: number } | null>(null);
  
  const [arvConfidence, setArvConfidence] = React.useState<string>("MEDIUM");
  const [arvPercentage, setArvPercentage] = React.useState(68);
  const [wholesaleFee, setWholesaleFee] = React.useState(10000);
  const [holdingCosts, setHoldingCosts] = React.useState(0);
  const [adjustForTitleIssues, setAdjustForTitleIssues] = React.useState(false);
  
  // Repair items from property or local state
  const [repairItems, setRepairItems] = React.useState<RepairItem[]>([]);
  
  // AI Analysis state
  const [arvAnalysis, setArvAnalysis] = React.useState<ARVAnalysis | null>(null);
  const [repairAnalysis, setRepairAnalysis] = React.useState<RepairEstimate | null>(null);
  const [offerAnalysis, setOfferAnalysis] = React.useState<OfferRecommendation | null>(null);
  const [exitAnalysis, setExitAnalysis] = React.useState<ExitStrategyAnalysis | null>(null);
  const [showArvModal, setShowArvModal] = React.useState(false);
  const [showRepairModal, setShowRepairModal] = React.useState(false);
  const [showOfferModal, setShowOfferModal] = React.useState(false);
  const [showExitModal, setShowExitModal] = React.useState(false);

  // Initialize from property data
  React.useEffect(() => {
    if (property) {
      setArvConfidence(property.arv_confidence || "MEDIUM");
      if (property.repair_details && Array.isArray(property.repair_details)) {
        setRepairItems(property.repair_details as unknown as RepairItem[]);
      }
    }
  }, [property]);

  const arv = property?.arv ? Number(property.arv) : propFromParent.arv || 0;
  const totalRepairs = repairItems.reduce((sum, item) => sum + item.cost, 0);
  
  // Title adjustment calculation
  const titleSummary = titleReport?.summary as TitleReportSummary | null;
  const titleMetrics = calculateTitleMetrics(titleSummary, arv);
  const titleAdjustment = adjustForTitleIssues ? titleMetrics.costToClear : 0;

  // MAO Calculations
  const calculateMAO = (percentage: number) => {
    return (arv * (percentage / 100)) - totalRepairs - wholesaleFee - holdingCosts - titleAdjustment;
  };

  const maoAggressive = calculateMAO(70);
  const maoStandard = calculateMAO(68);
  const maoConservative = calculateMAO(65);

  const handleDeleteComp = (compId: string) => {
    if (!id) return;
    deleteComp.mutate({ id: compId, propertyId: id });
  };

  const handleAddRepair = (repair: { category: string; description: string; cost: number }) => {
    if (editingRepair !== null) {
      const newItems = [...repairItems];
      newItems[editingRepair.index] = repair;
      setRepairItems(newItems);
      setEditingRepair(null);
    } else {
      setRepairItems([...repairItems, repair]);
    }
  };

  const handleEditRepair = (index: number) => {
    const repair = repairItems[index];
    setEditingRepair({ ...repair, index });
    setShowAddRepairModal(true);
  };

  const handleDeleteRepair = (index: number) => {
    setRepairItems(repairItems.filter((_, i) => i !== index));
  };

  const handleSaveRepairs = () => {
    if (!id) return;
    updateProperty.mutate({
      id,
      updates: {
        repair_details: JSON.parse(JSON.stringify(repairItems)),
        repair_estimate: totalRepairs,
      },
    });
  };

  const handleSaveMAO = () => {
    if (!id) return;
    updateProperty.mutate({
      id,
      updates: {
        mao_aggressive: maoAggressive,
        mao_standard: maoStandard,
        mao_conservative: maoConservative,
      },
    });
  };

  const handleUseOffer = (type: "aggressive" | "standard" | "conservative", value: number) => {
    if (!id) return;
    const updateKey = `mao_${type}` as const;
    updateProperty.mutate({
      id,
      updates: { [updateKey]: value },
    });
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} MAO set to ${formatCurrency(value)}`);
  };

  // Build AI analysis input
  const buildAnalysisInput = (): PropertyAnalysisInput => ({
    property: {
      id: id || "",
      address: property?.address || "",
      city: property?.city,
      state: property?.state,
      zip: property?.zip,
      beds: property?.beds,
      baths: property?.baths,
      sqft: property?.sqft,
      year_built: property?.year_built,
      property_type: property?.property_type,
      estimated_value: property?.estimated_value ? Number(property.estimated_value) : undefined,
      arv: arv,
      repair_estimate: totalRepairs,
      mortgage_balance: property?.mortgage_balance ? Number(property.mortgage_balance) : undefined,
      equity_percent: property?.equity_percent ? Number(property.equity_percent) : undefined,
      owner_name: property?.owner_name,
      distress_signals: property?.distress_signals,
      motivation_score: property?.motivation_score ? Number(property.motivation_score) : undefined,
    },
    comps: comps?.map(c => ({
      id: c.id,
      comp_address: c.comp_address,
      sale_price: c.sale_price ? Number(c.sale_price) : null,
      sqft: c.sqft,
      beds: c.beds,
      baths: c.baths,
      sale_date: c.sale_date,
      distance_miles: c.distance_miles ? Number(c.distance_miles) : null,
      adjusted_value: c.adjusted_value ? Number(c.adjusted_value) : null,
      adjustments: c.adjustments,
      rating: c.rating,
    })),
  });

  const handleRunARVAnalysis = async () => {
    const input = buildAnalysisInput();
    const result = await calculateARV(input);
    setArvAnalysis(result);
    setShowArvModal(true);
  };

  const handleRunRepairAnalysis = async () => {
    const input = buildAnalysisInput();
    const result = await estimateRepairs(input);
    setRepairAnalysis(result);
    setShowRepairModal(true);
  };

  const handleRunOfferAnalysis = async () => {
    const input = buildAnalysisInput();
    const result = await generateOfferRecommendation(input);
    setOfferAnalysis(result);
    setShowOfferModal(true);
  };

  const handleRunExitAnalysis = async () => {
    const input = buildAnalysisInput();
    const result = await analyzeExitStrategies(input, {});
    setExitAnalysis(result);
    setShowExitModal(true);
  };

  if (propertyLoading) {
    return (
      <div className="p-lg space-y-lg">
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-lg space-y-lg">
      {/* ARV Section */}
      <Card variant="default" padding="none">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-0 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <CardTitle className="text-h3 font-medium">After Repair Value (ARV)</CardTitle>
            <Badge variant={getConfidenceVariant(arvConfidence)} size="sm">
              {arvConfidence}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-display font-semibold text-foreground tabular-nums">
              {arv ? formatCurrency(arv) : "Not Set"}
            </span>
            <AIAnalysisButton 
              onClick={handleRunARVAnalysis} 
              label="AI ARV Analysis"
              showBadge={false}
            />
            <Button variant="ghost" size="sm" icon={<Plus />} onClick={() => setShowAddCompModal(true)}>
              Add Comp
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Comps Table */}
          {compsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : !comps || comps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No comps added yet</p>
              <p className="text-small">Add manually or run AI analysis to find comparable sales.</p>
            </div>
          ) : (
            <div className="rounded-medium border border-border-subtle overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                      Address
                    </th>
                    <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                      Sale Price
                    </th>
                    <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                      Sale Date
                    </th>
                    <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                      Bed/Bath
                    </th>
                    <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                      SqFt
                    </th>
                    <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                      Distance
                    </th>
                    <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                      Adjusted
                    </th>
                    <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                      Rating
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((comp, index) => (
                    <tr
                      key={comp.id}
                      className={cn(
                        "h-12 transition-colors",
                        index % 2 === 0 ? "bg-white" : "bg-surface-secondary/30",
                        "hover:bg-accent/5"
                      )}
                    >
                      <td className="px-4 text-body font-medium text-foreground">
                        {comp.comp_address}
                      </td>
                      <td className="px-4 text-right text-body tabular-nums">
                        {comp.sale_price ? formatCurrency(Number(comp.sale_price)) : "—"}
                      </td>
                      <td className="px-4 text-center text-small text-muted-foreground">
                        {comp.sale_date ? format(new Date(comp.sale_date), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 text-center text-small text-muted-foreground">
                        {comp.beds || "—"}/{comp.baths || "—"}
                      </td>
                      <td className="px-4 text-right text-small text-muted-foreground tabular-nums">
                        {comp.sqft?.toLocaleString() || "—"}
                      </td>
                      <td className="px-4 text-right text-small text-muted-foreground">
                        {comp.distance_miles ? `${comp.distance_miles} mi` : "—"}
                      </td>
                      <td className="px-4 text-right text-body tabular-nums font-medium">
                        {comp.adjusted_value ? formatCurrency(Number(comp.adjusted_value)) : "—"}
                      </td>
                      <td className="px-4 text-center">
                        <Badge variant={getRatingVariant(comp.rating)} size="sm">
                          {comp.rating || "—"}
                        </Badge>
                      </td>
                      <td className="px-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-background-secondary rounded-small transition-colors">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 bg-white">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteComp(comp.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Repairs Section */}
      <Card variant="default" padding="none">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-0 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <CardTitle className="text-h3 font-medium">Repair Estimate</CardTitle>
            <Badge variant="secondary" size="sm">
              {repairItems.length} items
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-display font-semibold text-foreground tabular-nums">
              {formatCurrency(totalRepairs)}
            </span>
            <AIAnalysisButton 
              onClick={handleRunRepairAnalysis} 
              label="AI Estimate"
              showBadge={false}
              icon={<Camera />}
            />
            <Button variant="ghost" size="sm" icon={<Plus />} onClick={() => { setEditingRepair(null); setShowAddRepairModal(true); }}>
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {repairItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No repair items added yet</p>
              <p className="text-small">Add itemized repairs to calculate total estimate.</p>
            </div>
          ) : (
            <>
              <div className="rounded-medium border border-border-subtle overflow-hidden">
                <table className="w-full">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-muted-foreground">
                        Cost
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairItems.map((item, index) => (
                      <tr
                        key={index}
                        className={cn(
                          "h-12 transition-colors",
                          index % 2 === 0 ? "bg-white" : "bg-surface-secondary/30"
                        )}
                      >
                        <td className="px-4 text-body font-medium text-foreground">
                          {item.category}
                        </td>
                        <td className="px-4 text-small text-muted-foreground">
                          {item.description || "—"}
                        </td>
                        <td className="px-4 text-right text-body tabular-nums font-medium">
                          {formatCurrency(item.cost)}
                        </td>
                        <td className="px-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-background-secondary rounded-small transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-32 bg-white">
                              <DropdownMenuItem onClick={() => handleEditRepair(index)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRepair(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {/* Subtotal Row */}
                    <tr className="bg-background-secondary border-t border-border">
                      <td className="px-4 py-3 text-body font-semibold" colSpan={2}>
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-body font-bold tabular-nums text-accent">
                        {formatCurrency(totalRepairs)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="secondary" size="sm" icon={<Save />} onClick={handleSaveRepairs}>
                  Save Repairs
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contractor Bids Section */}
      <Card variant="default" padding="md">
        <BidsSection 
          propertyId={id || ""}
          propertyAddress={property?.address || ""}
          repairDetails={repairItems}
        />
      </Card>

      {/* MAO Calculator Section */}
      <Card variant="default" padding="none">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-0 flex-wrap gap-3">
          <CardTitle className="text-h3 font-medium">Maximum Allowable Offer (MAO)</CardTitle>
          <div className="flex items-center gap-2">
            <AIAnalysisButton 
              onClick={handleRunOfferAnalysis} 
              label="AI Offer Analysis"
              showBadge={false}
              icon={<Target />}
            />
            <AIAnalysisButton 
              onClick={handleRunExitAnalysis} 
              label="Exit Strategies"
              showBadge={false}
              icon={<TrendingUp />}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Input Fields */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label className="text-small text-muted-foreground">ARV</Label>
              <div className="text-h3 font-semibold text-foreground tabular-nums mt-1">
                {arv ? formatCurrency(arv) : "—"}
              </div>
            </div>
            <div>
              <Label className="text-small text-muted-foreground">Repairs</Label>
              <div className="text-h3 font-semibold text-foreground tabular-nums mt-1">
                {formatCurrency(totalRepairs)}
              </div>
            </div>
            <div>
              <Label htmlFor="wholesaleFee" className="text-small text-muted-foreground">Wholesale Fee</Label>
              <Input
                id="wholesaleFee"
                type="number"
                value={wholesaleFee}
                onChange={(e) => setWholesaleFee(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="holdingCosts" className="text-small text-muted-foreground">Holding Costs</Label>
              <Input
                id="holdingCosts"
                type="number"
                value={holdingCosts}
                onChange={(e) => setHoldingCosts(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            {/* Title Issues Adjustment */}
            {titleMetrics.costToClear > 0 && (
              <div className="mt-4 p-4 bg-warning/5 border border-warning/20 rounded-medium">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-small font-medium text-content">Adjust for Title Issues</span>
                    <Badge variant="warning" size="sm">{formatCurrency(titleMetrics.costToClear)}</Badge>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={adjustForTitleIssues}
                      onChange={(e) => setAdjustForTitleIssues(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-small text-content-secondary">Enable</span>
                  </label>
                </div>
                {adjustForTitleIssues && (
                  <p className="text-small text-warning">
                    MAO adjusted for {formatCurrency(titleMetrics.costToClear)} in liens/title issues
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ARV Percentage Slider */}
          <div className="mb-6 p-4 bg-background-secondary rounded-medium">
            <div className="flex items-center justify-between mb-3">
              <span className="text-small text-muted-foreground">ARV Percentage</span>
              <span className="text-body font-semibold text-foreground tabular-nums">{arvPercentage}%</span>
            </div>
            <Slider
              value={[arvPercentage]}
              onValueChange={([v]) => setArvPercentage(v)}
              min={60}
              max={75}
              step={1}
            />
            <div className="flex justify-between text-tiny text-muted-foreground mt-2">
              <span>60%</span>
              <span>75%</span>
            </div>
            <div className="mt-3 text-center">
              <span className="text-small text-muted-foreground">Custom MAO at {arvPercentage}%: </span>
              <span className="text-h3 font-bold text-accent tabular-nums">
                {formatCurrency(calculateMAO(arvPercentage))}
              </span>
            </div>
          </div>

          {/* Offer Level Cards */}
          <div className="space-y-3">
            {[
              { level: "Aggressive", percentage: 70, amount: maoAggressive, type: "aggressive" as const },
              { level: "Standard", percentage: 68, amount: maoStandard, type: "standard" as const, recommended: true },
              { level: "Conservative", percentage: 65, amount: maoConservative, type: "conservative" as const },
            ].map((offer) => {
              const spread = arv - totalRepairs - offer.amount;
              return (
                <div
                  key={offer.level}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-medium border transition-all",
                    offer.recommended
                      ? "border-accent bg-accent/5"
                      : "border-border-subtle bg-white hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {offer.recommended && (
                      <Check className="h-5 w-5 text-accent" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-body font-medium text-foreground">{offer.level}</span>
                        {offer.recommended && (
                          <Badge variant="default" size="sm">Recommended</Badge>
                        )}
                      </div>
                      <span className="text-small text-muted-foreground">{offer.percentage}% of ARV</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-h2 font-semibold text-foreground tabular-nums">
                        {formatCurrency(offer.amount)}
                      </div>
                      <div className={cn(
                        "text-small tabular-nums",
                        spread > 0 ? "text-success" : "text-destructive"
                      )}>
                        Spread: {formatCurrency(spread)}
                      </div>
                    </div>
                    <Button
                      variant={offer.recommended ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleUseOffer(offer.type, offer.amount)}
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save All Button */}
          <div className="flex justify-end mt-6">
            <Button variant="primary" size="sm" icon={<Save />} onClick={handleSaveMAO}>
              Save MAO Values
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddCompModal
        open={showAddCompModal}
        onOpenChange={setShowAddCompModal}
        propertyId={id || ""}
      />
      <AddRepairModal
        open={showAddRepairModal}
        onOpenChange={setShowAddRepairModal}
        onAdd={handleAddRepair}
        editingRepair={editingRepair}
      />
      
      {/* AI Analysis Modals */}
      <ARVAnalysisModal 
        isOpen={showArvModal}
        onClose={() => setShowArvModal(false)}
        data={arvAnalysis}
      />
      <RepairEstimateModal
        isOpen={showRepairModal}
        onClose={() => setShowRepairModal(false)}
        data={repairAnalysis}
      />
      <OfferRecommendationModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        data={offerAnalysis}
      />
      <ExitStrategyModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        data={exitAnalysis}
      />
    </div>
  );
}
