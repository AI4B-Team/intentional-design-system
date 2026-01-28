import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";

export interface WebsiteAnalyticsData {
  id: string;
  event_type: string;
  created_at: string | null;
  visitor_id: string | null;
  session_id: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  page_url: string | null;
}

export interface AnalyticsMetrics {
  pageViews: number;
  visitors: number;
  formStarts: number;
  submissions: number;
  conversionRate: number;
  previousPageViews: number;
  previousVisitors: number;
  previousFormStarts: number;
  previousSubmissions: number;
  previousConversionRate: number;
}

export interface TrafficDataPoint {
  date: string;
  views: number;
  visitors: number;
  submissions: number;
}

export interface SourceData {
  source: string;
  visitors: number;
  leads: number;
  conversionRate: number;
}

export interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

export interface LeadScoreData {
  range: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TimelineData {
  timeline: string;
  label: string;
  count: number;
  percentage: number;
}

export interface GeoData {
  city: string;
  count: number;
}

export function useWebsiteAnalytics(websiteId: string | undefined, dateRange: { from: Date; to: Date }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["website-analytics", websiteId, dateRange.from, dateRange.to],
    queryFn: async () => {
      if (!websiteId) return null;

      // Get analytics data for current period
      const { data: analytics, error } = await supabase
        .from("website_analytics")
        .select("*")
        .eq("website_id", websiteId)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get previous period data for comparison
      const periodDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      const prevFrom = subDays(dateRange.from, periodDays);
      const prevTo = subDays(dateRange.to, periodDays);

      const { data: prevAnalytics } = await supabase
        .from("website_analytics")
        .select("*")
        .eq("website_id", websiteId)
        .gte("created_at", prevFrom.toISOString())
        .lte("created_at", prevTo.toISOString());

      // Get leads for scoring data
      const { data: leads } = await supabase
        .from("seller_leads")
        .select("auto_score, sell_timeline, property_city, created_at")
        .eq("website_id", websiteId)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      return {
        analytics: analytics as WebsiteAnalyticsData[],
        prevAnalytics: (prevAnalytics || []) as WebsiteAnalyticsData[],
        leads: leads || [],
        dateRange,
      };
    },
    enabled: !!user?.id && !!websiteId,
  });
}

export function calculateMetrics(
  analytics: WebsiteAnalyticsData[],
  prevAnalytics: WebsiteAnalyticsData[]
): AnalyticsMetrics {
  const pageViews = analytics.filter((a) => a.event_type === "page_view").length;
  const visitors = new Set(analytics.filter((a) => a.visitor_id).map((a) => a.visitor_id)).size;
  const formStarts = analytics.filter((a) => a.event_type === "form_start").length;
  const submissions = analytics.filter((a) => a.event_type === "form_submit").length;
  const conversionRate = pageViews > 0 ? (submissions / pageViews) * 100 : 0;

  const prevPageViews = prevAnalytics.filter((a) => a.event_type === "page_view").length;
  const prevVisitors = new Set(prevAnalytics.filter((a) => a.visitor_id).map((a) => a.visitor_id)).size;
  const prevFormStarts = prevAnalytics.filter((a) => a.event_type === "form_start").length;
  const prevSubmissions = prevAnalytics.filter((a) => a.event_type === "form_submit").length;
  const prevConversionRate = prevPageViews > 0 ? (prevSubmissions / prevPageViews) * 100 : 0;

  return {
    pageViews,
    visitors,
    formStarts,
    submissions,
    conversionRate,
    previousPageViews: prevPageViews,
    previousVisitors: prevVisitors,
    previousFormStarts: prevFormStarts,
    previousSubmissions: prevSubmissions,
    previousConversionRate: prevConversionRate,
  };
}

export function calculateTrafficOverTime(
  analytics: WebsiteAnalyticsData[],
  dateRange: { from: Date; to: Date }
): TrafficDataPoint[] {
  const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
  
  return days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayEvents = analytics.filter((a) => {
      if (!a.created_at) return false;
      return format(new Date(a.created_at), "yyyy-MM-dd") === dayStr;
    });

    return {
      date: format(day, "MMM d"),
      views: dayEvents.filter((a) => a.event_type === "page_view").length,
      visitors: new Set(dayEvents.filter((a) => a.visitor_id).map((a) => a.visitor_id)).size,
      submissions: dayEvents.filter((a) => a.event_type === "form_submit").length,
    };
  });
}

export function calculateSourceData(analytics: WebsiteAnalyticsData[]): SourceData[] {
  const sourceMap = new Map<string, { visitors: Set<string>; leads: number }>();

  analytics.forEach((event) => {
    const source = event.utm_source || event.referrer || "Direct";
    const cleanSource = source.includes("google") ? "Google" : 
                       source.includes("facebook") ? "Facebook" :
                       source.includes("instagram") ? "Instagram" :
                       source === "Direct" ? "Direct" : "Other";
    
    if (!sourceMap.has(cleanSource)) {
      sourceMap.set(cleanSource, { visitors: new Set(), leads: 0 });
    }
    
    const data = sourceMap.get(cleanSource)!;
    if (event.visitor_id) data.visitors.add(event.visitor_id);
    if (event.event_type === "form_submit") data.leads++;
  });

  return Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    visitors: data.visitors.size,
    leads: data.leads,
    conversionRate: data.visitors.size > 0 ? (data.leads / data.visitors.size) * 100 : 0,
  })).sort((a, b) => b.visitors - a.visitors);
}

export function calculateDeviceData(analytics: WebsiteAnalyticsData[]): DeviceData[] {
  const deviceMap = new Map<string, number>();
  
  analytics.filter(a => a.event_type === "page_view").forEach((event) => {
    const device = event.device_type || "Unknown";
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
  });

  const total = Array.from(deviceMap.values()).reduce((a, b) => a + b, 0);

  return Array.from(deviceMap.entries()).map(([device, count]) => ({
    device: device.charAt(0).toUpperCase() + device.slice(1),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  })).sort((a, b) => b.count - a.count);
}

export function calculateLeadScoreData(leads: { auto_score: number | null }[]): LeadScoreData[] {
  const ranges = [
    { range: "800-1000", min: 800, max: 1000, color: "hsl(var(--destructive))" },
    { range: "600-799", min: 600, max: 799, color: "hsl(var(--warning))" },
    { range: "400-599", min: 400, max: 599, color: "hsl(var(--info))" },
    { range: "<400", min: 0, max: 399, color: "hsl(var(--muted))" },
  ];

  const total = leads.length;

  return ranges.map(({ range, min, max, color }) => {
    const count = leads.filter((l) => {
      const score = l.auto_score || 0;
      return score >= min && score <= max;
    }).length;

    return {
      range,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color,
    };
  });
}

export function calculateTimelineData(leads: { sell_timeline: string | null }[]): TimelineData[] {
  const timelineLabels: Record<string, string> = {
    asap: "ASAP",
    "30_days": "Within 30 days",
    "60_days": "Within 60 days",
    "90_days": "90+ days",
    flexible: "Flexible",
  };

  const timelineMap = new Map<string, number>();
  
  leads.forEach((lead) => {
    const timeline = lead.sell_timeline || "unknown";
    timelineMap.set(timeline, (timelineMap.get(timeline) || 0) + 1);
  });

  const total = leads.length;

  return Array.from(timelineMap.entries())
    .filter(([timeline]) => timeline !== "unknown")
    .map(([timeline, count]) => ({
      timeline,
      label: timelineLabels[timeline] || timeline,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateGeoData(leads: { property_city: string | null }[]): GeoData[] {
  const cityMap = new Map<string, number>();
  
  leads.forEach((lead) => {
    if (lead.property_city) {
      cityMap.set(lead.property_city, (cityMap.get(lead.property_city) || 0) + 1);
    }
  });

  return Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function generateInsights(
  metrics: AnalyticsMetrics,
  sourceData: SourceData[],
  deviceData: DeviceData[],
  timelineData: TimelineData[]
): string[] {
  const insights: string[] = [];

  // Conversion rate change
  const conversionChange = metrics.conversionRate - metrics.previousConversionRate;
  if (conversionChange > 0) {
    insights.push(`📈 Conversion rate up ${conversionChange.toFixed(1)}% this period`);
  } else if (conversionChange < -2) {
    insights.push(`📉 Conversion rate down ${Math.abs(conversionChange).toFixed(1)}% - review your form`);
  }

  // Best source
  const bestSource = sourceData.reduce((best, curr) => 
    curr.conversionRate > (best?.conversionRate || 0) ? curr : best, sourceData[0]);
  if (bestSource && bestSource.conversionRate > 0) {
    insights.push(`🎯 ${bestSource.source} has your highest conversion rate at ${bestSource.conversionRate.toFixed(1)}%`);
  }

  // Device insight
  const mobileData = deviceData.find(d => d.device.toLowerCase() === "mobile");
  if (mobileData && mobileData.percentage > 50) {
    insights.push(`📱 ${mobileData.percentage.toFixed(0)}% mobile traffic - ensure mobile optimization`);
  }

  // Timeline insight
  const urgentLeads = timelineData.filter(t => t.timeline === "asap" || t.timeline === "30_days");
  const urgentPercent = urgentLeads.reduce((sum, t) => sum + t.percentage, 0);
  if (urgentPercent > 50) {
    insights.push(`🔥 ${urgentPercent.toFixed(0)}% of leads want to sell within 30 days`);
  }

  // Low traffic warning
  if (metrics.pageViews === 0) {
    insights.push(`⚠️ No page views this period - check your marketing campaigns`);
  } else if (metrics.submissions === 0 && metrics.pageViews > 10) {
    insights.push(`⚠️ No form submissions despite ${metrics.pageViews} views - review your landing page`);
  }

  return insights.slice(0, 5);
}
