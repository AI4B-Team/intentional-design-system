import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sparkles,
  BarChart3,
  History,
  Home,
  MapPin,
  Calendar,
  TrendingUp,
  Building,
  DollarSign,
  Plus,
  RefreshCw,
  Download,
  Share2,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { AddressInput } from "@/components/deal-analyzer/AddressInput";
import {
  CinematicLoading,
  ARVHero,
  StrategyScorecard,
  EditableMetricsPanel,
} from "@/components/deal-intelligence";
import type { DealIntelligenceResult, EditableMetrics, DealStrategy } from "@/components/deal-intelligence/types";

type ViewState = "input" | "analyzing" | "report";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export default function DealAnalyzer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>("input");
  const [address, setAddress] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");
  const [result, setResult] = useState<DealIntelligenceResult | null>(null);
  const [editableMetrics, setEditableMetrics] = useState<EditableMetrics>({
    arv: 0,
    asIsValue: 0,
    mortgageBalance: 0,
    repairEstimate: 0,
  });

  // Analysis history
  const { data: historyItems, refetch: refetchHistory } = useQuery({
    queryKey: ["deal-analyses-history", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("deal_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleAnalyze = useCallback(async () => {
    if (!address.trim()) {
      toast.error("Please enter a property address");
      return;
    }

    setViewState("analyzing");

    try {
      const response = await supabase.functions.invoke("ai-deal-intelligence", {
        body: {
          address,
          asIsValue: editableMetrics.asIsValue || null,
          arv: editableMetrics.arv || null,
          mortgageBalance: editableMetrics.mortgageBalance || null,
          repairEstimate: editableMetrics.repairEstimate || null,
        },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      const data = response.data as DealIntelligenceResult;
      setResult(data);

      // Set editable metrics from AI response
      setEditableMetrics({
        arv: data.arvAnalysis.arvEstimate,
        asIsValue: data.propertyProfile.estimatedValue,
        mortgageBalance: data.mortgageEstimate.estimatedBalance,
        repairEstimate: data.strategies[0]?.dealNumbers.repairCosts || 25000,
      });

      // Save to deal_analyses
      if (user?.id) {
        const topStrategy = [...data.strategies].sort((a, b) => b.score - a.score)[0];
        await supabase.from("deal_analyses").insert({
          user_id: user.id,
          name: `${address} Intelligence Report`,
          analysis_type: "creative" as any,
          address,
          arv: data.arvAnalysis.arvEstimate,
          purchase_price: topStrategy?.offerPrice || data.propertyProfile.estimatedValue,
          repair_estimate: topStrategy?.dealNumbers.repairCosts || 0,
          net_profit: topStrategy?.projectedProfit || 0,
          roi_percentage: topStrategy ? (topStrategy.projectedProfit / (topStrategy.cashNeeded || 1)) * 100 : 0,
          status: "analyzing",
          beds: data.propertyProfile.beds,
          baths: data.propertyProfile.baths,
          sqft: data.propertyProfile.sqft,
          year_built: data.propertyProfile.yearBuilt,
          property_type: data.propertyProfile.propertyType,
        });
        refetchHistory();
      }

      setViewState("report");
      toast.success("Deal intelligence report ready!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze deal. Please try again.");
      setViewState("input");
    }
  }, [address, editableMetrics, user?.id, refetchHistory]);

  const handleSendOffer = (strategy: DealStrategy) => {
    // Write deal data to localStorage for Offer Blaster
    const offerData = {
      address,
      strategy: strategy.name,
      offerPrice: strategy.offerPrice,
      projectedProfit: strategy.projectedProfit,
      ownerName: "",
      arv: editableMetrics.arv,
      repairEstimate: editableMetrics.repairEstimate,
      mortgageBalance: editableMetrics.mortgageBalance,
      sellerPitch: strategy.sellerPitch,
      closeTimeline: strategy.closeTimeline,
      documents: getDocumentsForStrategy(strategy.name),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("offerBlasterDeal", JSON.stringify(offerData));
    toast.success(`Deal loaded for ${strategy.name} offer — redirecting to Offer Blaster`);
    navigate("/tools/offer-blaster");
  };

  const handleAddToPipeline = async () => {
    if (!user?.id || !result) return;
    try {
      const { error } = await supabase.from("properties").insert({
        user_id: user.id,
        address,
        arv: result.arvAnalysis.arvEstimate,
        asking_price: result.propertyProfile.estimatedValue,
        repair_estimate: editableMetrics.repairEstimate,
        beds: result.propertyProfile.beds,
        baths: result.propertyProfile.baths,
        sqft: result.propertyProfile.sqft,
        year_built: result.propertyProfile.yearBuilt,
        property_type: result.propertyProfile.propertyType,
        status: "new",
        source: "deal_analyzer",
      });
      if (error) throw error;
      toast.success("Property added to pipeline!");
    } catch (error) {
      toast.error("Failed to add to pipeline");
    }
  };

  const handleNewAnalysis = () => {
    setViewState("input");
    setAddress("");
    setResult(null);
    setActiveTab("analysis");
  };

  const verdictColors = {
    strong: "bg-emerald-100 text-emerald-700 border-emerald-200",
    moderate: "bg-amber-100 text-amber-700 border-amber-200",
    weak: "bg-orange-100 text-orange-700 border-orange-200",
    pass: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Deal Intelligence</h1>
              <p className="text-muted-foreground">
                Drop an address, get a complete deal report with 6 exit strategies
              </p>
            </div>
          </div>
          {viewState === "report" && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />}>Export</Button>
              <Button variant="outline" size="sm" icon={<Share2 className="h-4 w-4" />}>Share</Button>
              <Button variant="outline" size="sm" onClick={handleNewAnalysis} icon={<RefreshCw className="h-4 w-4" />}>
                New Analysis
              </Button>
            </div>
          )}
        </div>

        {/* Address Input - Always visible at top */}
        <Card className="p-6">
          <AddressInput
            value={address}
            onChange={setAddress}
            onAnalyze={handleAnalyze}
            isAnalyzing={viewState === "analyzing"}
          />
        </Card>

        {/* Content based on view state */}
        {viewState === "input" && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="analysis" className="gap-2">
                <Sparkles className="h-4 w-4" />
                New Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                Analysis History
                {historyItems && historyItems.length > 0 && (
                  <Badge variant="secondary" size="sm" className="ml-1">{historyItems.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-0">
              {/* Getting Started */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 text-center col-span-full bg-gradient-to-br from-surface-secondary/50 to-background">
                  <div className="max-w-2xl mx-auto">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Enter Any Property Address
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                      Our AI pulls public records, calculates ARV from comparable sales, estimates the mortgage balance, 
                      and scores 6 creative financing strategies — all in under 15 seconds.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
                      {[
                        { icon: Home, label: "Property Profile" },
                        { icon: BarChart3, label: "ARV & Comps" },
                        { icon: DollarSign, label: "Mortgage Estimate" },
                        { icon: TrendingUp, label: "6 Exit Strategies" },
                        { icon: Building, label: "Seller Pitch Scripts" },
                        { icon: ArrowRight, label: "Offer Blaster Bridge" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-small text-muted-foreground">
                          <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <AnalysisHistory
                items={historyItems || []}
                onSelect={(item) => {
                  setAddress(item.address || "");
                  // Re-run analysis for this address
                }}
                onDelete={async (id) => {
                  await supabase.from("deal_analyses").delete().eq("id", id);
                  refetchHistory();
                  toast.success("Analysis deleted");
                }}
              />
            </TabsContent>
          </Tabs>
        )}

        {viewState === "analyzing" && (
          <CinematicLoading address={address} />
        )}

        {viewState === "report" && result && (
          <div className="space-y-6">
            {/* Verdict Banner */}
            <div className="flex items-center gap-4">
              <Badge className={cn("text-sm px-3 py-1 border", verdictColors[result.overallVerdict])}>
                {result.overallVerdict === "strong" ? "🔥 Strong Deal" :
                 result.overallVerdict === "moderate" ? "⚡ Moderate Deal" :
                 result.overallVerdict === "weak" ? "⚠️ Weak Deal" : "🚫 Pass"}
              </Badge>
              <span className="text-muted-foreground text-small">{result.summary}</span>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleAddToPipeline} icon={<Plus className="h-4 w-4" />}>
                  Add to Pipeline
                </Button>
              </div>
            </div>

            {/* Property Profile Bar */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-4 text-small">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{address}</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{result.propertyProfile.beds} bed / {result.propertyProfile.baths} bath</span>
                  <span>{result.propertyProfile.sqft?.toLocaleString()} sqft</span>
                  <span>Built {result.propertyProfile.yearBuilt}</span>
                  <span className="capitalize">{result.propertyProfile.propertyType}</span>
                  <Badge variant={result.propertyProfile.marketTrend === "appreciating" ? "success" : result.propertyProfile.marketTrend === "stable" ? "secondary" : "warning"} size="sm">
                    {result.propertyProfile.marketTrend === "appreciating" ? "↑" : result.propertyProfile.marketTrend === "stable" ? "→" : "↓"} {result.propertyProfile.marketTrend}
                  </Badge>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-tiny text-muted-foreground">Mortgage Est.</div>
                    <div className="font-semibold text-foreground tabular-nums">{fmt(result.mortgageEstimate.estimatedBalance)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-tiny text-muted-foreground">{result.mortgageEstimate.estimatedRate}% / {result.mortgageEstimate.loanType}</div>
                    <div className="font-medium text-muted-foreground tabular-nums">{fmt(result.mortgageEstimate.estimatedPayment)}/mo</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Main Content */}
            <div className="grid lg:grid-cols-[1fr_280px] gap-6">
              <div className="space-y-6">
                {/* ARV Hero */}
                <ARVHero arvAnalysis={result.arvAnalysis} />

                {/* Strategy Scorecards */}
                <StrategyScorecard
                  strategies={result.strategies}
                  address={address}
                  onSendOffer={handleSendOffer}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Editable Metrics */}
                <EditableMetricsPanel
                  metrics={editableMetrics}
                  onChange={(updated) => {
                    setEditableMetrics(updated);
                    toast.info("Metrics updated — re-analyze to recalculate strategies");
                  }}
                />

                {/* Overall Score */}
                <Card className="p-4 text-center">
                  <div className="text-tiny text-muted-foreground uppercase tracking-wide mb-1">Deal Score</div>
                  <div className="text-4xl font-bold text-foreground">{result.overallScore}</div>
                  <div className="text-tiny text-muted-foreground">/100</div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        result.overallScore >= 70 ? "bg-emerald-500" : result.overallScore >= 50 ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${result.overallScore}%` }}
                    />
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-4 space-y-2">
                  <h4 className="text-small font-semibold text-foreground">Quick Actions</h4>
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleAddToPipeline}>
                    <Plus className="h-4 w-4 mr-2" /> Add to Pipeline
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={handleNewAnalysis}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Re-Analyze with Updated Metrics
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => {
                    const top = [...result.strategies].sort((a, b) => b.score - a.score)[0];
                    if (top) handleSendOffer(top);
                  }}>
                    <ArrowRight className="h-4 w-4 mr-2" /> Send Top Strategy Offer
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ---------- Analysis History Component ----------

function AnalysisHistory({
  items,
  onSelect,
  onDelete,
}: {
  items: any[];
  onSelect: (item: any) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
          <History className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Analyses Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter a property address above to create your first deal intelligence report.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card
          key={item.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(item)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{item.address || item.name}</div>
                <div className="flex items-center gap-3 text-tiny text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                  {item.arv && <span>ARV: {fmt(Number(item.arv))}</span>}
                  {item.net_profit && (
                    <span className={Number(item.net_profit) > 0 ? "text-emerald-600" : "text-red-600"}>
                      Profit: {fmt(Number(item.net_profit))}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            >
              ×
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ---------- Helpers ----------

function getDocumentsForStrategy(strategyName: string): string[] {
  const docs: Record<string, string[]> = {
    "Novation": ["LOI", "Novation Agreement", "POF"],
    "Subject-To": ["LOI", "Subject-To Agreement", "POF"],
    "Hybrid": ["LOI", "Novation Agreement", "Subject-To Addendum", "POF"],
    "Seller Finance": ["LOI", "Seller Finance Agreement", "POF"],
    "Wholesale": ["LOI", "Assignment Contract", "POF"],
    "Fix & Flip": ["LOI", "Purchase Agreement", "POF"],
  };
  return docs[strategyName] || ["LOI", "POF"];
}
