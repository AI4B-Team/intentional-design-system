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
import { subDays, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import {
  Users,
  Phone,
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  Target,
  BarChart3,
  Send,
  Wallet,
  UsersRound,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  useOverviewAnalytics,
  usePipelineAnalytics,
  useSourceAnalytics,
  useDealFlowTimeSeries,
  useMarketingAnalytics,
  useFinancialAnalytics,
  useAIInsights,
  type DateRange,
} from "@/hooks/useAnalytics";

// ============ DATE PRESETS ============

const datePresets = [
  { label: "This Week", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "This Quarter", getValue: () => ({ from: startOfQuarter(new Date()), to: new Date() }) },
  { label: "This Year", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

// ============ OVERVIEW TAB ============

function OverviewTab({ dateRange }: { dateRange: DateRange }) {
  const navigate = useNavigate();
  const { data: overview, isLoading: overviewLoading } = useOverviewAnalytics(dateRange);
  const { data: pipeline, isLoading: pipelineLoading } = usePipelineAnalytics(dateRange);
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
  const funnelData = pipeline ? pipeline.map((stage) => ({
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

  // Deal type breakdown (placeholder - would need actual data)
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

function PipelineTab({ dateRange }: { dateRange: DateRange }) {
  const { data: pipeline, isLoading } = usePipelineAnalytics(dateRange);
  const { data: dealFlow } = useDealFlowTimeSeries(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const funnelData = pipeline ? pipeline.map((stage) => ({
    name: stage.name,
    count: stage.count,
    value: stage.value,
  })) : [];

  // Calculate overall metrics
  const totalInPipeline = pipeline ? pipeline.reduce((sum, s) => sum + s.count, 0) : 0;
  const overallConversion = pipeline && pipeline.length > 0 && pipeline[0].count > 0
    ? Math.round((pipeline[pipeline.length - 1].count / pipeline[0].count) * 100)
    : 0;

  return (
    <div className="space-y-lg">
      {/* Pipeline Overview Cards */}
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
          <div className="text-tiny text-content-secondary uppercase">Avg Days to Close</div>
          <div className="text-display font-bold text-content mt-1">32</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Pipeline Value</div>
          <div className="text-display font-bold text-content mt-1">$1.2M</div>
        </Card>
      </div>

      {/* Main Funnel */}
      <FunnelChart
        data={funnelData}
        title="Pipeline Funnel Analysis"
        className="animate-fade-in"
      />

      {/* Stage Details Table */}
      <Card variant="default" padding="md">
        <h3 className="text-h3 font-medium text-content mb-md">Stage Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 text-content-secondary font-medium">Stage</th>
                <th className="text-right py-3 text-content-secondary font-medium">Count</th>
                <th className="text-right py-3 text-content-secondary font-medium">Conversion</th>
                <th className="text-right py-3 text-content-secondary font-medium">Avg Time</th>
                <th className="text-right py-3 text-content-secondary font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {pipeline?.map((stage, idx) => (
                <tr key={stage.name} className="border-b border-border-subtle">
                  <td className="py-3 font-medium">{stage.name}</td>
                  <td className="py-3 text-right tabular-nums">{stage.count}</td>
                  <td className="py-3 text-right">
                    <Badge variant={stage.conversionRate >= 50 ? "success" : stage.conversionRate >= 25 ? "warning" : "secondary"} size="sm">
                      {stage.conversionRate}%
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-content-secondary">{3 + idx * 2}d avg</td>
                  <td className="py-3 text-right tabular-nums">${(stage.count * 15000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deal Flow Over Time */}
      {dealFlow && dealFlow.length > 0 && (
        <DealFlowChart
          data={dealFlow}
          title="Pipeline Movement Over Time"
        />
      )}
    </div>
  );
}

// ============ SOURCES TAB ============

function SourcesTab({ dateRange }: { dateRange: DateRange }) {
  const { data: sources, isLoading } = useSourceAnalytics(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const sourceChartData = sources ? sources.slice(0, 6).map((s) => ({
    name: s.name || "Unknown",
    value: s.leads,
  })) : [];

  const tableColumns = [
    { key: "name", label: "Source", sortable: true },
    { key: "leads", label: "Leads", align: "right" as const, format: "number" as const, sortable: true },
    { key: "contacted", label: "Contacted", align: "right" as const, format: "number" as const, sortable: true },
    { key: "offers", label: "Offers", align: "right" as const, format: "number" as const, sortable: true },
    { key: "closed", label: "Closed", align: "right" as const, format: "number" as const, sortable: true },
    { key: "conversion", label: "Conversion", align: "right" as const, format: "progress" as const, sortable: true },
    { key: "revenue", label: "Revenue", align: "right" as const, format: "currency" as const, sortable: true },
  ];

  return (
    <div className="space-y-lg">
      {/* Source Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Total Sources</div>
          <div className="text-display font-bold text-content mt-1">{sources?.length || 0}</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Top Source</div>
          <div className="text-h3 font-bold text-content mt-1">{sources?.[0]?.name || "—"}</div>
          <div className="text-small text-content-secondary">{sources?.[0]?.leads || 0} leads</div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Best Converter</div>
          <div className="text-h3 font-bold text-content mt-1">
            {sources?.sort((a, b) => b.conversion - a.conversion)[0]?.name || "—"}
          </div>
          <div className="text-small text-content-secondary">
            {sources?.sort((a, b) => b.conversion - a.conversion)[0]?.conversion || 0}% conversion
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="text-tiny text-content-secondary uppercase">Total Revenue</div>
          <div className="text-display font-bold text-content mt-1">
            ${sources?.reduce((sum, s) => sum + s.revenue, 0).toLocaleString() || 0}
          </div>
        </Card>
      </div>

      {/* Source Distribution Chart */}
      <DonutChart
        data={sourceChartData}
        title="Lead Distribution by Source"
        centerLabel="Total Leads"
        centerValue={sourceChartData.reduce((sum, d) => sum + d.value, 0)}
      />

      {/* Source Performance Table */}
      <AnalyticsTable
        title="Source Performance"
        columns={tableColumns}
        data={sources || []}
        onRowClick={(row) => console.log("Source clicked:", row)}
        onExport={(format) => console.log("Export:", format)}
      />
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

      {/* Channel Breakdown Table */}
      <Card variant="default" padding="md">
        <h3 className="text-h3 font-medium text-content mb-md">Channel Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 text-content-secondary font-medium">Channel</th>
                <th className="text-right py-3 text-content-secondary font-medium">Outreach</th>
                <th className="text-right py-3 text-content-secondary font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {channelData.map((channel) => (
                <tr key={channel.name} className="border-b border-border-subtle">
                  <td className="py-3 font-medium capitalize">{channel.name}</td>
                  <td className="py-3 text-right tabular-nums">{channel.value}</td>
                  <td className="py-3 text-right">
                    {marketing?.outreach.total ? Math.round((channel.value / marketing.outreach.total) * 100) : 0}%
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
        <Card variant="default" padding="md">
          <h3 className="text-h3 font-medium text-content mb-md">Revenue by Deal Type</h3>
          <DonutChart
            data={[
              { name: "Wholesale", value: 45000 },
              { name: "Fix & Flip", value: 120000 },
              { name: "Rental", value: 35000 },
              { name: "Creative", value: 25000 },
            ]}
            centerLabel="Total"
            centerValue="$225K"
          />
        </Card>
        <Card variant="default" padding="md">
          <h3 className="text-h3 font-medium text-content mb-md">Profit Trends</h3>
          <div className="text-center py-8 text-content-secondary">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Track more deals to see profit trends over time</p>
          </div>
        </Card>
      </div>

      {/* Financial Metrics Table */}
      <Card variant="default" padding="md">
        <h3 className="text-h3 font-medium text-content mb-md">Deal Financial Summary</h3>
        <div className="text-center py-8 text-content-secondary">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Detailed financial data will appear as you close more deals</p>
        </div>
      </Card>
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
          <PipelineTab dateRange={dateRange} />
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
