import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useHotOpportunities } from "@/hooks/useHotOpportunities";
import { usePipelineStats } from "@/hooks/usePipelineStats";
import { useTodaysTasks } from "@/hooks/useTodaysTasks";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { DispoWidget } from "@/components/dashboard/DispoWidget";
import {
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  Flame,
  Clock,
  ArrowRight,
  Plus,
  Send,
  UserCheck,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.ElementType;
  iconBg: string;
  isLoading?: boolean;
  invertTrend?: boolean;
}

function StatCard({ title, value, trend, icon: Icon, iconBg, isLoading, invertTrend }: StatCardProps) {
  const isPositive = invertTrend ? trend <= 0 : trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  if (isLoading) {
    return (
      <Card variant="default" padding="md" className="animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      variant="default" 
      padding="md" 
      className="group relative overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-small text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
          <p className="text-[2rem] font-bold text-foreground tabular-nums leading-tight">{value.toLocaleString()}</p>
          <div className={cn(
            "inline-flex items-center gap-1.5 text-small font-medium px-2 py-0.5 rounded-full",
            isPositive 
              ? "text-success bg-success/10" 
              : "text-destructive bg-destructive/10"
          )}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{trend > 0 ? "+" : ""}{trend}%</span>
          </div>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105",
          iconBg
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

// Hot Opportunity Item
interface HotOpportunityItemProps {
  opportunity: {
    id: string;
    address: string;
    city: string | null;
    state: string | null;
    motivation_score: number | null;
    status: string | null;
    updated_at: string | null;
    owner_phone: string | null;
    owner_email: string | null;
  };
  onClick: () => void;
  onCall: (e: React.MouseEvent) => void;
  onEmail: (e: React.MouseEvent) => void;
}

function HotOpportunityItem({ opportunity, onClick, onCall, onEmail }: HotOpportunityItemProps) {
  const score = opportunity.motivation_score || 0;
  const scoreColor = score > 800 ? "bg-destructive text-destructive-foreground" 
    : score > 500 ? "bg-warning text-warning-foreground" 
    : "bg-muted text-muted-foreground";
  
  const daysSinceUpdate = opportunity.updated_at 
    ? Math.floor((Date.now() - new Date(opportunity.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statusColor = {
    new: "bg-muted text-muted-foreground",
    contacted: "bg-info/10 text-info",
    appointment: "bg-warning/10 text-warning",
    offer_made: "bg-accent/10 text-accent",
    under_contract: "bg-chart-4/10 text-chart-4",
    closed: "bg-success/10 text-success",
    dead: "bg-destructive/10 text-destructive",
  }[opportunity.status || "new"] || "bg-muted text-muted-foreground";

  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-all duration-150 group hover:shadow-sm"
      onClick={onClick}
    >
      {/* Score Badge */}
      <div className={cn(
        "flex items-center gap-1 px-2.5 py-1 rounded-full text-tiny font-bold min-w-[56px] justify-center shadow-sm transition-transform duration-150 group-hover:scale-105",
        scoreColor
      )}>
        {score > 800 && <Flame className="h-3 w-3 animate-pulse" />}
        {score}
      </div>

      {/* Address */}
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {opportunity.address}
        </p>
        <p className="text-tiny text-muted-foreground">
          {[opportunity.city, opportunity.state].filter(Boolean).join(", ")}
        </p>
      </div>

      {/* Days Since Contact */}
      {daysSinceUpdate !== null && (
        <div className="text-tiny text-muted-foreground whitespace-nowrap tabular-nums">
          {daysSinceUpdate === 0 ? "Today" : daysSinceUpdate === 1 ? "1 day" : `${daysSinceUpdate}d`}
        </div>
      )}

      {/* Status */}
      <span className={cn("px-2 py-0.5 rounded-full text-tiny font-medium capitalize transition-all duration-150", statusColor)}>
        {(opportunity.status || "new").replace("_", " ")}
      </span>

      {/* Quick Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={onCall}
          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
          title="Call"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button 
          onClick={onEmail}
          className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
          title="Email"
        >
          <Mail className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Pipeline Stage
interface PipelineStageProps {
  stage: {
    status: string;
    label: string;
    count: number;
    color: string;
  };
  total: number;
  previousCount: number;
  onClick: () => void;
}

function PipelineStage({ stage, total, previousCount, onClick }: PipelineStageProps) {
  const conversionRate = previousCount > 0 ? Math.round((stage.count / previousCount) * 100) : 0;
  const percentage = total > 0 ? Math.round((stage.count / total) * 100) : 0;

  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-all duration-150 group"
      onClick={onClick}
    >
      <div className={cn("w-3 h-3 rounded-full shadow-sm transition-transform duration-150 group-hover:scale-125", stage.color)} />
      <div className="flex-1">
        <p className="text-small font-medium text-foreground group-hover:text-primary transition-colors">{stage.label}</p>
      </div>
      <div className="text-right flex items-center gap-3">
        <div className="w-16 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-300", stage.color)} 
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-body font-bold text-foreground tabular-nums w-8 text-right">{stage.count}</p>
        {previousCount > 0 && conversionRate > 0 && (
          <p className="text-tiny text-muted-foreground w-12 text-right">{conversionRate}%</p>
        )}
      </div>
    </div>
  );
}

// Task Item
interface TaskItemProps {
  task: {
    id: string;
    type: "appointment" | "followup";
    title: string;
    time: string | null;
    propertyId: string;
    completed: boolean;
  };
  onToggle: (id: string) => void;
  onClick: () => void;
}

function TaskItem({ task, onToggle, onClick }: TaskItemProps) {
  const Icon = task.type === "appointment" ? CalendarCheck : Phone;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg transition-all duration-150 group",
      task.completed 
        ? "bg-background-secondary/50" 
        : "hover:bg-background-secondary hover:shadow-sm"
    )}>
      <Checkbox 
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="h-5 w-5 transition-transform duration-150 hover:scale-110"
      />
      <div className={cn(
        "p-1.5 rounded-md transition-all duration-150",
        task.completed ? "opacity-50" : "",
        task.type === "appointment" ? "bg-warning/10" : "bg-info/10"
      )}>
        <Icon className={cn(
          "h-4 w-4",
          task.type === "appointment" ? "text-warning" : "text-info"
        )} />
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <p className={cn(
          "text-small font-medium truncate transition-colors",
          task.completed 
            ? "text-muted-foreground line-through" 
            : "text-foreground group-hover:text-primary"
        )}>
          {task.title}
        </p>
      </div>
      {task.time && (
        <div className={cn(
          "flex items-center gap-1.5 text-tiny px-2 py-0.5 rounded-full",
          task.completed ? "text-muted-foreground" : "text-muted-foreground bg-background-secondary"
        )}>
          <Clock className="h-3 w-3" />
          {task.time}
        </div>
      )}
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-150 translate-x-2 group-hover:translate-x-0 cursor-pointer" onClick={onClick} />
    </div>
  );
}

// Activity Item
interface ActivityItemProps {
  activity: {
    id: string;
    type: string;
    description: string;
    relativeTime: string;
    propertyId?: string;
  };
  onClick: () => void;
}

function ActivityItem({ activity, onClick }: ActivityItemProps) {
  const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
    property_added: { icon: Plus, color: "bg-success/10 text-success" },
    offer_sent: { icon: Send, color: "bg-accent/10 text-accent" },
    response_received: { icon: FileText, color: "bg-warning/10 text-warning" },
    appointment_scheduled: { icon: Calendar, color: "bg-info/10 text-info" },
    status_changed: { icon: UserCheck, color: "bg-chart-4/10 text-chart-4" },
  };

  const { icon: Icon, color } = iconMap[activity.type] || { icon: FileText, color: "bg-muted text-muted-foreground" };

  return (
    <div 
      className="flex items-start gap-3 p-3 hover:bg-background-secondary rounded-lg cursor-pointer transition-all duration-150 group"
      onClick={onClick}
    >
      <div className={cn("p-2 rounded-lg shadow-sm transition-transform duration-150 group-hover:scale-105", color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-small text-foreground line-clamp-2 group-hover:text-primary transition-colors">{activity.description}</p>
        <p className="text-tiny text-muted-foreground mt-1">{activity.relativeTime}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-150 mt-1 translate-x-2 group-hover:translate-x-0" />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = React.useState<Set<string>>(new Set());
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: hotOpportunities, isLoading: hotLoading } = useHotOpportunities(10);
  const { data: pipelineStats, isLoading: pipelineLoading } = usePipelineStats();
  const { data: todaysTasks, isLoading: tasksLoading } = useTodaysTasks();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(20);

  const handleTaskToggle = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleCall = (e: React.MouseEvent, phone: string | null) => {
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleEmail = (e: React.MouseEvent, email: string | null) => {
    e.stopPropagation();
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const totalPipeline = pipelineStats?.reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <AppLayout>
      {/* Greeting Header */}
      <div className="mb-8">
        <p className="text-small text-muted-foreground font-medium">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
        <h1 className="text-h1 font-bold text-foreground mt-1">
          Welcome Back 👋
        </h1>
      </div>

      {/* Top Row - Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Leads"
          value={stats?.activeLeads.count || 0}
          trend={stats?.activeLeads.trend || 0}
          icon={Building2}
          iconBg="bg-accent"
          isLoading={statsLoading}
        />
        <StatCard
          title="Appointments This Week"
          value={stats?.appointmentsThisWeek.count || 0}
          trend={stats?.appointmentsThisWeek.trend || 0}
          icon={Calendar}
          iconBg="bg-warning"
          isLoading={statsLoading}
        />
        <StatCard
          title="Offers Pending"
          value={stats?.offersPending.count || 0}
          trend={stats?.offersPending.trend || 0}
          icon={FileText}
          iconBg="bg-info"
          isLoading={statsLoading}
          invertTrend
        />
        <StatCard
          title="Closed This Month"
          value={stats?.closedThisMonth.count || 0}
          trend={stats?.closedThisMonth.trend || 0}
          icon={CheckCircle}
          iconBg="bg-success"
          isLoading={statsLoading}
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hot Opportunities */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-destructive/5 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-destructive/10">
                <Flame className="h-4 w-4 text-destructive" />
              </div>
              <h2 className="text-body font-semibold text-foreground">Hot Opportunities</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/properties")}>
              View All
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {hotLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-14 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hotOpportunities?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No properties yet</p>
              </div>
            ) : (
              <div className="p-2">
                {hotOpportunities?.map((opp) => (
                  <HotOpportunityItem
                    key={opp.id}
                    opportunity={opp}
                    onClick={() => navigate(`/properties/${opp.id}`)}
                    onCall={(e) => handleCall(e, opp.owner_phone)}
                    onEmail={(e) => handleEmail(e, opp.owner_email)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Pipeline Overview */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <h2 className="text-body font-semibold text-foreground">Pipeline Overview</h2>
            <span className="text-small font-medium px-2.5 py-1 rounded-full bg-background-secondary text-muted-foreground tabular-nums">
              {totalPipeline} total
            </span>
          </div>
          {pipelineLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2">
              {pipelineStats?.map((stage, index) => (
                <PipelineStage
                  key={stage.status}
                  stage={stage}
                  total={totalPipeline}
                  previousCount={index > 0 ? pipelineStats[index - 1].count : stage.count}
                  onClick={() => navigate(`/properties?status=${stage.status}`)}
                />
              ))}
            </div>
          )}
          {/* Visual Bar */}
          {!pipelineLoading && totalPipeline > 0 && (
            <div className="px-4 pb-4">
              <div className="flex h-2.5 rounded-full overflow-hidden bg-background-tertiary shadow-inner">
                {pipelineStats?.map((stage) => (
                  <div
                    key={stage.status}
                    className={cn("transition-all duration-500", stage.color)}
                    style={{ width: `${(stage.count / totalPipeline) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Dispo Widget */}
      <div className="mb-8">
        <DispoWidget />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-accent/5 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Calendar className="h-4 w-4 text-accent" />
              </div>
              <h2 className="text-body font-semibold text-foreground">Today's Tasks</h2>
            </div>
            <span className="text-small font-medium px-2.5 py-1 rounded-full bg-background-secondary text-muted-foreground tabular-nums">
              {todaysTasks?.filter(t => !completedTasks.has(t.id) && !t.completed).length || 0} remaining
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {tasksLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : todaysTasks?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">All caught up!</p>
                <p className="text-tiny mt-1">No tasks for today</p>
              </div>
            ) : (
              <div className="p-2">
                {todaysTasks?.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={{
                      ...task,
                      completed: task.completed || completedTasks.has(task.id),
                    }}
                    onToggle={handleTaskToggle}
                    onClick={() => navigate(`/properties/${task.propertyId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <h2 className="text-body font-semibold text-foreground">Recent Activity</h2>
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {activityLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No activity yet</p>
                <p className="text-tiny mt-1">Start adding properties to see activity</p>
              </div>
            ) : (
              <div className="p-2">
                {recentActivity?.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onClick={() => activity.propertyId && navigate(`/properties/${activity.propertyId}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
