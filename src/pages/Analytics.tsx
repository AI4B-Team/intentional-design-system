import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DateRangeSelector,
  AnalyticsStatCard,
  FunnelChart,
  DealFlowChart,
  DonutChart,
  AIInsightsCard,
  AnalyticsTable,
} from "@/components/analytics";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { subDays, startOfMonth, startOfQuarter, startOfYear, formatDistanceToNow } from "date-fns";
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
  Send,
  Wallet,
  Loader2,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  Archive,
  Lightbulb,
  Trophy,
  Zap,
} from "lucide-react";
import {
  useOverviewAnalytics,
  usePipelineAnalytics,
  useSourceAnalytics,
  useDealFlowTimeSeries,
  useMarketingAnalytics,
  useFinancialAnalytics,
  useAIInsights,
  useStalledDeals,
  useSourceRecommendations,
  type DateRange,
} from "@/hooks/useAnalytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// ============ OVERVIEW TAB ============

function OverviewTab({ dateRange }: { dateRange: DateRange }) {
  const navigate = useNavigate();
  const { data: overview, isLoading: overviewLoading } = useOverviewAnalytics(dateRange);
  const { data: pipelineData, isLoading: pipelineLoading } = usePipelineAnalytics();
  const { data: sources, isLoading: sourcesLoading } = useSourceAnalytics(dateRange);
  const { data: dealFlow, isLoading: dealFlowLoading } = useDealFlowTimeSeries(dateRange);
  const insights = useAIInsights(overview);

  const isLoading = overviewLoading || pipelineLoading;

  // Format stats for display
  const statsData = overview ? [
    {
      title: "Leads Generated",
      value: overview.leads.value,
      change: overview.leads.change,
      icon: <Users className="h-5 w-5 text-brand-accent" />,
    },
    {
      title: "Appointments Set",
      value: overview.appointments.value,
      change: overview.appointments.change,
      subtitle: overview.appointments.conversionRate ? `${overview.appointments.conversionRate}% from leads` : undefined,
      icon: <Calendar className="h-5 w-5 text-info" />,
    },
    {
      title: "Offers Made",
      value: overview.offers.value,
      change: overview.offers.change,
      subtitle: overview.offers.conversionRate ? `${overview.offers.conversionRate}% from appts` : undefined,
      icon: <FileText className="h-5 w-5 text-warning" />,
    },
    {
      title: "Under Contract",
      value: overview.contracts.value,
      change: overview.contracts.change,
      subtitle: overview.contracts.conversionRate ? `${overview.contracts.conversionRate}% from offers` : undefined,
      icon: <Target className="h-5 w-5 text-chart-4" />,
    },
    {
      title: "Deals Closed",
      value: overview.closed.value,
      change: overview.closed.change,
      subtitle: overview.closed.conversionRate ? `${overview.closed.conversionRate}% from contracts` : undefined,
      icon: <DollarSign className="h-5 w-5 text-success" />,
    },
    {
      title: "Total Profit",
      value: overview.profit.value,
      change: overview.profit.change,
      format: "currency" as const,
      icon: <TrendingUp className="h-5 w-5 text-success" />,
    },
  ] : [];

  // Format funnel data
  const funnelData = pipelineData?.stages ? pipelineData.stages.map((stage) => ({
    name: stage.name,
    count: stage.count,
    value: stage.value,
    conversionRate: stage.conversionRate,
  })) : [];

  // Format source data for pie chart
  const sourceChartData = sources ? sources.slice(0, 6).map((s) => ({
    name: s.name || "Unknown",
    value: s.leads,
  })) : [];

  // Deal type breakdown
  const dealTypeData = [
    { name: "Wholesale", value: 45 },
    { name: "Fix & Flip", value: 28 },
    { name: "Rental/BRRRR", value: 18 },
    { name: "Creative", value: 9 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md">
        {statsData.map((stat, index) => (
          <AnalyticsStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            format={stat.format}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <FunnelChart
          data={funnelData}
          title="Deal Pipeline Funnel"
          className="animate-fade-in"
        />
        <AIInsightsCard
          insights={insights}
          onInsightClick={(insight) => console.log("Insight clicked:", insight)}
          className="animate-fade-in"
        />
      </div>

      {/* Deal Flow Chart */}
      {dealFlow && dealFlow.length > 0 && (
        <DealFlowChart
          data={dealFlow}
          title="Deal Flow Over Time"
          className="animate-fade-in"
        />
      )}

      {/* Donut Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <DonutChart
          data={sourceChartData}
          title="Leads by Source"
          centerLabel="Total"
          centerValue={sourceChartData.reduce((sum, d) => sum + d.value, 0)}
          className="animate-fade-in"
        />
        <DonutChart
          data={dealTypeData}
          title="Deals by Type"
          centerLabel="Total"
          centerValue={dealTypeData.reduce((sum, d) => sum + d.value, 0)}
          className="animate-fade-in"
        />
      </div>
    </div>
  );
}

// ============ PIPELINE TAB ============

function PipelineTab() {
  const { data: pipelineData, isLoading } = usePipelineAnalytics();
  const { data: stalledDeals, isLoading: stalledLoading } = useStalledDeals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const stages = pipelineData?.stages || [];
  const velocity = pipelineData?.velocity || [];

  const funnelData = stages.map((stage) => ({
    name: stage.name,
    count: stage.count,
    value: stage.value,
  }));

  // Calculate overall metrics
  const totalInPipeline = stages.reduce((sum, s) => sum + s.count, 0);
  const overallConversion = stages.length > 0 && stages[0].count > 0
    ? Math.round((stages[stages.length - 1].count / stages[0].count) * 100)
    : 0;
  const totalDaysToClose = velocity.reduce((sum, v) => sum + v.avgDays, 0);

  // Prepare health chart data
  const healthChartData = stages.slice(0, -1).map((stage) => ({
    name: stage.name.replace(" ", "\n"),
    onTrack: stage.onTrack,
    slowing: stage.slowing,
    stalled: stage.stalled,
  }));

  // Find bottleneck (lowest conversion)
  const bottleneck = stages.reduce((worst, stage, idx) => {
    if (idx === 0) return worst;
    if (stage.conversionRate < worst.rate) {
      return { name: stages[idx - 1].name, rate: stage.conversionRate };
    }
    return worst;
  }, { name: "", rate: 100 });

  return (
    <div className="space-y-lg">
      {/* Velocity Metrics */}
      <div>
        <h3 className="text-h3 font-medium text-content mb-md">Pipeline Velocity</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
          {velocity.map((v, idx) => (
            <Card key={v.stage} variant="default" padding="md">
              <div className="text-tiny text-content-secondary uppercase mb-1">
                {idx === 0 ? "Lead → Contact" : `→ ${v.stage.split(" ").pop()}`}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-h2 font-bold text-content">{v.avgDays}</span>
                <span className="text-small text-content-secondary">days</span>
              </div>
              <div className={cn(
                "text-tiny mt-1",
                v.avgDays <= v.benchmark ? "text-success" : v.avgDays <= v.benchmark * 1.5 ? "text-warning" : "text-destructive"
              )}>
                Benchmark: {v.benchmark}d
              </div>
            </Card>
          ))}
          <Card variant="default" padding="md" className="bg-brand-accent/5 border-brand-accent/20">
            <div className="text-tiny text-content-secondary uppercase mb-1">Total Lead → Close</div>
            <div className="flex items-baseline gap-2">
              <span className="text-h2 font-bold text-brand-accent">{totalDaysToClose}</span>
              <span className="text-small text-content-secondary">days avg</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Pipeline Overview Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Total in Pipeline</div>
          <div className="text-display font-bold text-content mt-1">{totalInPipeline}</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Overall Conversion</div>
          <div className="text-display font-bold text-content mt-1">{overallConversion}%</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Pipeline Value</div>
          <div className="text-display font-bold text-content mt-1">
            ${(pipelineData?.totalValue || 0).toLocaleString()}
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Weighted Value</div>
          <div className="text-display font-bold text-success mt-1">
            ${Math.round(pipelineData?.weightedValue || 0).toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Pipeline Health Chart */}
      <Card variant="default" padding="md">
        <h3 className="text-h3 font-medium text-content mb-md">Pipeline Health by Stage</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={healthChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Bar dataKey="onTrack" name="On Track" stackId="a" fill="hsl(var(--success))" />
              <Bar dataKey="slowing" name="Slowing" stackId="a" fill="hsl(var(--warning))" />
              <Bar dataKey="stalled" name="Stalled" stackId="a" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-small">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-success" />
            <span>On Track (≤ benchmark)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-warning" />
            <span>Slowing (1-1.5x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-destructive" />
            <span>Stalled (&gt;2x)</span>
          </div>
        </div>
      </Card>

      {/* Stalled Deals Table */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-md">
          <div>
            <h3 className="text-h3 font-medium text-content">Stalled Deals</h3>
            <p className="text-small text-content-secondary">Properties stuck at their current stage too long</p>
          </div>
          <Badge variant="destructive" size="sm">{stalledDeals?.length || 0} stalled</Badge>
        </div>
        
        {stalledDeals && stalledDeals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left py-3 text-content-secondary font-medium">Address</th>
                  <th className="text-left py-3 text-content-secondary font-medium">Stage</th>
                  <th className="text-right py-3 text-content-secondary font-medium">Days at Stage</th>
                  <th className="text-right py-3 text-content-secondary font-medium">Last Activity</th>
                  <th className="text-right py-3 text-content-secondary font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stalledDeals.slice(0, 10).map((deal) => (
                  <tr key={deal.id} className="border-b border-border-subtle hover:bg-muted/50">
                    <td className="py-3 font-medium">{deal.address}</td>
                    <td className="py-3">
                      <Badge variant="secondary" size="sm" className="capitalize">
                        {deal.stage.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-destructive font-medium">{deal.daysAtStage} days</span>
                    </td>
                    <td className="py-3 text-right text-content-secondary">
                      {formatDistanceToNow(new Date(deal.lastActivity), { addSuffix: true })}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-content-secondary">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-success opacity-50" />
            <p>No stalled deals! Your pipeline is moving well.</p>
          </div>
        )}
      </Card>

      {/* Stage Conversion Analysis */}
      <Card variant="default" padding="md">
        <h3 className="text-h3 font-medium text-content mb-md">Stage Conversion Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 text-content-secondary font-medium">Stage</th>
                <th className="text-right py-3 text-content-secondary font-medium">Count</th>
                <th className="text-right py-3 text-content-secondary font-medium">Conversion</th>
                <th className="text-right py-3 text-content-secondary font-medium">Avg Days</th>
                <th className="text-right py-3 text-content-secondary font-medium">Value</th>
                <th className="text-right py-3 text-content-secondary font-medium">Health</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage, idx) => (
                <tr key={stage.name} className="border-b border-border-subtle">
                  <td className="py-3 font-medium">{stage.name}</td>
                  <td className="py-3 text-right tabular-nums">{stage.count}</td>
                  <td className="py-3 text-right">
                    <Badge 
                      variant={stage.conversionRate >= 50 ? "success" : stage.conversionRate >= 25 ? "warning" : "secondary"} 
                      size="sm"
                    >
                      {idx === 0 ? "—" : `${stage.conversionRate}%`}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-content-secondary">{stage.avgDays}d</td>
                  <td className="py-3 text-right tabular-nums">${stage.value.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {stage.onTrack > 0 && (
                        <span className="flex items-center gap-0.5 text-success">
                          <CheckCircle className="h-3 w-3" />{stage.onTrack}
                        </span>
                      )}
                      {stage.slowing > 0 && (
                        <span className="flex items-center gap-0.5 text-warning">
                          <Clock className="h-3 w-3" />{stage.slowing}
                        </span>
                      )}
                      {stage.stalled > 0 && (
                        <span className="flex items-center gap-0.5 text-destructive">
                          <XCircle className="h-3 w-3" />{stage.stalled}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Bottleneck Alert */}
        {bottleneck.name && bottleneck.rate < 50 && (
          <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-content">Bottleneck Detected: {bottleneck.name}</p>
              <p className="text-small text-content-secondary">
                Only {bottleneck.rate}% of deals move past this stage. Review your process here.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ============ SOURCES TAB ============

function SourcesTab({ dateRange }: { dateRange: DateRange }) {
  const { data: sources, isLoading } = useSourceAnalytics(dateRange);
  const recommendations = useSourceRecommendations(sources);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const sortedSources = sources || [];

  // Top performers
  const topByVolume = [...sortedSources].sort((a, b) => b.leads - a.leads)[0];
  const topByConversion = [...sortedSources].filter(s => s.leads >= 3).sort((a, b) => b.conversion - a.conversion)[0];
  const topByProfit = [...sortedSources].sort((a, b) => b.revenue - a.revenue)[0];

  // Chart data
  const leadsChartData = sortedSources.slice(0, 8).map(s => ({
    name: s.name,
    leads: s.leads,
  }));

  const conversionChartData = sortedSources.filter(s => s.leads >= 3).slice(0, 8).map(s => ({
    name: s.name,
    conversion: s.conversion,
  }));

  const profitChartData = sortedSources.filter(s => s.revenue > 0).slice(0, 8).map(s => ({
    name: s.name,
    profit: s.revenue,
  }));

  return (
    <div className="space-y-lg">
      {/* Top Performers */}
      <div>
        <h3 className="text-h3 font-medium text-content mb-md flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {topByVolume && (
            <Card variant="default" padding="md" className="border-l-4 border-l-brand-accent">
              <div className="text-tiny text-content-secondary uppercase mb-2">Highest Volume</div>
              <div className="text-h3 font-bold text-content">{topByVolume.name}</div>
              <div className="text-small text-content-secondary mt-1">
                {topByVolume.leads} leads • {topByVolume.closed} closed
              </div>
            </Card>
          )}
          {topByConversion && (
            <Card variant="default" padding="md" className="border-l-4 border-l-success">
              <div className="text-tiny text-content-secondary uppercase mb-2">Best Conversion</div>
              <div className="text-h3 font-bold text-content">{topByConversion.name}</div>
              <div className="text-small text-content-secondary mt-1">
                {topByConversion.conversion}% close rate
              </div>
            </Card>
          )}
          {topByProfit && (
            <Card variant="default" padding="md" className="border-l-4 border-l-warning">
              <div className="text-tiny text-content-secondary uppercase mb-2">Most Profitable</div>
              <div className="text-h3 font-bold text-content">{topByProfit.name}</div>
              <div className="text-small text-content-secondary mt-1">
                ${topByProfit.revenue.toLocaleString()} profit
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card variant="default" padding="md">
          <h3 className="text-h3 font-medium text-content mb-md flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-info" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className={cn(
                  "p-3 rounded-lg border",
                  rec.type === "success" && "bg-success/5 border-success/20",
                  rec.type === "warning" && "bg-warning/5 border-warning/20",
                  rec.type === "info" && "bg-info/5 border-info/20"
                )}
              >
                <div className="flex items-start gap-3">
                  {rec.type === "success" && <Zap className="h-5 w-5 text-success flex-shrink-0" />}
                  {rec.type === "warning" && <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />}
                  {rec.type === "info" && <Lightbulb className="h-5 w-5 text-info flex-shrink-0" />}
                  <div>
                    <p className="font-medium text-content">{rec.title}</p>
                    <p className="text-small text-content-secondary">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Source Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Leads by Source */}
        <Card variant="default" padding="md">
          <h4 className="text-body font-medium text-content mb-md">Leads by Source</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="leads" fill="hsl(var(--brand-accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Conversion by Source */}
        <Card variant="default" padding="md">
          <h4 className="text-body font-medium text-content mb-md">Conversion Rate by Source</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" />
                <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="conversion" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Profit by Source */}
        <Card variant="default" padding="md">
          <h4 className="text-body font-medium text-content mb-md">Profit by Source</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="profit" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Full Source Performance Table */}
      <Card variant="default" padding="md">
        <h3 className="text-h3 font-medium text-content mb-md">Source Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 text-content-secondary font-medium">Source</th>
                <th className="text-right py-3 text-content-secondary font-medium">Leads</th>
                <th className="text-right py-3 text-content-secondary font-medium">Contacted</th>
                <th className="text-right py-3 text-content-secondary font-medium">Appts</th>
                <th className="text-right py-3 text-content-secondary font-medium">Offers</th>
                <th className="text-right py-3 text-content-secondary font-medium">Contracts</th>
                <th className="text-right py-3 text-content-secondary font-medium">Closed</th>
                <th className="text-right py-3 text-content-secondary font-medium">Conv.</th>
                <th className="text-right py-3 text-content-secondary font-medium">Profit</th>
                <th className="text-right py-3 text-content-secondary font-medium">CPL</th>
                <th className="text-right py-3 text-content-secondary font-medium">CPA</th>
                <th className="text-right py-3 text-content-secondary font-medium">ROI</th>
              </tr>
            </thead>
            <tbody>
              {sortedSources.map((source) => (
                <tr key={source.name} className="border-b border-border-subtle hover:bg-muted/50 cursor-pointer">
                  <td className="py-3 font-medium">{source.name}</td>
                  <td className="py-3 text-right tabular-nums">{source.leads}</td>
                  <td className="py-3 text-right tabular-nums">{source.contacted}</td>
                  <td className="py-3 text-right tabular-nums">{source.appointments}</td>
                  <td className="py-3 text-right tabular-nums">{source.offers}</td>
                  <td className="py-3 text-right tabular-nums">{source.contracts}</td>
                  <td className="py-3 text-right tabular-nums">{source.closed}</td>
                  <td className="py-3 text-right">
                    <Badge 
                      variant={source.conversion >= 10 ? "success" : source.conversion >= 5 ? "warning" : "secondary"} 
                      size="sm"
                    >
                      {source.conversion}%
                    </Badge>
                  </td>
                  <td className="py-3 text-right tabular-nums text-success font-medium">
                    ${source.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 text-right tabular-nums text-content-secondary">${source.cpl}</td>
                  <td className="py-3 text-right tabular-nums text-content-secondary">
                    {source.cpa > 0 ? `$${source.cpa}` : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <Badge 
                      variant={source.roi >= 500 ? "success" : source.roi >= 100 ? "info" : source.roi > 0 ? "warning" : "secondary"} 
                      size="sm"
                    >
                      {source.roi > 0 ? `${source.roi}%` : "—"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============ MARKETING TAB ============

function MarketingTab({ dateRange }: { dateRange: DateRange }) {
  const { data: marketing, isLoading } = useMarketingAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const channelData = marketing?.outreach.byChannel || [];

  return (
    <div className="space-y-lg">
      {/* Campaign Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Active Campaigns</div>
          <div className="text-display font-bold text-content mt-1">{marketing?.campaigns.count || 0}</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Messages Sent</div>
          <div className="text-display font-bold text-content mt-1">{marketing?.campaigns.totalSent.toLocaleString() || 0}</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Open Rate</div>
          <div className="text-display font-bold text-content mt-1">{marketing?.campaigns.openRate || 0}%</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Response Rate</div>
          <div className="text-display font-bold text-content mt-1">{marketing?.campaigns.responseRate || 0}%</div>
        </Card>
      </div>

      {/* Outreach by Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <DonutChart
          data={channelData}
          title="Outreach by Channel"
          centerLabel="Total"
          centerValue={marketing?.outreach.total || 0}
        />
        <Card variant="default" padding="md">
          <h3 className="text-h3 font-medium text-content mb-md">Campaign Performance</h3>
          <div className="text-center py-8 text-content-secondary">
            <Send className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Connect marketing campaigns to see detailed performance metrics</p>
            <Button variant="secondary" size="sm" className="mt-4">
              View Campaigns
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ FINANCIAL TAB ============

function FinancialTab({ dateRange }: { dateRange: DateRange }) {
  const { data: financial, isLoading } = useFinancialAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Financial Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Deals Closed</div>
          <div className="text-display font-bold text-content mt-1">{financial?.closedDeals || 0}</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Total Revenue</div>
          <div className="text-display font-bold text-success mt-1">
            ${financial?.totalRevenue.toLocaleString() || 0}
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Avg Deal Value</div>
          <div className="text-display font-bold text-content mt-1">
            ${financial?.avgDealValue.toLocaleString() || 0}
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Pipeline Value</div>
          <div className="text-display font-bold text-info mt-1">
            ${financial?.projectedPipeline.toLocaleString() || 0}
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <DonutChart
          data={[
            { name: "Wholesale", value: 45000 },
            { name: "Fix & Flip", value: 120000 },
            { name: "Rental", value: 35000 },
            { name: "Creative", value: 25000 },
          ]}
          title="Revenue by Deal Type"
          centerLabel="Total"
          centerValue="$225K"
        />
        <Card variant="default" padding="md">
          <h3 className="text-h3 font-medium text-content mb-md">Profit Trends</h3>
          <div className="text-center py-8 text-content-secondary">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Track more deals to see profit trends over time</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============ MAIN ANALYTICS PAGE ============

export default function Analytics() {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [compareEnabled, setCompareEnabled] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <DashboardLayout breadcrumbs={[{ label: "Analytics" }]}>
      {/* Header with Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-lg">
        <PageHeader
          title="Analytics"
          description="Track performance and optimize your real estate business"
          className="mb-0"
        />
        <DateRangeSelector
          value={dateRange}
          onChange={setDateRange}
          compareEnabled={compareEnabled}
          onCompareChange={setCompareEnabled}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-lg">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2">
            <Target className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="sources" className="gap-2">
            <Users className="h-4 w-4" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="marketing" className="gap-2">
            <Send className="h-4 w-4" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-2">
            <Wallet className="h-4 w-4" />
            Financial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="pipeline">
          <PipelineTab />
        </TabsContent>

        <TabsContent value="sources">
          <SourcesTab dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="marketing">
          <MarketingTab dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialTab dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
