import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Home,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  verdict: "strong" | "moderate" | "weak" | "pass";
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  recommendation: string;
  estimatedProfit: string;
  riskLevel: string;
}

export default function DealAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [formData, setFormData] = useState({
    address: "",
    askingPrice: "",
    arv: "",
    repairEstimate: "",
    propertyType: "single_family",
    exitStrategy: "wholesale",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    if (!formData.address || !formData.askingPrice) {
      toast.error("Please enter at least the address and asking price");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke("ai-deal-analyzer", {
        body: { dealData: formData },
      });

      if (response.error) throw response.error;

      setResult(response.data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze deal. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "strong": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "moderate": return "bg-amber-100 text-amber-700 border-amber-200";
      case "weak": return "bg-orange-100 text-orange-700 border-orange-200";
      case "pass": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Deal Analyzer</h1>
            <p className="text-slate-500">Get instant AI-powered analysis on any deal</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Deal Details</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Property Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, ST 12345"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="askingPrice">Asking Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="askingPrice"
                      className="pl-9"
                      placeholder="150,000"
                      value={formData.askingPrice}
                      onChange={(e) => handleInputChange("askingPrice", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="arv">ARV (After Repair Value)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="arv"
                      className="pl-9"
                      placeholder="220,000"
                      value={formData.arv}
                      onChange={(e) => handleInputChange("arv", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="repairEstimate">Estimated Repairs</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="repairEstimate"
                    className="pl-9"
                    placeholder="35,000"
                    value={formData.repairEstimate}
                    onChange={(e) => handleInputChange("repairEstimate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(v) => handleInputChange("propertyType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_family">Single Family</SelectItem>
                      <SelectItem value="multi_family">Multi Family</SelectItem>
                      <SelectItem value="condo">Condo/Townhouse</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="exitStrategy">Exit Strategy</Label>
                  <Select
                    value={formData.exitStrategy}
                    onValueChange={(v) => handleInputChange("exitStrategy", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                      <SelectItem value="fix_flip">Fix & Flip</SelectItem>
                      <SelectItem value="rental">Buy & Hold</SelectItem>
                      <SelectItem value="brrrr">BRRRR</SelectItem>
                      <SelectItem value="subject_to">Subject-To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional details about the property, seller motivation, condition, etc..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Deal...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Deal
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {!result && !isAnalyzing && (
              <Card className="p-8 flex flex-col items-center justify-center text-center min-h-[400px] bg-slate-50/50">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Home className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Enter Deal Details
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Fill in the property information and click "Analyze Deal" to get AI-powered insights
                </p>
              </Card>
            )}

            {isAnalyzing && (
              <Card className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <Loader2 className="h-12 w-12 text-violet-500 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Analyzing Your Deal...
                </h3>
                <p className="text-slate-500">
                  Our AI is evaluating market conditions, comparable sales, and profitability
                </p>
              </Card>
            )}

            {result && (
              <>
                {/* Verdict Card */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Analysis Result</h3>
                    <Badge className={`text-sm px-3 py-1 capitalize ${getVerdictColor(result.verdict)}`}>
                      {result.verdict} Deal
                    </Badge>
                  </div>
                  
                  {/* Score */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-bold text-slate-900">{result.score}</div>
                    <div className="text-slate-500">/100</div>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-slate-600">{result.summary}</p>
                </Card>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Est. Profit
                    </div>
                    <div className="text-xl font-bold text-emerald-600">{result.estimatedProfit}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Level
                    </div>
                    <div className="text-xl font-bold text-slate-900">{result.riskLevel}</div>
                  </Card>
                </div>

                {/* Pros & Cons */}
                <Card className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Pros
                      </h4>
                      <ul className="space-y-2">
                        {result.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Cons
                      </h4>
                      <ul className="space-y-2">
                        {result.cons.map((con, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Recommendation */}
                <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    AI Recommendation
                  </h4>
                  <p className="text-slate-700">{result.recommendation}</p>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
