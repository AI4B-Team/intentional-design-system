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
      <Card variant="default" padding="md">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-small text-muted-foreground font-medium">{title}</p>
          <p className="text-h1 font-bold text-foreground mt-1 tabular-nums">{value}</p>
          <div className={cn(
            "flex items-center gap-1 text-small mt-1",
            isPositive ? "text-success" : "text-destructive"
          )}>
            <TrendIcon className="h-3 w-3" />
            <span>{trend > 0 ? "+" : ""}{trend}% vs last period</span>
          </div>
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className="h-5 w-5 text-white" />
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
      className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-medium cursor-pointer transition-colors group"
      onClick={onClick}
    >
      {/* Score Badge */}
      <div className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-tiny font-semibold min-w-[52px] justify-center",
        scoreColor
      )}>
        {score > 800 && <Flame className="h-3 w-3" />}
        {score}
      </div>

      {/* Address */}
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-foreground truncate">
          {opportunity.address}
        </p>
        <p className="text-tiny text-muted-foreground">
          {[opportunity.city, opportunity.state].filter(Boolean).join(", ")}
        </p>
      </div>

      {/* Days Since Contact */}
      {daysSinceUpdate !== null && (
        <div className="text-tiny text-muted-foreground whitespace-nowrap">
          {daysSinceUpdate === 0 ? "Today" : daysSinceUpdate === 1 ? "1 day" : `${daysSinceUpdate} days`}
        </div>
      )}

      {/* Status */}
      <span className={cn("px-2 py-0.5 rounded-full text-tiny font-medium capitalize", statusColor)}>
        {(opportunity.status || "new").replace("_", " ")}
      </span>

      {/* Quick Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onCall}
          className="p-1.5 hover:bg-background-tertiary rounded-small transition-colors"
          title="Call"
        >
          <Phone className="h-4 w-4 text-muted-foreground" />
        </button>
        <button 
          onClick={onEmail}
          className="p-1.5 hover:bg-background-tertiary rounded-small transition-colors"
          title="Email"
        >
          <Mail className="h-4 w-4 text-muted-foreground" />
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

  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-medium cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={cn("w-3 h-3 rounded-full", stage.color)} />
      <div className="flex-1">
        <p className="text-small font-medium text-foreground">{stage.label}</p>
      </div>
      <div className="text-right">
        <p className="text-body font-semibold text-foreground tabular-nums">{stage.count}</p>
        {previousCount > 0 && (
          <p className="text-tiny text-muted-foreground">{conversionRate}% conv.</p>
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
    <div className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-medium transition-colors group">
      <Checkbox 
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="h-5 w-5"
      />
      <Icon className={cn(
        "h-4 w-4",
        task.type === "appointment" ? "text-warning" : "text-info"
      )} />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <p className={cn(
          "text-small font-medium truncate",
          task.completed ? "text-muted-foreground line-through" : "text-foreground"
        )}>
          {task.title}
        </p>
      </div>
      {task.time && (
        <div className="flex items-center gap-1 text-tiny text-muted-foreground">
          <Clock className="h-3 w-3" />
          {task.time}
        </div>
      )}
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={onClick} />
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
      className="flex items-start gap-3 p-3 hover:bg-background-secondary rounded-medium cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <div className={cn("p-2 rounded-full", color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-small text-foreground line-clamp-2">{activity.description}</p>
        <p className="text-tiny text-muted-foreground mt-0.5">{activity.relativeTime}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-h1 font-bold text-foreground">Dashboard</h1>
        <p className="text-body text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Top Row - Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hot Opportunities */}
        <Card variant="default" padding="none">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              <h2 className="text-h3 font-semibold text-foreground">Hot Opportunities</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/properties")}>
              View All
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
        <Card variant="default" padding="none">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <h2 className="text-h3 font-semibold text-foreground">Pipeline Overview</h2>
            <span className="text-small text-muted-foreground">{totalPipeline} total</span>
          </div>
          {pipelineLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
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
              <div className="flex h-3 rounded-full overflow-hidden bg-background-tertiary">
                {pipelineStats?.map((stage) => (
                  <div
                    key={stage.status}
                    className={cn("transition-all", stage.color)}
                    style={{ width: `${(stage.count / totalPipeline) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card variant="default" padding="none">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <h2 className="text-h3 font-semibold text-foreground">Today's Tasks</h2>
            </div>
            <span className="text-small text-muted-foreground">
              {todaysTasks?.filter(t => !completedTasks.has(t.id) && !t.completed).length || 0} remaining
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {tasksLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
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
                <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No tasks for today</p>
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
        <Card variant="default" padding="none">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-h3 font-semibold text-foreground">Recent Activity</h2>
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {activityLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
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
