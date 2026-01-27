import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  subDays,
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
  status: string;
  count: number;
  value: number;
  conversionRate: number;
  avgDays: number;
  onTrack: number;
  slowing: number;
  stalled: number;
}

export interface VelocityMetric {
  stage: string;
  avgDays: number;
  benchmark: number;
}

export interface StalledDeal {
  id: string;
  address: string;
  stage: string;
  daysAtStage: number;
  lastActivity: string;
  arv: number | null;
}

export interface SourceBreakdown {
  name: string;
  leads: number;
  contacted: number;
  appointments: number;
  offers: number;
  contracts: number;
  closed: number;
  conversion: number;
  revenue: number;
  cost: number;
  cpl: number;
  cpa: number;
  roi: number;
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

export interface SourceRecommendation {
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  source: string;
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

export function usePipelineAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-pipeline-enhanced", user?.id],
    queryFn: async () => {
      const stages = [
        { status: "new", name: "New Leads", benchmark: 3 },
        { status: "contacted", name: "Contacted", benchmark: 5 },
        { status: "appointment", name: "Appointments", benchmark: 7 },
        { status: "offer_made", name: "Offers Made", benchmark: 10 },
        { status: "under_contract", name: "Under Contract", benchmark: 30 },
        { status: "closed", name: "Closed", benchmark: 0 },
      ];

      // Get all properties with their data
      const { data: properties } = await supabase
        .from("properties")
        .select("id, address, status, created_at, updated_at, arv, mao_standard");

      if (!properties) return { stages: [], velocity: [], totalValue: 0, weightedValue: 0 };

      const now = new Date();

      // Group properties by stage and calculate metrics
      const stageResults = stages.map(({ status, name, benchmark }, index) => {
        const stageProps = properties.filter(p => p.status === status);
        const count = stageProps.length;
        
        // Calculate value (ARV - MAO spread)
        const value = stageProps.reduce((sum, p) => {
          if (p.arv && p.mao_standard) {
            return sum + (p.arv - p.mao_standard);
          }
          return sum + 15000; // Default spread estimate
        }, 0);

        // Calculate health distribution
        let onTrack = 0, slowing = 0, stalled = 0;
        stageProps.forEach(p => {
          const daysAtStage = Math.floor((now.getTime() - new Date(p.updated_at || p.created_at || now).getTime()) / (1000 * 60 * 60 * 24));
          if (daysAtStage <= benchmark) onTrack++;
          else if (daysAtStage <= benchmark * 1.5) slowing++;
          else stalled++;
        });

        // Calculate average days at stage
        const avgDays = stageProps.length > 0
          ? Math.round(stageProps.reduce((sum, p) => {
              return sum + Math.floor((now.getTime() - new Date(p.updated_at || p.created_at || now).getTime()) / (1000 * 60 * 60 * 24));
            }, 0) / stageProps.length)
          : 0;

        return {
          name,
          status,
          count,
          value,
          avgDays,
          benchmark,
          onTrack,
          slowing,
          stalled,
          conversionRate: 0, // Will be calculated below
        };
      });

      // Calculate conversion rates
      const stagesWithConversion = stageResults.map((stage, index) => {
        const prevStage = stageResults[index - 1];
        return {
          ...stage,
          conversionRate: prevStage && prevStage.count > 0
            ? Math.round((stage.count / prevStage.count) * 100)
            : 100,
        };
      });

      // Calculate velocity metrics
      const velocity: VelocityMetric[] = stages.slice(0, -1).map(({ name, benchmark }) => ({
        stage: name,
        avgDays: stagesWithConversion.find(s => s.name === name)?.avgDays || 0,
        benchmark,
      }));

      // Calculate total and weighted pipeline value
      const totalValue = stagesWithConversion.reduce((sum, s) => sum + s.value, 0);
      const weightedValue = stagesWithConversion.reduce((sum, s, idx) => {
        // Weight by conversion probability (higher stages = higher probability)
        const weight = (idx + 1) / stagesWithConversion.length;
        return sum + (s.value * weight);
      }, 0);

      return {
        stages: stagesWithConversion,
        velocity,
        totalValue,
        weightedValue,
      };
    },
    enabled: !!user,
  });
}

// ============ STALLED DEALS ============

export function useStalledDeals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stalled-deals", user?.id],
    queryFn: async () => {
      const stageBenchmarks: Record<string, number> = {
        new: 3,
        contacted: 5,
        appointment: 7,
        offer_made: 10,
        under_contract: 30,
      };

      const { data: properties } = await supabase
        .from("properties")
        .select("id, address, status, created_at, updated_at, arv")
        .in("status", ["new", "contacted", "appointment", "offer_made", "under_contract"]);

      if (!properties) return [];

      const now = new Date();
      
      const stalledDeals: StalledDeal[] = properties
        .map(p => {
          const daysAtStage = Math.floor(
            (now.getTime() - new Date(p.updated_at || p.created_at || now).getTime()) / (1000 * 60 * 60 * 24)
          );
          const benchmark = stageBenchmarks[p.status || "new"] || 7;
          
          return {
            id: p.id,
            address: p.address,
            stage: p.status || "new",
            daysAtStage,
            lastActivity: p.updated_at || p.created_at || now.toISOString(),
            arv: p.arv,
            isStalled: daysAtStage > benchmark * 2,
            benchmark,
          };
        })
        .filter(d => d.isStalled)
        .sort((a, b) => b.daysAtStage - a.daysAtStage)
        .slice(0, 20);

      return stalledDeals;
    },
    enabled: !!user,
  });
}

// ============ SOURCE RECOMMENDATIONS ============

export function useSourceRecommendations(sources: SourceBreakdown[] | undefined) {
  return React.useMemo(() => {
    if (!sources || sources.length === 0) return [];

    const recommendations: SourceRecommendation[] = [];

    // Find highest ROI source
    const highestROI = sources.reduce((best, s) => s.roi > best.roi ? s : best, sources[0]);
    if (highestROI.roi > 100) {
      recommendations.push({
        type: "success",
        title: `${highestROI.name} has exceptional ROI`,
        description: `Consider increasing focus on ${highestROI.name} - ${highestROI.roi}% ROI is your best performer.`,
        source: highestROI.name,
      });
    }

    // Find low conversion sources
    const lowConversion = sources.filter(s => s.leads >= 5 && s.conversion < 5);
    if (lowConversion.length > 0) {
      recommendations.push({
        type: "warning",
        title: `${lowConversion[0].name} has low conversion`,
        description: `Only ${lowConversion[0].conversion}% of leads convert. Review lead quality or follow-up process.`,
        source: lowConversion[0].name,
      });
    }

    // Find high volume sources
    const highVolume = sources.filter(s => s.leads > 10)[0];
    if (highVolume && highVolume.conversion >= 10) {
      recommendations.push({
        type: "info",
        title: `${highVolume.name} is your volume leader`,
        description: `${highVolume.leads} leads with ${highVolume.conversion}% conversion. Solid performer.`,
        source: highVolume.name,
      });
    }

    // Find untapped potential
    const untapped = sources.find(s => s.leads >= 3 && s.closed === 0 && s.contracts > 0);
    if (untapped) {
      recommendations.push({
        type: "info",
        title: `${untapped.name} has deals in pipeline`,
        description: `${untapped.contracts} under contract - focus on closing these for first wins from this source.`,
        source: untapped.name,
      });
    }

    return recommendations;
  }, [sources]);
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
        .select("id, source, status, created_at, arv, mao_standard")
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
          appointments: 0,
          offers: 0,
          contracts: 0,
          closed: 0,
          conversion: 0,
          revenue: 0,
          cost: 0, // Would be tracked separately
          cpl: 0,
          cpa: 0,
          roi: 0,
        };

        existing.leads++;
        if (["contacted", "appointment", "offer_made", "under_contract", "closed"].includes(prop.status || "")) {
          existing.contacted++;
        }
        if (prop.status === "appointment" || prop.status === "offer_made" || prop.status === "under_contract" || prop.status === "closed") {
          existing.appointments++;
        }
        if (["offer_made", "under_contract", "closed"].includes(prop.status || "")) {
          existing.offers++;
        }
        if (prop.status === "under_contract" || prop.status === "closed") {
          existing.contracts++;
        }
        if (prop.status === "closed") {
          existing.closed++;
          // Calculate profit from ARV - MAO or use placeholder
          const profit = prop.arv && prop.mao_standard 
            ? (prop.arv - prop.mao_standard) * 0.3 
            : 15000;
          existing.revenue += profit;
        }

        sourceMap.set(source, existing);
      });

      // Calculate derived metrics
      const results = Array.from(sourceMap.values()).map((source) => {
        // Estimate marketing cost per source type
        const estimatedCost = source.name.toLowerCase().includes("mail") ? source.leads * 2 
          : source.name.toLowerCase().includes("cold") ? source.leads * 0.5
          : source.name.toLowerCase().includes("referral") ? 0
          : source.leads * 1;
        
        return {
          ...source,
          cost: estimatedCost,
          conversion: source.leads > 0 ? Math.round((source.closed / source.leads) * 100) : 0,
          cpl: source.leads > 0 ? Math.round(estimatedCost / source.leads) : 0,
          cpa: source.closed > 0 ? Math.round(estimatedCost / source.closed) : 0,
          roi: estimatedCost > 0 ? Math.round(((source.revenue - estimatedCost) / estimatedCost) * 100) : source.revenue > 0 ? 999 : 0,
        };
      });

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

export interface DealEconomics {
  id: string;
  address: string;
  type: string;
  purchasePrice: number;
  repairCost: number;
  sellPrice: number;
  profit: number;
  roi: number;
  daysToClose: number;
  closedDate: string;
}

export interface MonthlyProfit {
  month: string;
  profit: number;
  deals: number;
}

export interface ProfitByType {
  type: string;
  profit: number;
  count: number;
  avgProfit: number;
}

export interface ExpenseCategory {
  name: string;
  value: number;
}

export function useFinancialAnalytics(dateRange: DateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-financial-enhanced", dateRange.from.toISOString(), dateRange.to.toISOString(), user?.id],
    queryFn: async () => {
      const { data: closedDeals } = await supabase
        .from("properties")
        .select("id, address, property_type, arv, mao_standard, repair_estimate, created_at, updated_at")
        .eq("status", "closed")
        .gte("updated_at", dateRange.from.toISOString())
        .lte("updated_at", dateRange.to.toISOString());

      const deals = closedDeals || [];
      
      // Calculate individual deal economics
      const dealEconomics: DealEconomics[] = deals.map((d) => {
        const purchasePrice = d.mao_standard || 150000;
        const repairCost = d.repair_estimate || 25000;
        const sellPrice = d.arv || 200000;
        const totalCost = purchasePrice + repairCost;
        const profit = sellPrice - totalCost;
        const roi = totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0;
        const daysToClose = Math.floor(
          (new Date(d.updated_at!).getTime() - new Date(d.created_at!).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: d.id,
          address: d.address,
          type: d.property_type || "Wholesale",
          purchasePrice,
          repairCost,
          sellPrice,
          profit,
          roi,
          daysToClose: Math.max(1, daysToClose),
          closedDate: format(new Date(d.updated_at!), "MMM d, yyyy"),
        };
      });

      // Calculate totals
      const grossRevenue = dealEconomics.reduce((sum, d) => sum + d.sellPrice, 0);
      const totalCosts = dealEconomics.reduce((sum, d) => sum + d.purchasePrice + d.repairCost, 0);
      const netProfit = dealEconomics.reduce((sum, d) => sum + d.profit, 0);
      const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

      // Monthly profit breakdown
      const monthlyMap = new Map<string, { profit: number; deals: number }>();
      dealEconomics.forEach((d) => {
        const monthKey = format(new Date(d.closedDate), "MMM yyyy");
        const existing = monthlyMap.get(monthKey) || { profit: 0, deals: 0 };
        monthlyMap.set(monthKey, {
          profit: existing.profit + d.profit,
          deals: existing.deals + 1,
        });
      });
      const monthlyProfit: MonthlyProfit[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        profit: data.profit,
        deals: data.deals,
      }));

      // Profit by deal type
      const typeMap = new Map<string, { profit: number; count: number }>();
      dealEconomics.forEach((d) => {
        const type = d.type || "Wholesale";
        const existing = typeMap.get(type) || { profit: 0, count: 0 };
        typeMap.set(type, {
          profit: existing.profit + d.profit,
          count: existing.count + 1,
        });
      });
      const profitByType: ProfitByType[] = Array.from(typeMap.entries()).map(([type, data]) => ({
        type,
        profit: data.profit,
        count: data.count,
        avgProfit: data.count > 0 ? Math.round(data.profit / data.count) : 0,
      }));

      // Expense breakdown (estimated)
      const marketingCost = Math.round(totalCosts * 0.05); // 5% of costs
      const acquisitionCost = Math.round(totalCosts * 0.02); // 2% closing costs
      const holdingCost = Math.round(totalCosts * 0.03); // 3% holding
      const closingCost = Math.round(totalCosts * 0.04); // 4% selling costs
      const otherCost = Math.round(totalCosts * 0.01); // 1% misc

      const expenseBreakdown: ExpenseCategory[] = [
        { name: "Marketing", value: marketingCost },
        { name: "Acquisition", value: acquisitionCost },
        { name: "Holding", value: holdingCost },
        { name: "Closing", value: closingCost },
        { name: "Other", value: otherCost },
      ];

      // Get pipeline for projected value
      const { data: pipelineDeals } = await supabase
        .from("properties")
        .select("id, arv, mao_standard")
        .in("status", ["under_contract", "offer_made"]);

      const projectedPipeline = (pipelineDeals || []).reduce((sum, d) => {
        if (d.arv && d.mao_standard) {
          return sum + (d.arv - d.mao_standard);
        }
        return sum + 15000;
      }, 0);

      return {
        closedDeals: deals.length,
        grossRevenue,
        totalCosts,
        netProfit,
        profitMargin,
        avgDealValue: deals.length > 0 ? Math.round(netProfit / deals.length) : 0,
        projectedPipeline,
        dealEconomics,
        monthlyProfit,
        profitByType,
        expenseBreakdown,
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
