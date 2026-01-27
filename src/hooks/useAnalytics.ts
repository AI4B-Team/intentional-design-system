import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subQuarters,
  subYears,
  differenceInDays,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsMetric {
  value: number;
  previousValue: number;
  change: number;
  conversionRate?: number;
}

export interface PipelineStageData {
  name: string;
  count: number;
  value: number;
  conversionRate: number;
}

export interface SourceBreakdown {
  name: string;
  leads: number;
  contacted: number;
  offers: number;
  closed: number;
  conversion: number;
  revenue: number;
}

export interface DealTypeBreakdown {
  name: string;
  count: number;
  totalValue: number;
  avgValue: number;
}

export interface TimeSeriesPoint {
  date: string;
  leads: number;
  contacts: number;
  offers: number;
  closed: number;
}

// Get comparison period based on current range
function getComparisonRange(range: DateRange): DateRange {
  const daysDiff = differenceInDays(range.to, range.from);
  return {
    from: subDays(range.from, daysDiff + 1),
    to: subDays(range.from, 1),
  };
}

// ============ OVERVIEW ANALYTICS ============

export function useOverviewAnalytics(dateRange: DateRange) {
  const { user } = useAuth();
  const compareRange = getComparisonRange(dateRange);

  return useQuery({
    queryKey: ["analytics-overview", dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      // Current period counts
      const [
        leadsResult,
        contactedResult,
        appointmentsResult,
        offersResult,
        contractsResult,
        closedResult,
        // Previous period
        prevLeadsResult,
        prevContactedResult,
        prevAppointmentsResult,
        prevOffersResult,
        prevContractsResult,
        prevClosedResult,
      ] = await Promise.all([
        // Current period
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "contacted")
          .gte("updated_at", dateRange.from.toISOString())
          .lte("updated_at", dateRange.to.toISOString()),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_time", dateRange.from.toISOString())
          .lte("scheduled_time", dateRange.to.toISOString()),
        supabase
          .from("offers")
          .select("id", { count: "exact", head: true })
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "under_contract")
          .gte("updated_at", dateRange.from.toISOString())
          .lte("updated_at", dateRange.to.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "closed")
          .gte("updated_at", dateRange.from.toISOString())
          .lte("updated_at", dateRange.to.toISOString()),
        // Previous period
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .gte("created_at", compareRange.from.toISOString())
          .lte("created_at", compareRange.to.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "contacted")
          .gte("updated_at", compareRange.from.toISOString())
          .lte("updated_at", compareRange.to.toISOString()),
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .gte("scheduled_time", compareRange.from.toISOString())
          .lte("scheduled_time", compareRange.to.toISOString()),
        supabase
          .from("offers")
          .select("id", { count: "exact", head: true })
          .gte("created_at", compareRange.from.toISOString())
          .lte("created_at", compareRange.to.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "under_contract")
          .gte("updated_at", compareRange.from.toISOString())
          .lte("updated_at", compareRange.to.toISOString()),
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "closed")
          .gte("updated_at", compareRange.from.toISOString())
          .lte("updated_at", compareRange.to.toISOString()),
      ]);

      const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const calcConversion = (from: number, to: number) => {
        if (from === 0) return 0;
        return Math.round((to / from) * 100);
      };

      const leads = leadsResult.count || 0;
      const prevLeads = prevLeadsResult.count || 0;
      const contacted = contactedResult.count || 0;
      const prevContacted = prevContactedResult.count || 0;
      const appointments = appointmentsResult.count || 0;
      const prevAppointments = prevAppointmentsResult.count || 0;
      const offers = offersResult.count || 0;
      const prevOffers = prevOffersResult.count || 0;
      const contracts = contractsResult.count || 0;
      const prevContracts = prevContractsResult.count || 0;
      const closed = closedResult.count || 0;
      const prevClosed = prevClosedResult.count || 0;

      return {
        leads: {
          value: leads,
          previousValue: prevLeads,
          change: calcChange(leads, prevLeads),
        },
        appointments: {
          value: appointments,
          previousValue: prevAppointments,
          change: calcChange(appointments, prevAppointments),
          conversionRate: calcConversion(leads, appointments),
        },
        offers: {
          value: offers,
          previousValue: prevOffers,
          change: calcChange(offers, prevOffers),
          conversionRate: calcConversion(appointments, offers),
        },
        contracts: {
          value: contracts,
          previousValue: prevContracts,
          change: calcChange(contracts, prevContracts),
          conversionRate: calcConversion(offers, contracts),
        },
        closed: {
          value: closed,
          previousValue: prevClosed,
          change: calcChange(closed, prevClosed),
          conversionRate: calcConversion(contracts, closed),
        },
        profit: {
          value: closed * 15000, // Placeholder - would need actual profit data
          previousValue: prevClosed * 15000,
          change: calcChange(closed * 15000, prevClosed * 15000),
        },
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

// ============ PIPELINE ANALYTICS ============

export function usePipelineAnalytics(dateRange: DateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-pipeline", dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      const stages = [
        { status: "new", name: "New Leads" },
        { status: "contacted", name: "Contacted" },
        { status: "appointment", name: "Appointments" },
        { status: "offer_made", name: "Offers Made" },
        { status: "under_contract", name: "Under Contract" },
        { status: "closed", name: "Closed" },
      ];

      const results = await Promise.all(
        stages.map(async ({ status, name }) => {
          const { count } = await supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("status", status);

          return {
            name,
            status,
            count: count || 0,
            value: 0, // Would calculate based on ARV/offer amounts
          };
        })
      );

      // Calculate conversion rates
      return results.map((stage, index) => {
        const prevStage = results[index - 1];
        return {
          ...stage,
          conversionRate: prevStage && prevStage.count > 0
            ? Math.round((stage.count / prevStage.count) * 100)
            : 100,
        };
      });
    },
    enabled: !!user,
  });
}

// ============ SOURCE ANALYTICS ============

export function useSourceAnalytics(dateRange: DateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-sources", dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      // Get properties with their sources
      const { data: properties } = await supabase
        .from("properties")
        .select("id, source, status, created_at")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      if (!properties) return [];

      // Group by source
      const sourceMap = new Map<string, SourceBreakdown>();

      properties.forEach((prop) => {
        const source = prop.source || "Unknown";
        const existing = sourceMap.get(source) || {
          name: source,
          leads: 0,
          contacted: 0,
          offers: 0,
          closed: 0,
          conversion: 0,
          revenue: 0,
        };

        existing.leads++;
        if (prop.status === "contacted" || prop.status === "appointment" || prop.status === "offer_made" || prop.status === "under_contract" || prop.status === "closed") {
          existing.contacted++;
        }
        if (prop.status === "offer_made" || prop.status === "under_contract" || prop.status === "closed") {
          existing.offers++;
        }
        if (prop.status === "closed") {
          existing.closed++;
          existing.revenue += 15000; // Placeholder
        }

        sourceMap.set(source, existing);
      });

      // Calculate conversion rates
      const results = Array.from(sourceMap.values()).map((source) => ({
        ...source,
        conversion: source.leads > 0 ? Math.round((source.closed / source.leads) * 100) : 0,
      }));

      return results.sort((a, b) => b.leads - a.leads);
    },
    enabled: !!user,
  });
}

// ============ DEAL FLOW TIME SERIES ============

export function useDealFlowTimeSeries(dateRange: DateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-dealflow", dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      const daysDiff = differenceInDays(dateRange.to, dateRange.from);
      
      // Choose granularity based on range
      let dates: Date[];
      let formatStr: string;
      
      if (daysDiff <= 14) {
        dates = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
        formatStr = "MMM d";
      } else if (daysDiff <= 90) {
        dates = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to });
        formatStr = "MMM d";
      } else {
        dates = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
        formatStr = "MMM yyyy";
      }

      // Get all properties and offers in range
      const [propertiesResult, offersResult, appointmentsResult] = await Promise.all([
        supabase
          .from("properties")
          .select("id, status, created_at, updated_at")
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString()),
        supabase
          .from("offers")
          .select("id, created_at")
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString()),
        supabase
          .from("appointments")
          .select("id, scheduled_time")
          .gte("scheduled_time", dateRange.from.toISOString())
          .lte("scheduled_time", dateRange.to.toISOString()),
      ]);

      const properties = propertiesResult.data || [];
      const offers = offersResult.data || [];
      const appointments = appointmentsResult.data || [];

      // Aggregate by date
      const timeSeriesData: TimeSeriesPoint[] = dates.map((date, index) => {
        const nextDate = dates[index + 1] || dateRange.to;
        const dateStr = format(date, formatStr);

        const leadsInPeriod = properties.filter(
          (p) => new Date(p.created_at!) >= date && new Date(p.created_at!) < nextDate
        ).length;

        const contactsInPeriod = appointments.filter(
          (a) => new Date(a.scheduled_time) >= date && new Date(a.scheduled_time) < nextDate
        ).length;

        const offersInPeriod = offers.filter(
          (o) => new Date(o.created_at!) >= date && new Date(o.created_at!) < nextDate
        ).length;

        const closedInPeriod = properties.filter(
          (p) =>
            p.status === "closed" &&
            p.updated_at &&
            new Date(p.updated_at) >= date &&
            new Date(p.updated_at) < nextDate
        ).length;

        return {
          date: dateStr,
          leads: leadsInPeriod,
          contacts: contactsInPeriod,
          offers: offersInPeriod,
          closed: closedInPeriod,
        };
      });

      return timeSeriesData;
    },
    enabled: !!user,
  });
}

// ============ MARKETING ANALYTICS ============

export function useMarketingAnalytics(dateRange: DateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-marketing", dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      const [campaignsResult, outreachResult] = await Promise.all([
        supabase
          .from("campaigns")
          .select("id, name, status, sent_count, opened_count, responded_count, properties_count")
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString()),
        supabase
          .from("outreach_log")
          .select("id, channel, status, created_at")
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString()),
      ]);

      const campaigns = campaignsResult.data || [];
      const outreach = outreachResult.data || [];

      // Calculate campaign metrics
      const campaignMetrics = campaigns.reduce(
        (acc, c) => ({
          totalSent: acc.totalSent + (c.sent_count || 0),
          totalOpened: acc.totalOpened + (c.opened_count || 0),
          totalResponded: acc.totalResponded + (c.responded_count || 0),
        }),
        { totalSent: 0, totalOpened: 0, totalResponded: 0 }
      );

      // Group outreach by channel
      const channelBreakdown = outreach.reduce((acc, o) => {
        const channel = o.channel || "Unknown";
        acc[channel] = (acc[channel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        campaigns: {
          count: campaigns.length,
          totalSent: campaignMetrics.totalSent,
          openRate: campaignMetrics.totalSent > 0
            ? Math.round((campaignMetrics.totalOpened / campaignMetrics.totalSent) * 100)
            : 0,
          responseRate: campaignMetrics.totalSent > 0
            ? Math.round((campaignMetrics.totalResponded / campaignMetrics.totalSent) * 100)
            : 0,
        },
        outreach: {
          total: outreach.length,
          byChannel: Object.entries(channelBreakdown).map(([name, value]) => ({
            name,
            value,
          })),
        },
      };
    },
    enabled: !!user,
  });
}

// ============ FINANCIAL ANALYTICS ============

export function useFinancialAnalytics(dateRange: DateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-financial", dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      const { data: closedDeals } = await supabase
        .from("properties")
        .select("id, arv, mao_standard, updated_at")
        .eq("status", "closed")
        .gte("updated_at", dateRange.from.toISOString())
        .lte("updated_at", dateRange.to.toISOString());

      const deals = closedDeals || [];
      
      // Calculate financial metrics
      const totalRevenue = deals.reduce((sum, d) => {
        // Estimate profit as ARV - MAO if available
        const profit = d.arv && d.mao_standard 
          ? (d.arv - d.mao_standard) * 0.3 // Rough profit margin
          : 15000; // Default estimate
        return sum + profit;
      }, 0);

      return {
        closedDeals: deals.length,
        totalRevenue,
        avgDealValue: deals.length > 0 ? Math.round(totalRevenue / deals.length) : 0,
        projectedPipeline: deals.length * 2 * 15000, // Rough projection
      };
    },
    enabled: !!user,
  });
}

// ============ AI INSIGHTS GENERATOR ============

export function useAIInsights(overviewData: ReturnType<typeof useOverviewAnalytics>["data"]) {
  return React.useMemo(() => {
    if (!overviewData) return [];

    const insights: Array<{
      id: string;
      type: "success" | "warning" | "info";
      title: string;
      description: string;
      metric?: string;
    }> = [];

    // Lead generation insight
    if (overviewData.leads.change > 20) {
      insights.push({
        id: "leads-up",
        type: "success",
        title: "Lead generation is up!",
        description: `You generated ${overviewData.leads.value} leads this period, ${overviewData.leads.change}% more than last period.`,
        metric: `+${overviewData.leads.change}% growth`,
      });
    } else if (overviewData.leads.change < -20) {
      insights.push({
        id: "leads-down",
        type: "warning",
        title: "Lead generation dropped",
        description: `Leads are down ${Math.abs(overviewData.leads.change)}%. Review marketing campaigns and outreach efforts.`,
        metric: `${overviewData.leads.change}% decline`,
      });
    }

    // Conversion insights
    if (overviewData.appointments.conversionRate && overviewData.appointments.conversionRate < 10) {
      insights.push({
        id: "low-apt-conversion",
        type: "warning",
        title: "Low appointment conversion",
        description: `Only ${overviewData.appointments.conversionRate}% of leads convert to appointments. Improve lead quality or follow-up process.`,
        metric: `${overviewData.appointments.conversionRate}% conversion`,
      });
    }

    // Offers insight
    if (overviewData.offers.change > 30) {
      insights.push({
        id: "offers-momentum",
        type: "success",
        title: "Strong offer momentum",
        description: `You made ${overviewData.offers.value} offers, ${overviewData.offers.change}% more than last period. Keep the pressure on!`,
        metric: `${overviewData.offers.value} offers sent`,
      });
    }

    // Closing insight
    if (overviewData.closed.value > 0) {
      insights.push({
        id: "deals-closed",
        type: "success",
        title: `${overviewData.closed.value} deal${overviewData.closed.value > 1 ? "s" : ""} closed!`,
        description: `You closed ${overviewData.closed.value} deal${overviewData.closed.value > 1 ? "s" : ""} this period.`,
        metric: `$${(overviewData.profit.value).toLocaleString()} estimated profit`,
      });
    }

    // Pipeline health
    if (overviewData.contracts.value > overviewData.closed.value * 2) {
      insights.push({
        id: "strong-pipeline",
        type: "info",
        title: "Strong pipeline ahead",
        description: `${overviewData.contracts.value} deals under contract. Focus on moving these to closing.`,
      });
    }

    return insights;
  }, [overviewData]);
}

// Re-export React for the useMemo in useAIInsights
import * as React from "react";
