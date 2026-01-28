import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Share2,
  Printer,
  Trash2,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  Home,
  Wrench,
  Clock,
  Receipt,
  Wallet,
  FileText,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Calculator,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DealRating, DealMeter, ProfitBreakdown } from "@/components/calculators";

// ----- Utility functions -----
function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return "—";
  return `${value.toFixed(decimals)}%`;
}

function parseCurrency(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, "")) || 0;
}

const statusOptions = [
  { value: "analyzing", label: "Analyzing" },
  { value: "offer_ready", label: "Offer Ready" },
  { value: "offer_sent", label: "Offer Sent" },
  { value: "negotiating", label: "Negotiating" },
  { value: "under_contract", label: "Under Contract" },
  { value: "closed", label: "Closed" },
  { value: "dead", label: "Dead" },
  { value: "archived", label: "Archived" },
];

const propertyTypes = [
  { value: "sfh", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi", label: "Multi-Family" },
  { value: "land", label: "Land" },
];

const financingTypes = [
  { value: "cash", label: "Cash" },
  { value: "hard_money", label: "Hard Money" },
  { value: "private_money", label: "Private Money" },
  { value: "conventional", label: "Conventional" },
  { value: "seller_finance", label: "Seller Finance" },
];

const repairScopes = [
  { value: "light", label: "Light", perSqft: 15 },
  { value: "medium", label: "Medium", perSqft: 35 },
  { value: "heavy", label: "Heavy", perSqft: 55 },
  { value: "gut", label: "Gut Rehab", perSqft: 85 },
];

export default function DealAnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ----- Form state -----
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [notes, setNotes] = useState("");

  // ----- Fetch analysis -----
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ["deal-analysis", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");
      const { data, error } = await supabase
        .from("deal_analyses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // ----- Initialize form when data loads -----
  useEffect(() => {
    if (analysis) {
      setFormData({
        // Property
        address: analysis.address || "",
        city: analysis.city || "",
        state: analysis.state || "",
        zip: analysis.zip || "",
        property_type: analysis.property_type || "sfh",
        beds: analysis.beds ?? "",
        baths: analysis.baths ?? "",
        sqft: analysis.sqft ?? "",
        year_built: analysis.year_built ?? "",
        lot_sqft: analysis.lot_sqft ?? "",
        // Purchase
        asking_price: analysis.asking_price ?? 0,
        purchase_price: analysis.purchase_price ?? 0,
        earnest_money: analysis.earnest_money ?? 2000,
        purchase_closing_pct: analysis.purchase_closing_pct ?? 2,
        purchase_closing_costs: analysis.purchase_closing_costs ?? 0,
        // Financing
        financing_type: analysis.financing_type || "cash",
        down_payment_pct: analysis.down_payment_pct ?? 20,
        interest_rate: analysis.interest_rate ?? 12,
        loan_term_months: analysis.loan_term_months ?? 12,
        loan_points: analysis.loan_points ?? 2,
        loan_origination_fee: analysis.loan_origination_fee ?? 1500,
        // ARV
        arv: analysis.arv ?? 0,
        arv_low: analysis.arv_low ?? 0,
        arv_high: analysis.arv_high ?? 0,
        arv_method: analysis.arv_method || "manual",
        arv_price_per_sqft: analysis.arv_price_per_sqft ?? 0,
        // Repairs
        repair_estimate: analysis.repair_estimate ?? 0,
        repair_contingency_pct: analysis.repair_contingency_pct ?? 10,
        repair_scope: analysis.repair_scope || "medium",
        repair_timeline_weeks: analysis.repair_timeline_weeks ?? 8,
        // Holding
        holding_months: analysis.holding_months ?? 6,
        property_taxes_monthly: analysis.property_taxes_monthly ?? 0,
        insurance_monthly: analysis.insurance_monthly ?? 0,
        utilities_monthly: analysis.utilities_monthly ?? 150,
        hoa_monthly: analysis.hoa_monthly ?? 0,
        lawn_maintenance_monthly: analysis.lawn_maintenance_monthly ?? 75,
        loan_payment_monthly: analysis.loan_payment_monthly ?? 0,
        other_holding_monthly: analysis.other_holding_monthly ?? 0,
        // Selling
        agent_commission_pct: analysis.agent_commission_pct ?? 5,
        seller_closing_costs_pct: analysis.seller_closing_costs_pct ?? 1.5,
        staging_costs: analysis.staging_costs ?? 1500,
        photography_costs: analysis.photography_costs ?? 500,
        marketing_costs: analysis.marketing_costs ?? 0,
        seller_concessions: analysis.seller_concessions ?? 0,
        // Status
        status: analysis.status || "analyzing",
        // Wholesale specific
        assignment_fee: analysis.assignment_fee ?? 10000,
      });
      setNotes(analysis.notes || "");
    }
  }, [analysis]);

  // ----- Calculations -----
  const calculations = useMemo(() => {
    const sqft = Number(formData.sqft) || 0;
    const purchasePrice = Number(formData.purchase_price) || 0;
    const askingPrice = Number(formData.asking_price) || 0;
    const arv = Number(formData.arv) || 0;
    const repairEstimate = Number(formData.repair_estimate) || 0;
    const contingencyPct = Number(formData.repair_contingency_pct) || 0;
    const holdingMonths = Number(formData.holding_months) || 0;
    const financingType = formData.financing_type || "cash";
    
    // Repair total
    const repairContingency = repairEstimate * (contingencyPct / 100);
    const totalRepairs = repairEstimate + repairContingency;
    
    // Financing
    let loanAmount = 0;
    let downPayment = 0;
    let monthlyLoanPayment = 0;
    let totalFinancingCosts = 0;

    if (financingType !== "cash") {
      const downPct = Number(formData.down_payment_pct) || 0;
      downPayment = purchasePrice * (downPct / 100);
      loanAmount = purchasePrice - downPayment;
      const rate = (Number(formData.interest_rate) || 0) / 100 / 12;
      const term = Number(formData.loan_term_months) || 12;
      
      if (rate > 0 && term > 0) {
        monthlyLoanPayment = loanAmount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      }
      
      const points = loanAmount * ((Number(formData.loan_points) || 0) / 100);
      const origination = Number(formData.loan_origination_fee) || 0;
      totalFinancingCosts = points + origination + (monthlyLoanPayment * holdingMonths) - (monthlyLoanPayment * holdingMonths - loanAmount * rate * holdingMonths);
    }

    // Purchase costs
    const purchaseClosingPct = Number(formData.purchase_closing_pct) || 0;
    const purchaseClosingCosts = Number(formData.purchase_closing_costs) || (purchasePrice * (purchaseClosingPct / 100));
    const earnestMoney = Number(formData.earnest_money) || 0;
    const totalPurchaseCost = purchasePrice + purchaseClosingCosts;

    // Holding costs
    const monthlyHolding = 
      (Number(formData.property_taxes_monthly) || 0) +
      (Number(formData.insurance_monthly) || 0) +
      (Number(formData.utilities_monthly) || 0) +
      (Number(formData.hoa_monthly) || 0) +
      (Number(formData.lawn_maintenance_monthly) || 0) +
      (financingType !== "cash" ? monthlyLoanPayment : 0) +
      (Number(formData.other_holding_monthly) || 0);
    const totalHoldingCosts = monthlyHolding * holdingMonths;

    // Selling costs
    const agentCommissionPct = Number(formData.agent_commission_pct) || 0;
    const sellerClosingPct = Number(formData.seller_closing_costs_pct) || 0;
    const agentCommission = arv * (agentCommissionPct / 100);
    const sellerClosing = arv * (sellerClosingPct / 100);
    const staging = Number(formData.staging_costs) || 0;
    const photography = Number(formData.photography_costs) || 0;
    const marketing = Number(formData.marketing_costs) || 0;
    const concessions = Number(formData.seller_concessions) || 0;
    const totalSellingCosts = agentCommission + sellerClosing + staging + photography + marketing + concessions;

    // Total project cost
    const totalProjectCost = totalPurchaseCost + totalRepairs + totalHoldingCosts + totalSellingCosts + (financingType !== "cash" ? (Number(formData.loan_points) || 0) / 100 * loanAmount + (Number(formData.loan_origination_fee) || 0) : 0);

    // Profit
    const grossProfit = arv - totalProjectCost;
    const netProfit = grossProfit;

    // Cash required
    const cashRequired = financingType === "cash" 
      ? totalPurchaseCost + totalRepairs + totalHoldingCosts
      : downPayment + purchaseClosingCosts + totalRepairs + totalHoldingCosts + (Number(formData.loan_points) || 0) / 100 * loanAmount + (Number(formData.loan_origination_fee) || 0);

    // ROI
    const roi = cashRequired > 0 ? (netProfit / cashRequired) * 100 : 0;
    const annualizedRoi = holdingMonths > 0 ? roi * (12 / holdingMonths) : 0;
    const profitPerMonth = holdingMonths > 0 ? netProfit / holdingMonths : 0;

    // MAO calculations
    const mao70 = arv * 0.7 - totalRepairs;
    const mao75 = arv * 0.75 - totalRepairs;
    const mao80 = arv * 0.8 - totalRepairs;
    const maoCustomPct = Number(formData.mao_custom_pct) || 70;
    const maoCustom = arv * (maoCustomPct / 100) - totalRepairs;

    // Spread & equity
    const spread = arv - purchasePrice - totalRepairs;
    const equityCapture = arv - purchasePrice;
    const breakEvenPrice = totalProjectCost;

    // Deal score
    let score = 50;
    if (roi > 20) score += 15;
    else if (roi > 10) score += 5;
    if (netProfit > 25000) score += 15;
    else if (netProfit > 15000) score += 5;
    if (purchasePrice <= mao70) score += 10;
    else if (purchasePrice > mao80) score -= 10;
    if (spread > 50000) score += 10;
    if (holdingMonths <= 6) score += 5;
    score = Math.max(0, Math.min(100, score));

    return {
      totalRepairs,
      repairContingency,
      loanAmount,
      downPayment,
      monthlyLoanPayment,
      totalFinancingCosts,
      purchaseClosingCosts,
      totalPurchaseCost,
      monthlyHolding,
      totalHoldingCosts,
      agentCommission,
      sellerClosing,
      totalSellingCosts,
      totalProjectCost,
      grossProfit,
      netProfit,
      cashRequired,
      roi,
      annualizedRoi,
      profitPerMonth,
      mao70,
      mao75,
      mao80,
      maoCustom,
      maoCustomPct,
      spread,
      equityCapture,
      breakEvenPrice,
      score,
    };
  }, [formData]);

  // ----- Save mutation -----
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!id || !user?.id) throw new Error("Missing data");
      
      const { error } = await supabase
        .from("deal_analyses")
        .update({
          ...formData,
          notes,
          // Calculated values
          total_purchase_cost: calculations.totalPurchaseCost,
          total_repair_cost: calculations.totalRepairs,
          total_holding_cost: calculations.totalHoldingCosts,
          total_selling_cost: calculations.totalSellingCosts,
          total_project_cost: calculations.totalProjectCost,
          gross_profit: calculations.grossProfit,
          net_profit: calculations.netProfit,
          roi_percentage: calculations.roi,
          annualized_roi: calculations.annualizedRoi,
          profit_per_month: calculations.profitPerMonth,
          mao_70_pct: calculations.mao70,
          mao_75_pct: calculations.mao75,
          mao_80_pct: calculations.mao80,
          spread: calculations.spread,
          equity_capture: calculations.equityCapture,
          break_even_price: calculations.breakEvenPrice,
          loan_amount: calculations.loanAmount,
          down_payment_amount: calculations.downPayment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Analysis saved!");
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["deal-analysis", id] });
      queryClient.invalidateQueries({ queryKey: ["deal-analyses"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save");
    },
  });

  // ----- Delete mutation -----
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No ID");
      const { error } = await supabase.from("deal_analyses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Analysis deleted");
      navigate("/tools/market-analyzer");
    },
  });

  // ----- Update field helper -----
  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updateNumericField = (field: string, value: string) => {
    const parsed = parseCurrency(value);
    updateField(field, parsed);
  };

  // ----- Loading / error states -----
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </PageLayout>
    );
  }

  if (error || !analysis) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-semibold mb-2">Analysis not found</h2>
          <p className="text-muted-foreground mb-4">This analysis doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate("/tools/market-analyzer")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Market Analyzer
          </Button>
        </div>
      </PageLayout>
    );
  }

  const isWholesale = analysis.analysis_type === "wholesale";

  return (
    <PageLayout fullWidth>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/tools/market-analyzer")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Market Analyzer
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h2 font-bold">{formData.address || "Untitled"}</h1>
                <Badge variant="secondary" className="capitalize">
                  {analysis.analysis_type?.replace("_", " ") || "Flip"}
                </Badge>
              </div>
              <p className="text-small text-muted-foreground">
                {formData.city}{formData.city && formData.state ? ", " : ""}{formData.state} {formData.zip}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={formData.status} onValueChange={(v) => updateField("status", v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !hasChanges}
              icon={<Save />}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => deleteMutation.mutate()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Three column layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN - Inputs */}
          <div className="lg:col-span-4 space-y-4">
            <Accordion type="multiple" defaultValue={["property", "purchase", "arv", "repairs", "holding", "selling"]} className="space-y-3">
              {/* Property Details */}
              <AccordionItem value="property" className="border rounded-lg px-4">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    <span className="font-medium">Property Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={formData.address || ""}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Type</Label>
                      <Select value={formData.property_type || "sfh"} onValueChange={(v) => updateField("property_type", v)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Year Built</Label>
                      <Input type="number" value={formData.year_built || ""} onChange={(e) => updateField("year_built", e.target.value)} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>Beds</Label>
                      <Input type="number" value={formData.beds || ""} onChange={(e) => updateField("beds", e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Baths</Label>
                      <Input type="number" step="0.5" value={formData.baths || ""} onChange={(e) => updateField("baths", e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>SqFt</Label>
                      <Input type="number" value={formData.sqft || ""} onChange={(e) => updateField("sqft", e.target.value)} className="mt-1" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Purchase */}
              <AccordionItem value="purchase" className="border rounded-lg px-4">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-medium">Purchase</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Asking Price</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          className="pl-7"
                          value={formData.asking_price?.toLocaleString() || ""}
                          onChange={(e) => updateNumericField("asking_price", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Your Offer</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          className="pl-7"
                          value={formData.purchase_price?.toLocaleString() || ""}
                          onChange={(e) => updateNumericField("purchase_price", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Earnest Money</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          className="pl-7"
                          value={formData.earnest_money?.toLocaleString() || ""}
                          onChange={(e) => updateNumericField("earnest_money", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Closing Costs %</Label>
                      <div className="relative mt-1">
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.purchase_closing_pct || ""}
                          onChange={(e) => updateField("purchase_closing_pct", parseFloat(e.target.value) || 0)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Financing</Label>
                    <Select value={formData.financing_type || "cash"} onValueChange={(v) => updateField("financing_type", v)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {financingTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.financing_type !== "cash" && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Down Payment %</Label>
                          <Input type="number" value={formData.down_payment_pct || ""} onChange={(e) => updateField("down_payment_pct", parseFloat(e.target.value) || 0)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Loan Amount</Label>
                          <Input value={formatCurrency(calculations.loanAmount)} disabled className="mt-1 bg-surface-secondary" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Interest Rate %</Label>
                          <Input type="number" step="0.1" value={formData.interest_rate || ""} onChange={(e) => updateField("interest_rate", parseFloat(e.target.value) || 0)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Term (months)</Label>
                          <Input type="number" value={formData.loan_term_months || ""} onChange={(e) => updateField("loan_term_months", parseInt(e.target.value) || 0)} className="mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Points %</Label>
                          <Input type="number" step="0.5" value={formData.loan_points || ""} onChange={(e) => updateField("loan_points", parseFloat(e.target.value) || 0)} className="mt-1" />
                        </div>
                        <div>
                          <Label>Origination Fee</Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input className="pl-7" value={formData.loan_origination_fee?.toLocaleString() || ""} onChange={(e) => updateNumericField("loan_origination_fee", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* ARV */}
              <AccordionItem value="arv" className="border rounded-lg px-4">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-medium">ARV (After Repair Value)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <div>
                    <Label>ARV</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        className="pl-7"
                        value={formData.arv?.toLocaleString() || ""}
                        onChange={(e) => updateNumericField("arv", e.target.value)}
                      />
                    </div>
                  </div>
                  {formData.sqft > 0 && (
                    <div className="text-small text-muted-foreground">
                      ${((formData.arv || 0) / (formData.sqft || 1)).toFixed(0)}/sqft
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>ARV Low</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.arv_low?.toLocaleString() || ""} onChange={(e) => updateNumericField("arv_low", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>ARV High</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.arv_high?.toLocaleString() || ""} onChange={(e) => updateNumericField("arv_high", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate(`/tools/market-analyzer?tab=comps`)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Find Comps
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Repairs */}
              <AccordionItem value="repairs" className="border rounded-lg px-4">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" />
                    <span className="font-medium">Repairs</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <div>
                    <Label>Scope</Label>
                    <Select value={formData.repair_scope || "medium"} onValueChange={(v) => {
                      updateField("repair_scope", v);
                      const scope = repairScopes.find((s) => s.value === v);
                      if (scope && formData.sqft) {
                        updateField("repair_estimate", scope.perSqft * formData.sqft);
                      }
                    }}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {repairScopes.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label} (${s.perSqft}/sqft)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Repair Estimate</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        className="pl-7"
                        value={formData.repair_estimate?.toLocaleString() || ""}
                        onChange={(e) => updateNumericField("repair_estimate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Contingency %</Label>
                      <Input type="number" value={formData.repair_contingency_pct || ""} onChange={(e) => updateField("repair_contingency_pct", parseFloat(e.target.value) || 0)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Timeline (weeks)</Label>
                      <Input type="number" value={formData.repair_timeline_weeks || ""} onChange={(e) => updateField("repair_timeline_weeks", parseInt(e.target.value) || 0)} className="mt-1" />
                    </div>
                  </div>
                  <div className="p-3 bg-surface-secondary rounded-lg text-small">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contingency</span>
                      <span>{formatCurrency(calculations.repairContingency)}</span>
                    </div>
                    <div className="flex justify-between font-medium mt-1">
                      <span>Total Repairs</span>
                      <span>{formatCurrency(calculations.totalRepairs)}</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate(`/tools/market-analyzer?tab=repairs`)}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Open Estimator
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Holding Costs */}
              <AccordionItem value="holding" className="border rounded-lg px-4">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">Holding Costs</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <div>
                    <Label>Hold Period (months)</Label>
                    <Input type="number" value={formData.holding_months || ""} onChange={(e) => updateField("holding_months", parseFloat(e.target.value) || 0)} className="mt-1" />
                  </div>
                  <div className="text-tiny uppercase tracking-wide text-muted-foreground pt-2">Monthly Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Taxes</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.property_taxes_monthly || ""} onChange={(e) => updateNumericField("property_taxes_monthly", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Insurance</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.insurance_monthly || ""} onChange={(e) => updateNumericField("insurance_monthly", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Utilities</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.utilities_monthly || ""} onChange={(e) => updateNumericField("utilities_monthly", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>HOA</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.hoa_monthly || ""} onChange={(e) => updateNumericField("hoa_monthly", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Lawn/Maint.</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.lawn_maintenance_monthly || ""} onChange={(e) => updateNumericField("lawn_maintenance_monthly", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Other</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.other_holding_monthly || ""} onChange={(e) => updateNumericField("other_holding_monthly", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  {formData.financing_type !== "cash" && (
                    <div>
                      <Label>Loan Payment</Label>
                      <Input value={formatCurrency(calculations.monthlyLoanPayment)} disabled className="mt-1 bg-surface-secondary" />
                    </div>
                  )}
                  <div className="p-3 bg-surface-secondary rounded-lg text-small">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Total</span>
                      <span>{formatCurrency(calculations.monthlyHolding)}</span>
                    </div>
                    <div className="flex justify-between font-medium mt-1">
                      <span>Period Total ({formData.holding_months || 0} mo)</span>
                      <span>{formatCurrency(calculations.totalHoldingCosts)}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Selling Costs */}
              <AccordionItem value="selling" className="border rounded-lg px-4">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    <span className="font-medium">Selling Costs</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <div className="text-small text-muted-foreground">
                    Sale Price: {formatCurrency(formData.arv || 0)} (from ARV)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Agent Commission %</Label>
                      <Input type="number" step="0.1" value={formData.agent_commission_pct || ""} onChange={(e) => updateField("agent_commission_pct", parseFloat(e.target.value) || 0)} className="mt-1" />
                    </div>
                    <div>
                      <Label>Closing %</Label>
                      <Input type="number" step="0.1" value={formData.seller_closing_costs_pct || ""} onChange={(e) => updateField("seller_closing_costs_pct", parseFloat(e.target.value) || 0)} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Staging</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.staging_costs || ""} onChange={(e) => updateNumericField("staging_costs", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label>Photo/Marketing</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input className="pl-7" value={formData.photography_costs || ""} onChange={(e) => updateNumericField("photography_costs", e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Concessions</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input className="pl-7" value={formData.seller_concessions || ""} onChange={(e) => updateNumericField("seller_concessions", e.target.value)} />
                    </div>
                  </div>
                  <div className="p-3 bg-surface-secondary rounded-lg text-small">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission ({formData.agent_commission_pct}%)</span>
                      <span>{formatCurrency(calculations.agentCommission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closing ({formData.seller_closing_costs_pct}%)</span>
                      <span>{formatCurrency(calculations.sellerClosing)}</span>
                    </div>
                    <div className="flex justify-between font-medium mt-1 pt-1 border-t">
                      <span>Total</span>
                      <span>{formatCurrency(calculations.totalSellingCosts)}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* MIDDLE COLUMN - Calculations */}
          <div className="lg:col-span-5 space-y-4">
            {/* Deal Summary */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-small text-muted-foreground mb-1">Net Profit</div>
                  <div className={cn(
                    "text-3xl font-bold",
                    calculations.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(calculations.netProfit)}
                  </div>
                </div>
                <DealRating score={calculations.score} size="lg" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/10">
                <div>
                  <div className="text-tiny text-muted-foreground">ROI</div>
                  <div className="text-h3 font-semibold text-primary">{formatPercent(calculations.roi)}</div>
                </div>
                <div>
                  <div className="text-tiny text-muted-foreground">Cash Required</div>
                  <div className="text-h3 font-semibold">{formatCurrency(calculations.cashRequired)}</div>
                </div>
                <div>
                  <div className="text-tiny text-muted-foreground">Profit/Month</div>
                  <div className="text-h3 font-semibold">{formatCurrency(calculations.profitPerMonth)}</div>
                </div>
              </div>
              <div className="text-small text-muted-foreground text-right mt-2">
                Annualized ROI: {formatPercent(calculations.annualizedRoi)}
              </div>
            </Card>

            {/* Cost Breakdown */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Cost Breakdown</h3>
              <ProfitBreakdown
                items={[
                  { label: "Purchase", value: calculations.totalPurchaseCost, color: "bg-blue-500" },
                  { label: "Repairs", value: calculations.totalRepairs, color: "bg-orange-500" },
                  { label: "Holding", value: calculations.totalHoldingCosts, color: "bg-purple-500" },
                  { label: "Selling", value: calculations.totalSellingCosts, color: "bg-pink-500" },
                ]}
                total={calculations.totalProjectCost}
              />
              <div className="flex justify-between mt-4 pt-3 border-t text-small">
                <span className="font-medium">Total Project Cost</span>
                <span className="font-bold">{formatCurrency(calculations.totalProjectCost)}</span>
              </div>
            </Card>

            {/* MAO Calculator */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Maximum Allowable Offer (MAO)</h3>
              <div className="text-tiny text-muted-foreground mb-3">
                MAO = (ARV × %) - Repairs
              </div>
              <table className="w-full text-small">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Rule</th>
                    <th className="text-right py-2 font-medium">MAO</th>
                    <th className="text-right py-2 font-medium">vs Asking</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">70%</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(calculations.mao70)}</td>
                    <td className={cn("py-2 text-right", calculations.mao70 >= (formData.asking_price || 0) ? "text-green-600" : "text-red-600")}>
                      {formatCurrency(calculations.mao70 - (formData.asking_price || 0))}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">75%</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(calculations.mao75)}</td>
                    <td className={cn("py-2 text-right", calculations.mao75 >= (formData.asking_price || 0) ? "text-green-600" : "text-red-600")}>
                      {formatCurrency(calculations.mao75 - (formData.asking_price || 0))}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">80%</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(calculations.mao80)}</td>
                    <td className={cn("py-2 text-right", calculations.mao80 >= (formData.asking_price || 0) ? "text-green-600" : "text-red-600")}>
                      {formatCurrency(calculations.mao80 - (formData.asking_price || 0))}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 p-3 bg-surface-secondary rounded-lg">
                <div className="text-small">
                  <span className="font-medium">Your Offer: </span>
                  {formatCurrency(formData.purchase_price || 0)}
                </div>
                {(formData.purchase_price || 0) > calculations.mao70 && (
                  <div className="flex items-center gap-2 mt-2 text-amber-600 text-small">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{formatCurrency((formData.purchase_price || 0) - calculations.mao70)} over 70% MAO</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Profit Scenarios */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Profit Scenarios</h3>
              
              <div className="mb-4">
                <div className="text-small text-muted-foreground mb-2">If sale price is:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Low", price: formData.arv_low || (formData.arv || 0) * 0.95 },
                    { label: "ARV", price: formData.arv || 0 },
                    { label: "High", price: formData.arv_high || (formData.arv || 0) * 1.05 },
                  ].map((scenario) => {
                    const profit = scenario.price - calculations.totalProjectCost;
                    const scenarioRoi = calculations.cashRequired > 0 ? (profit / calculations.cashRequired) * 100 : 0;
                    return (
                      <div key={scenario.label} className="p-3 bg-surface-secondary rounded-lg text-center">
                        <div className="text-tiny text-muted-foreground">{scenario.label}</div>
                        <div className="text-small font-medium">{formatCurrency(scenario.price)}</div>
                        <div className={cn("text-body font-semibold", profit >= 0 ? "text-green-600" : "text-red-600")}>
                          {formatCurrency(profit)}
                        </div>
                        <div className="text-tiny text-muted-foreground">{formatPercent(scenarioRoi)} ROI</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-small text-muted-foreground mb-2">If repairs go over:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 20, 30].map((pct) => {
                    const overageRepairs = calculations.totalRepairs * (1 + pct / 100);
                    const overageTotal = calculations.totalPurchaseCost + overageRepairs + calculations.totalHoldingCosts + calculations.totalSellingCosts;
                    const overageProfit = (formData.arv || 0) - overageTotal;
                    return (
                      <div key={pct} className="p-3 bg-surface-secondary rounded-lg text-center">
                        <div className="text-tiny text-muted-foreground">+{pct}%</div>
                        <div className={cn("text-body font-semibold", overageProfit >= 0 ? "text-green-600" : "text-red-600")}>
                          {formatCurrency(overageProfit)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Deal Rating Checklist */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Deal Checklist</h3>
                <DealRating score={calculations.score} size="sm" />
              </div>
              <div className="space-y-2">
                {[
                  { label: "ROI > 20%", passed: calculations.roi > 20 },
                  { label: "Profit > $25,000", passed: calculations.netProfit > 25000 },
                  { label: "At or below 70% MAO", passed: (formData.purchase_price || 0) <= calculations.mao70, warning: true },
                  { label: "Spread > $50,000", passed: calculations.spread > 50000 },
                  { label: "Timeline < 6 months", passed: (formData.holding_months || 0) <= 6 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-small">
                    {item.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : item.warning ? (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={item.passed ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN - Comps & Notes */}
          <div className="lg:col-span-3 space-y-4">
            {/* Comps */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Selected Comps</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate(`/tools/market-analyzer?tab=comps`)}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-small text-muted-foreground mb-3">
                No comps selected yet.
              </p>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => navigate(`/tools/market-analyzer?tab=comps`)}>
                Find Comps
              </Button>
            </Card>

            {/* Notes */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Notes</h3>
              <Textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Add notes about this deal..."
                className="min-h-[120px]"
              />
            </Card>

            {/* Activity Log */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Activity</h3>
              <div className="space-y-3 text-small">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  <div>
                    <div className="text-muted-foreground">Created</div>
                    <div>{analysis.created_at ? new Date(analysis.created_at).toLocaleDateString() : "—"}</div>
                  </div>
                </div>
                {analysis.updated_at && analysis.updated_at !== analysis.created_at && (
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted mt-1.5" />
                    <div>
                      <div className="text-muted-foreground">Last updated</div>
                      <div>{new Date(analysis.updated_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
