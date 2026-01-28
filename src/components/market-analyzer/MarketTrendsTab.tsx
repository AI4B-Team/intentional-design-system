import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Home,
  DollarSign,
  Users,
  Building2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MarketData {
  marketScore: number;
  trend: "hot" | "warm" | "neutral" | "cooling" | "cold";
  summary: string;
  medianPrice: string;
  priceChange: string;
  daysOnMarket: number;
  inventory: string;
  demandLevel: string;
  investorActivity: string;
  topStrategies: string[];
  opportunities: string[];
  risks: string[];
  forecast: string;
}

export function MarketTrendsTab() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MarketData | null>(null);
  
  const [formData, setFormData] = useState({
    location: "",
    radius: "5",
    propertyType: "single_family",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    if (!formData.location) {
      toast.error("Please enter a location");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await supabase.functions.invoke("ai-market-analyzer", {
        body: { marketData: formData },
      });

      if (response.error) throw response.error;

      setResult(response.data);
      toast.success("Market analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze market. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "hot": return "bg-red-100 text-red-700";
      case "warm": return "bg-orange-100 text-orange-700";
      case "neutral": return "bg-slate-100 text-slate-700";
      case "cooling": return "bg-blue-100 text-blue-700";
      case "cold": return "bg-cyan-100 text-cyan-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="location">Location (City, ZIP, or Address)</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                className="pl-9"
                placeholder="Enter city, ZIP code, or address..."
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
          </div>
          <div className="w-32">
            <Label htmlFor="radius">Radius (miles)</Label>
            <Input
              id="radius"
              type="number"
              className="mt-1"
              value={formData.radius}
              onChange={(e) => handleInputChange("radius", e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Market
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {!result && !isAnalyzing && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-h3 font-semibold text-foreground mb-2">
            Enter a Location to Analyze
          </h3>
          <p className="text-body text-muted-foreground max-w-md">
            Get AI-powered insights on market conditions, pricing trends, investment opportunities, and more.
          </p>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-h3 font-semibold text-foreground mb-2">
            Analyzing Market...
          </h3>
          <p className="text-body text-muted-foreground">
            Gathering data on pricing, inventory, trends, and investor activity
          </p>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Market Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 font-semibold">Market Overview</h3>
              <Badge className={`text-sm px-3 py-1 capitalize ${getTrendColor(result.trend)}`}>
                {result.trend} Market
              </Badge>
            </div>
            
            {/* Score */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-foreground">{result.marketScore}</div>
              <div className="text-muted-foreground">/100</div>
              <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                  style={{ width: `${result.marketScore}%` }}
                />
              </div>
            </div>

            <p className="text-muted-foreground">{result.summary}</p>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-small text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Median Price
              </div>
              <div className="text-xl font-bold text-foreground">{result.medianPrice}</div>
              <div className={`text-small flex items-center gap-1 mt-1 ${result.priceChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {result.priceChange.startsWith('+') ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {result.priceChange} YoY
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-small text-muted-foreground mb-1">
                <Home className="h-4 w-4" />
                Days on Market
              </div>
              <div className="text-xl font-bold text-foreground">{result.daysOnMarket}</div>
              <div className="text-small text-muted-foreground mt-1">Average</div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-small text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                Inventory
              </div>
              <div className="text-xl font-bold text-foreground">{result.inventory}</div>
              <div className="text-small text-muted-foreground mt-1">Active Listings</div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 text-small text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                Demand Level
              </div>
              <div className="text-xl font-bold text-foreground">{result.demandLevel}</div>
              <div className="text-small text-muted-foreground mt-1">Buyer Activity</div>
            </Card>
          </div>

          {/* Strategies & Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold text-foreground mb-4">Top Investment Strategies</h4>
              <div className="flex flex-wrap gap-2">
                {result.topStrategies.map((strategy, i) => (
                  <Badge key={i} variant="secondary" className="bg-primary/10 text-primary">
                    {strategy}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-semibold text-foreground mb-4">Investor Activity</h4>
              <p className="text-muted-foreground">{result.investorActivity}</p>
            </Card>
          </div>

          {/* Opportunities & Risks */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-green-200 bg-green-50/50">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Opportunities
              </h4>
              <ul className="space-y-2">
                {result.opportunities.map((item, i) => (
                  <li key={i} className="text-small text-muted-foreground flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-amber-200 bg-amber-50/50">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-600" />
                Risks to Watch
              </h4>
              <ul className="space-y-2">
                {result.risks.map((item, i) => (
                  <li key={i} className="text-small text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Forecast */}
          <Card className="p-6 bg-gradient-to-br from-surface-secondary to-surface-tertiary/50">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              12-Month Forecast
            </h4>
            <p className="text-muted-foreground">{result.forecast}</p>
          </Card>
        </>
      )}
    </div>
  );
}
