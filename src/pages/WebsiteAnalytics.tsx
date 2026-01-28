import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Users,
  MousePointer,
  Send,
  TrendingUp,
  TrendingDown,
  Download,
  ArrowLeft,
  Flame,
  Lightbulb,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useSellerWebsite } from "@/hooks/useSellerWebsites";
import {
  useWebsiteAnalytics,
  calculateMetrics,
  calculateTrafficOverTime,
  calculateSourceData,
  calculateDeviceData,
  calculateLeadScoreData,
  calculateTimelineData,
  calculateGeoData,
  generateInsights,
} from "@/hooks/useWebsiteAnalytics";

const DATE_RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

const COLORS = [
  "hsl(var(--brand-accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--destructive))",
];

export default function WebsiteAnalytics() {
  const { id: websiteId } = useParams<{ id: string }>();
  const [dateRangeDays, setDateRangeDays] = useState("7");

  const dateRange = useMemo(() => {
    const days = parseInt(dateRangeDays);
    return {
      from: startOfDay(subDays(new Date(), days)),
      to: endOfDay(new Date()),
    };
  }, [dateRangeDays]);

  const { data: website, isLoading: websiteLoading } = useSellerWebsite(websiteId);
  const { data: analyticsData, isLoading: analyticsLoading } = useWebsiteAnalytics(
    websiteId,
    dateRange
  );

  const isLoading = websiteLoading || analyticsLoading;

  // Calculate all metrics
  const metrics = useMemo(() => {
    if (!analyticsData) return null;
    return calculateMetrics(analyticsData.analytics, analyticsData.prevAnalytics);
  }, [analyticsData]);

  const trafficData = useMemo(() => {
    if (!analyticsData) return [];
    return calculateTrafficOverTime(analyticsData.analytics, dateRange);
  }, [analyticsData, dateRange]);

  const sourceData = useMemo(() => {
    if (!analyticsData) return [];
    return calculateSourceData(analyticsData.analytics);
  }, [analyticsData]);

  const deviceData = useMemo(() => {
    if (!analyticsData) return [];
    return calculateDeviceData(analyticsData.analytics);
  }, [analyticsData]);

  const leadScoreData = useMemo(() => {
    if (!analyticsData) return [];
    return calculateLeadScoreData(analyticsData.leads);
  }, [analyticsData]);

  const timelineData = useMemo(() => {
    if (!analyticsData) return [];
    return calculateTimelineData(analyticsData.leads);
  }, [analyticsData]);

  const geoData = useMemo(() => {
    if (!analyticsData) return [];
    return calculateGeoData(analyticsData.leads);
  }, [analyticsData]);

  const insights = useMemo(() => {
    if (!metrics) return [];
    return generateInsights(metrics, sourceData, deviceData, timelineData);
  }, [metrics, sourceData, deviceData, timelineData]);

  const getChangeDisplay = (current: number, previous: number) => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, isPositive: current > 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const funnelData = metrics
    ? [
        { name: "Page Views", count: metrics.pageViews, percentage: 100 },
        {
          name: "Form Started",
          count: metrics.formStarts,
          percentage: metrics.pageViews > 0 ? (metrics.formStarts / metrics.pageViews) * 100 : 0,
        },
        {
          name: "Submitted",
          count: metrics.submissions,
          percentage: metrics.pageViews > 0 ? (metrics.submissions / metrics.pageViews) * 100 : 0,
        },
      ]
    : [];

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <Link
          to="/websites"
          className="inline-flex items-center gap-1 text-small text-content-secondary hover:text-content mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Websites
        </Link>
      </div>

      <PageHeader
        title={website?.name ? `${website.name} Analytics` : "Website Analytics"}
        description="Track performance and lead generation metrics"
        action={
          <div className="flex items-center gap-3">
            <Select value={dateRangeDays} onValueChange={setDateRangeDays}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary" icon={<Download />}>
              Export
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MetricCard
              label="Page Views"
              value={metrics?.pageViews || 0}
              change={getChangeDisplay(metrics?.pageViews || 0, metrics?.previousPageViews || 0)}
              icon={<Eye className="h-5 w-5" />}
            />
            <MetricCard
              label="Visitors"
              value={metrics?.visitors || 0}
              change={getChangeDisplay(metrics?.visitors || 0, metrics?.previousVisitors || 0)}
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              label="Form Starts"
              value={metrics?.formStarts || 0}
              change={getChangeDisplay(metrics?.formStarts || 0, metrics?.previousFormStarts || 0)}
              icon={<MousePointer className="h-5 w-5" />}
            />
            <MetricCard
              label="Submissions"
              value={metrics?.submissions || 0}
              change={getChangeDisplay(metrics?.submissions || 0, metrics?.previousSubmissions || 0)}
              icon={<Send className="h-5 w-5" />}
            />
            <MetricCard
              label="Conversion"
              value={`${(metrics?.conversionRate || 0).toFixed(1)}%`}
              change={getChangeDisplay(
                metrics?.conversionRate || 0,
                metrics?.previousConversionRate || 0
              )}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <Card variant="default" padding="md">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-warning" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-h4 font-medium">Insights</h3>
                  <ul className="space-y-1">
                    {insights.map((insight, i) => (
                      <li key={i} className="text-small text-content-secondary">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Traffic Over Time */}
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-medium mb-4">Traffic Over Time</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--content-tertiary))"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--content-tertiary))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--surface))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name="Views"
                    stroke="hsl(var(--brand-accent))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    name="Visitors"
                    stroke="hsl(var(--info))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    name="Submissions"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Conversion Funnel */}
          <Card variant="default" padding="md">
            <h3 className="text-h3 font-medium mb-4">Conversion Funnel</h3>
            <div className="space-y-3">
              {funnelData.map((stage, index) => {
                const prevStage = funnelData[index - 1];
                const dropOff = prevStage
                  ? (((prevStage.count - stage.count) / prevStage.count) * 100).toFixed(1)
                  : null;

                return (
                  <div key={stage.name}>
                    {index > 0 && dropOff && (
                      <div className="flex items-center gap-2 py-1 ml-8">
                        <div className="h-4 w-px bg-border" />
                        <span className="text-tiny text-content-tertiary">
                          ↓ {dropOff}% drop-off
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-32 text-small font-medium">{stage.name}</div>
                      <div className="flex-1 h-10 bg-surface-secondary rounded-medium overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-accent to-brand-accent/80 rounded-medium flex items-center justify-end px-3 transition-all duration-500"
                          style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                        >
                          <span className="text-white text-small font-medium">
                            {stage.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="w-16 text-right text-small text-content-secondary">
                        {stage.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Two Column Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <Card variant="default" padding="md">
              <h3 className="text-h3 font-medium mb-4">Traffic Sources</h3>
              <div className="flex gap-6">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        dataKey="visitors"
                        nameKey="source"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                      >
                        {sourceData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Visitors</TableHead>
                        <TableHead className="text-right">Leads</TableHead>
                        <TableHead className="text-right">Conv.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sourceData.slice(0, 5).map((source, i) => (
                        <TableRow key={source.source}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                              />
                              {source.source}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{source.visitors}</TableCell>
                          <TableCell className="text-right">{source.leads}</TableCell>
                          <TableCell className="text-right">
                            {source.conversionRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>

            {/* Device Breakdown */}
            <Card variant="default" padding="md">
              <h3 className="text-h3 font-medium mb-4">Device Breakdown</h3>
              <div className="flex gap-6">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                      >
                        {deviceData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                  {deviceData.map((device, i) => (
                    <div key={device.device} className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-medium flex items-center justify-center"
                        style={{ backgroundColor: `${COLORS[i % COLORS.length]}20` }}
                      >
                        {getDeviceIcon(device.device)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-small font-medium">{device.device}</span>
                          <span className="text-small text-content-secondary">
                            {device.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${device.percentage}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Lead Quality */}
            <Card variant="default" padding="md">
              <h3 className="text-h3 font-medium mb-4">Lead Quality</h3>
              <div className="space-y-3">
                {leadScoreData.map((score) => (
                  <div key={score.range} className="flex items-center gap-4">
                    <div className="w-24 flex items-center gap-2">
                      {score.range === "800-1000" && <Flame className="h-4 w-4 text-destructive" />}
                      <span className="text-small font-medium">{score.range}</span>
                    </div>
                    <div className="flex-1 h-6 bg-surface-secondary rounded-medium overflow-hidden">
                      <div
                        className="h-full rounded-medium flex items-center px-2"
                        style={{
                          width: `${Math.max(score.percentage, 5)}%`,
                          backgroundColor: score.color,
                        }}
                      >
                        <span className="text-white text-tiny font-medium">{score.count}</span>
                      </div>
                    </div>
                    <div className="w-12 text-right text-small text-content-secondary">
                      {score.percentage.toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
              {analyticsData?.leads && analyticsData.leads.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-small text-content-secondary">
                    Average Score:{" "}
                    <span className="font-semibold text-content">
                      {(
                        analyticsData.leads.reduce((sum, l) => sum + (l.auto_score || 0), 0) /
                        analyticsData.leads.length
                      ).toFixed(0)}
                    </span>
                  </p>
                </div>
              )}
            </Card>

            {/* Timeline Distribution */}
            <Card variant="default" padding="md">
              <h3 className="text-h3 font-medium mb-4">Selling Timeline</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timelineData.map((item) => (
                    <TableRow key={item.timeline}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right">
                        {item.percentage.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {timelineData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-small text-content-secondary">
                    🔥{" "}
                    {(
                      timelineData
                        .filter((t) => t.timeline === "asap" || t.timeline === "30_days")
                        .reduce((sum, t) => sum + t.percentage, 0)
                    ).toFixed(0)}
                    % want to sell within 30 days
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Geography */}
          {geoData.length > 0 && (
            <Card variant="default" padding="md">
              <h3 className="text-h3 font-medium mb-4">Lead Geography</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {geoData.map((geo, i) => (
                  <div
                    key={geo.city}
                    className="p-4 bg-surface-secondary rounded-medium flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-brand-accent" />
                    </div>
                    <div>
                      <p className="text-small font-medium">{geo.city}</p>
                      <p className="text-tiny text-content-tertiary">{geo.count} leads</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </PageLayout>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: number | string;
  change: { value: number; isPositive: boolean };
  icon: React.ReactNode;
}) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-full bg-surface-secondary flex items-center justify-center text-content-tertiary">
          {icon}
        </div>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-tiny font-medium",
            change.isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}
        >
          {change.isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change.value.toFixed(1)}%
        </div>
      </div>
      <div className="text-display font-semibold text-content tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-small text-content-secondary uppercase tracking-wide">{label}</div>
    </Card>
  );
}
