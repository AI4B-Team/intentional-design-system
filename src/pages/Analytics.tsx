import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DashboardLayout, PageHeader } from "@/components/layout";
import {
  DateRangeSelector,
  AnalyticsStatCard,
  FunnelChart,
  DealFlowChart,
  DonutChart,
  AIInsightsCard,
  AnalyticsTable,
} from "@/components/analytics";
import { subDays } from "date-fns";
import {
  Users,
  Phone,
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
} from "lucide-react";

// Sample data
const generateSparkline = (trend: "up" | "down" | "flat", points = 14): number[] => {
  const base = 50;
  const variance = 20;
  let current = base;
  
  return Array.from({ length: points }, (_, i) => {
    const random = (Math.random() - 0.5) * variance;
    const trendFactor = trend === "up" ? 0.5 : trend === "down" ? -0.5 : 0;
    current = Math.max(10, Math.min(90, current + random + trendFactor * (i / points) * 30));
    return current;
  });
};

const statsData = [
  {
    title: "Total Leads",
    value: 847,
    change: 12.3,
    sparkline: generateSparkline("up"),
    icon: <Users className="h-5 w-5 text-brand-accent" />,
  },
  {
    title: "Contacts Made",
    value: 423,
    change: 8.7,
    sparkline: generateSparkline("up"),
    icon: <Phone className="h-5 w-5 text-info" />,
  },
  {
    title: "Offers Sent",
    value: 156,
    change: -3.2,
    sparkline: generateSparkline("down"),
    icon: <FileText className="h-5 w-5 text-warning" />,
  },
  {
    title: "Deals Closed",
    value: 34,
    change: 18.5,
    sparkline: generateSparkline("up"),
    icon: <DollarSign className="h-5 w-5 text-success" />,
  },
  {
    title: "Revenue",
    value: 487500,
    change: 24.2,
    sparkline: generateSparkline("up"),
    icon: <TrendingUp className="h-5 w-5 text-success" />,
    format: "currency" as const,
  },
  {
    title: "Conversion Rate",
    value: 4.01,
    change: 0.8,
    sparkline: generateSparkline("flat"),
    icon: <Percent className="h-5 w-5 text-brand-accent" />,
    format: "percentage" as const,
  },
];

const funnelData = [
  { name: "Leads", count: 847, value: 0 },
  { name: "Contacted", count: 423, value: 0 },
  { name: "Qualified", count: 234, value: 0 },
  { name: "Offers Made", count: 156, value: 18720000 },
  { name: "Negotiating", count: 67, value: 8040000 },
  { name: "Closed", count: 34, value: 4875000 },
];

const dealFlowData = [
  { date: "Jan 1", leads: 45, contacts: 23, offers: 8, closed: 2 },
  { date: "Jan 8", leads: 52, contacts: 28, offers: 12, closed: 3 },
  { date: "Jan 15", leads: 61, contacts: 35, offers: 15, closed: 4 },
  { date: "Jan 22", leads: 48, contacts: 30, offers: 11, closed: 2 },
  { date: "Jan 29", leads: 67, contacts: 42, offers: 18, closed: 5 },
  { date: "Feb 5", leads: 72, contacts: 45, offers: 20, closed: 4 },
  { date: "Feb 12", leads: 58, contacts: 38, offers: 14, closed: 3 },
  { date: "Feb 19", leads: 81, contacts: 52, offers: 22, closed: 6 },
  { date: "Feb 26", leads: 76, contacts: 48, offers: 19, closed: 5 },
];

const sourceData = [
  { name: "Direct Mail", value: 312 },
  { name: "Cold Calling", value: 187 },
  { name: "Driving for Dollars", value: 143 },
  { name: "Referrals", value: 98 },
  { name: "MLS", value: 67 },
  { name: "Other", value: 40 },
];

const marketData = [
  { name: "Austin, TX", value: 245 },
  { name: "Dallas, TX", value: 198 },
  { name: "Houston, TX", value: 176 },
  { name: "San Antonio, TX", value: 134 },
  { name: "Fort Worth, TX", value: 94 },
];

const aiInsights = [
  {
    id: "1",
    type: "success" as const,
    title: "Direct Mail is crushing it",
    description: "Your direct mail campaigns are converting 2.3x better than last month. Consider increasing budget.",
    metric: "37% conversion rate → 85% above average",
    link: "/analytics/sources",
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Cold calling response rate dropped",
    description: "Response rates from cold calls fell 15% this week. Review scripts or try different calling times.",
    metric: "12% response rate → down from 27%",
    link: "/analytics/outreach",
  },
  {
    id: "3",
    type: "info" as const,
    title: "Austin market heating up",
    description: "Competition increased in Austin. Average days on market down 20%. Act faster on new leads.",
    link: "/analytics/markets",
  },
  {
    id: "4",
    type: "success" as const,
    title: "High-value deal pipeline strong",
    description: "You have 5 deals in negotiation with potential profit over $50K each. Keep momentum!",
    metric: "$287K potential profit in pipeline",
  },
];

const topPerformersData = [
  { source: "Direct Mail - Probate", leads: 89, contacted: 67, conversion: 12.4, revenue: 187500 },
  { source: "Cold Calling - Vacant", leads: 76, contacted: 58, conversion: 9.2, revenue: 145000 },
  { source: "Referrals - Agent", leads: 45, contacted: 42, conversion: 15.6, revenue: 125000 },
  { source: "Driving for Dollars", leads: 63, contacted: 41, conversion: 7.9, revenue: 98000 },
  { source: "Direct Mail - Tax Delinquent", leads: 54, contacted: 38, conversion: 11.1, revenue: 87500 },
];

const tableColumns = [
  { key: "source", label: "Source", sortable: true },
  { key: "leads", label: "Leads", align: "right" as const, format: "number" as const, sortable: true },
  { key: "contacted", label: "Contacted", align: "right" as const, format: "number" as const, sortable: true },
  { key: "conversion", label: "Conversion", align: "right" as const, format: "progress" as const, sortable: true },
  { key: "revenue", label: "Revenue", align: "right" as const, format: "currency" as const, sortable: true },
];

export default function Analytics() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = React.useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [compareEnabled, setCompareEnabled] = React.useState(false);

  return (
    <DashboardLayout breadcrumbs={[{ label: "Analytics" }]}>
      {/* Header with Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-lg">
        <PageHeader
          title="Analytics"
          description="Track your performance and optimize your business"
          className="mb-0"
        />
        <DateRangeSelector
          value={dateRange}
          onChange={setDateRange}
          compareEnabled={compareEnabled}
          onCompareChange={setCompareEnabled}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md mb-lg">
        {statsData.map((stat, index) => (
          <AnalyticsStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            sparklineData={stat.sparkline}
            icon={stat.icon}
            format={stat.format}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
        {/* Funnel */}
        <FunnelChart
          data={funnelData}
          title="Deal Pipeline Funnel"
          className="animate-fade-in"
        />

        {/* AI Insights */}
        <AIInsightsCard
          insights={aiInsights}
          onInsightClick={(insight) => insight.link && navigate(insight.link)}
          className="animate-fade-in"
        />
      </div>

      {/* Deal Flow Chart */}
      <DealFlowChart
        data={dealFlowData}
        title="Deal Flow Over Time"
        className="mb-lg animate-fade-in"
      />

      {/* Donut Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
        <DonutChart
          data={sourceData}
          title="Leads by Source"
          centerLabel="Total"
          centerValue={sourceData.reduce((sum, d) => sum + d.value, 0)}
          className="animate-fade-in"
        />
        <DonutChart
          data={marketData}
          title="Leads by Market"
          centerLabel="Total"
          centerValue={marketData.reduce((sum, d) => sum + d.value, 0)}
          className="animate-fade-in"
        />
      </div>

      {/* Top Performers Table */}
      <AnalyticsTable
        title="Top Performing Sources"
        columns={tableColumns}
        data={topPerformersData}
        onRowClick={(row) => console.log("Drill down:", row)}
        onExport={(format) => console.log("Export:", format)}
        className="animate-fade-in"
      />
    </DashboardLayout>
  );
}
