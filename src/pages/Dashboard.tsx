import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useHotOpportunities } from "@/hooks/useHotOpportunities";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { usePipelineValueStats } from "@/hooks/usePipelineValueStats";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useDashboardInsights } from "@/hooks/useDashboardInsights";

import { GoalSettingsDialog, useGoals } from "@/components/dashboard/GoalSettingsDialog";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { TodaysTasks } from "@/components/dashboard/TodaysTasks";
import { FollowUpIntelligenceCard } from "@/components/dashboard/FollowUpIntelligenceCard";
import { PipelineValueCard } from "@/components/dashboard/PipelineValueCard";
import { PipelineOverviewCard } from "@/components/dashboard/PipelineOverviewCard";
import { HotOpportunitiesCard } from "@/components/dashboard/HotOpportunitiesCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { demoPipelineValueData, demoHotOpportunities, demoRecentActivity } from "@/components/dashboard/dashboard-demo-data";

import {
  Users,
  FileText,
  Handshake,
  BadgeDollarSign,
  Target,
  Hourglass,
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const [pipelineTimePeriod, setPipelineTimePeriod] = React.useState<string>("ALL TIME");
  const goals = useGoals();

  const { data: pipelineValueStatsRaw, isLoading: pipelineValueLoading } = usePipelineValueStats();
  const { data: hotOpportunities, isLoading: hotLoading } = useHotOpportunities(10);
  const { data: pipelineStats, isLoading: pipelineLoading } = usePipelineStats();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(20);
  const { data: insights } = useDashboardInsights();

  // Use demo data when no real data
  const hasRealData = pipelineValueStatsRaw && (
    pipelineValueStatsRaw.leads.count > 0 ||
    pipelineValueStatsRaw.offers.count > 0 ||
    pipelineValueStatsRaw.contracted.count > 0 ||
    pipelineValueStatsRaw.sold.count > 0
  );

  const pipelineValueStats = hasRealData ? pipelineValueStatsRaw : demoPipelineValueData;

  const realOpportunities = insights?.hotOpportunities || hotOpportunities || [];
  const displayHotOpportunities = realOpportunities.length >= 5
    ? realOpportunities
    : demoHotOpportunities;

  const hasEnoughRealActivity = (recentActivity?.length || 0) >= 4;
  const displayActivity = hasEnoughRealActivity ? recentActivity : demoRecentActivity;

  return (
    <AppLayout>
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-8">
        <div className="min-w-0">
          <p className="text-small text-muted-foreground font-medium">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
          <h1 className="text-h1 font-bold text-foreground mt-1">
            Welcome Back 👋
          </h1>
        </div>
        <GoalSettingsDialog>
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <Target className="h-4 w-4" />
            Goal Settings
          </Button>
        </GoalSettingsDialog>
      </div>

      {/* Today's Focus */}
      <TodaysFocus />

      {/* Pipeline Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-8 min-w-0">
        <div className="animate-fade-in min-w-0" style={{ animationDelay: '0ms' }}>
          <PipelineValueCard
            title="Leads"
            subtitle="New Opportunities"
            count={pipelineValueStats?.leads.count || 0}
            totalValue={pipelineValueStats?.leads.totalValue || 0}
            profitPotential={pipelineValueStats?.leads.profitPotential || 0}
            icon={Users}
            iconBg="bg-red-100"
            iconColor="text-red-500"
            isLoading={pipelineValueLoading}
            onClick={() => navigate("/properties?status=new,contacted,appointment")}
            goal={goals.leadsGoal}
            actionInsight={insights?.leadsInsight}
          />
        </div>
        <div className="animate-fade-in min-w-0" style={{ animationDelay: '100ms' }}>
          <PipelineValueCard
            title="Offers"
            subtitle="Active Proposals"
            count={pipelineValueStats?.offers.count || 0}
            totalValue={pipelineValueStats?.offers.totalValue || 0}
            profitPotential={pipelineValueStats?.offers.profitPotential || 0}
            icon={FileText}
            iconBg="bg-amber-100"
            iconColor="text-amber-500"
            isLoading={pipelineValueLoading}
            onClick={() => navigate("/properties?status=offer_made,negotiating")}
            goal={goals.offersGoal}
            contextLine={pipelineValueStats?.offers.count && pipelineValueStats.offers.count > 0
              ? `${pipelineValueStats.offers.count} ${pipelineValueStats.offers.count === 1 ? "Offer" : "Offers"} Awaiting Response`
              : undefined}
            contextIcon={Hourglass}
            contextSeverity="attention"
          />
        </div>
        <div className="animate-fade-in min-w-0" style={{ animationDelay: '200ms' }}>
          <PipelineValueCard
            title="Contracts"
            subtitle="Secured Deals"
            count={pipelineValueStats?.contracted.count || 0}
            totalValue={pipelineValueStats?.contracted.totalValue || 0}
            profitPotential={pipelineValueStats?.contracted.profitPotential || 0}
            icon={Handshake}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            valueLabel="Revenue Secured"
            isLoading={pipelineValueLoading}
            onClick={() => navigate("/pipeline?filter=under_contract")}
            goal={goals.contractsGoal}
            variant="calm"
            nextExpectedClose={pipelineValueStats?.contracted.count && pipelineValueStats.contracted.count > 0 ? 14 : undefined}
          />
        </div>
        <div className="animate-fade-in min-w-0" style={{ animationDelay: '300ms' }}>
          <PipelineValueCard
            title="Sold"
            subtitle="Closed Deals"
            count={pipelineValueStats?.sold.count || 0}
            totalValue={pipelineValueStats?.sold.totalValue || 0}
            profitPotential={pipelineValueStats?.sold.profitPotential || 0}
            icon={BadgeDollarSign}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            profitLabel="Realized Profit"
            isLoading={pipelineValueLoading}
            onClick={() => navigate("/properties?status=closed")}
            goal={goals.soldGoal}
            variant="celebration"
            lastClosedDaysAgo={pipelineValueStats?.sold.count && pipelineValueStats.sold.count > 0 ? 3 : undefined}
          />
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <HotOpportunitiesCard
          opportunities={displayHotOpportunities}
          isLoading={hotLoading}
        />
        <PipelineOverviewCard
          pipelineStats={pipelineStats}
          pipelineLoading={pipelineLoading}
          pipelineTimePeriod={pipelineTimePeriod}
          setPipelineTimePeriod={setPipelineTimePeriod}
          pipelineValueStats={pipelineValueStats}
        />
      </div>

      {/* Follow-Up Intelligence */}
      <div className="mb-8">
        <FollowUpIntelligenceCard />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysTasks />
        <RecentActivityCard
          activities={displayActivity}
          isLoading={activityLoading}
        />
      </div>
    </AppLayout>
  );
}
