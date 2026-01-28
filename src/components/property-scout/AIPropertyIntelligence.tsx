import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  CheckCircle,
  BarChart3,
  Home,
  Wrench,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { PropertyLead } from '@/types/property-scout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIAnalysisResult {
  dealScore: number;
  insights: string[];
  estimatedRepairCost: number;
  marketAnalysis: string;
  analyzedAt: string;
  metrics?: {
    arvConfidence: number;
    marketTrend: 'appreciating' | 'stable' | 'declining';
    investmentGrade: string;
    estimatedROI: number;
    comparableSales?: Array<{
      address: string;
      price: number;
      daysAgo: number;
      distance: number;
    }>;
    repairBreakdown?: Array<{
      category: string;
      estimate: number;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
}

interface AIPropertyIntelligenceProps {
  lead: PropertyLead;
  onAnalysisComplete?: (analysis: AIAnalysisResult) => void;
}

export const AIPropertyIntelligence: React.FC<AIPropertyIntelligenceProps> = ({
  lead,
  onAnalysisComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(
    lead.aiAnalysis as AIAnalysisResult | null
  );
  const [error, setError] = useState<string | null>(null);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    // Simulate progress while waiting for AI
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-property-intelligence', {
        body: { property: lead }
      });

      clearInterval(progressInterval);

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setAnalysisProgress(100);
      setAnalysis(data);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }

      toast.success('AI analysis complete!');
    } catch (err) {
      console.error('AI analysis error:', err);
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDealScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-yellow-500';
    return 'text-destructive';
  };

  const getDealScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Deal';
    if (score >= 60) return 'Good Deal';
    return 'Proceed with Caution';
  };

  const getPriorityVariant = (priority: string): 'default' | 'secondary' | 'destructive' => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Property Intelligence
              </CardTitle>
              <CardDescription>
                Advanced AI analysis powered by market data and property insights
              </CardDescription>
            </div>
            
            {!analysis && !isAnalyzing && (
              <Button onClick={runAIAnalysis}>
                <Sparkles className="h-4 w-4 mr-2" />
                Run AI Analysis
              </Button>
            )}

            {isAnalyzing && (
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </span>
                  <span className="font-medium">{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} />
              </div>
            )}
          </div>
        </CardHeader>

        {error && (
          <CardContent>
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={runAIAnalysis} className="ml-auto">
                Retry
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {analysis && (
        <>
          {/* Deal Score */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Deal Score
                </CardTitle>
                <Badge
                  variant={analysis.dealScore >= 70 ? 'default' : 'secondary'}
                  className="text-lg px-4 py-1"
                >
                  {analysis.dealScore}/100
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Overall Rating</p>
                    <p className={`text-xl font-bold ${getDealScoreColor(analysis.dealScore)}`}>
                      {getDealScoreLabel(analysis.dealScore)}
                    </p>
                  </div>
                  <Progress value={analysis.dealScore} className="w-32" />
                </div>

                {analysis.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-muted-foreground text-xs">Investment Grade</p>
                      <p className="font-bold text-lg">{analysis.metrics.investmentGrade}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Est. ROI</p>
                      <p className="font-bold text-lg">{analysis.metrics.estimatedROI}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">ARV Confidence</p>
                      <p className="font-bold text-lg">{analysis.metrics.arvConfidence}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Market Trend</p>
                      <p className="font-bold text-lg capitalize">{analysis.metrics.marketTrend}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="repairs">Repairs</TabsTrigger>
              <TabsTrigger value="comps">Comps</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="repairs" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      Repair Estimates
                    </CardTitle>
                    <Badge variant="outline" className="text-lg">
                      ${analysis.estimatedRepairCost.toLocaleString()} Total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {analysis.metrics?.repairBreakdown ? (
                    <div className="space-y-3">
                      {analysis.metrics.repairBreakdown.map((repair, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{repair.category}</p>
                              <Badge variant={getPriorityVariant(repair.priority)} className="text-xs">
                                {repair.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="font-bold">${repair.estimate.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No repair breakdown available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comps" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    Comparable Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.metrics?.comparableSales ? (
                    <div className="space-y-3">
                      {analysis.metrics.comparableSales.map((comp, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div>
                            <p className="font-medium">{comp.address}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {comp.distance}mi away
                              </span>
                              <span>{comp.daysAgo} days ago</span>
                            </div>
                          </div>
                          <p className="font-bold text-primary">${comp.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No comparable sales available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{analysis.marketAnalysis}</p>

                  {analysis.metrics && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <p className="text-xs text-muted-foreground">Market Trend</p>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="font-bold capitalize">{analysis.metrics.marketTrend}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border bg-muted/30">
                        <p className="text-xs text-muted-foreground">Investment Grade</p>
                        <div className="flex items-center gap-2 mt-1">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="font-bold">{analysis.metrics.investmentGrade}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground pt-2">
                    Analysis generated on {new Date(analysis.analyzedAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Re-run analysis button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={runAIAnalysis} disabled={isAnalyzing}>
              <Sparkles className="h-4 w-4 mr-2" />
              Re-run Analysis
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
