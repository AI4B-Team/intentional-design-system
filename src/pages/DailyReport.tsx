import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  FileText,
  Flame,
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  DollarSign,
  Eye,
  Bell,
  Download,
} from "lucide-react";
import { useDailyReport } from "@/hooks/useDailyReport";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DailyReport() {
  const navigate = useNavigate();
  const { data: report, isLoading, refetch } = useDailyReport();
  const [dailyEmailEnabled, setDailyEmailEnabled] = React.useState(false);

  const handleEmailReport = () => {
    toast.success("Report sent to your email!");
  };

  const handleToggleDailyEmail = (enabled: boolean) => {
    setDailyEmailEnabled(enabled);
    toast.success(enabled ? "Daily emails enabled" : "Daily emails disabled");
  };

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Reports" }, { label: "Daily Report" }]}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Reports" }, { label: "Daily Report" }]}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-lg">
        <div>
          <h1 className="text-h1 font-semibold text-content flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-warning" />
            Daily Opportunity Report
          </h1>
          <p className="text-body text-content-secondary mt-1">
            Generated {report?.generatedAt}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmailReport}>
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <Switch
              id="daily-email"
              checked={dailyEmailEnabled}
              onCheckedChange={handleToggleDailyEmail}
            />
            <Label htmlFor="daily-email" className="text-small cursor-pointer">
              Daily Email
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-lg">
        {/* Section 1: Today's Priorities */}
        <Card variant="default" padding="lg">
          <div className="flex items-center gap-3 mb-md">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-content">Today's Priorities</h2>
              <p className="text-small text-content-secondary">Action items requiring immediate attention</p>
            </div>
          </div>

          {report?.priorities && report.priorities.length > 0 ? (
            <div className="space-y-3">
              {report.priorities.map((priority) => (
                <div
                  key={priority.id}
                  className={cn(
                    "p-4 rounded-lg border flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors",
                    priority.urgency === "critical" && "border-destructive/30 bg-destructive/5",
                    priority.urgency === "high" && "border-warning/30 bg-warning/5",
                    priority.urgency === "medium" && "border-info/30 bg-info/5"
                  )}
                  onClick={() => priority.link && navigate(priority.link)}
                >
                  <div className="flex items-start gap-3">
                    {priority.type === "velocity" && <Zap className="h-5 w-5 text-destructive mt-0.5" />}
                    {priority.type === "appointment" && <Calendar className="h-5 w-5 text-warning mt-0.5" />}
                    {priority.type === "followup" && <Phone className="h-5 w-5 text-info mt-0.5" />}
                    {priority.type === "offer_response" && <FileText className="h-5 w-5 text-info mt-0.5" />}
                    <div>
                      <p className="font-medium text-content">{priority.title}</p>
                      <p className="text-small text-content-secondary">{priority.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant={priority.urgency === "critical" ? "destructive" : priority.urgency === "high" ? "warning" : "secondary"}
                    size="sm"
                  >
                    {priority.action}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-content-secondary">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-success opacity-50" />
              <p>No urgent priorities today. Check back later!</p>
            </div>
          )}
        </Card>

        {/* Section 2: Overnight Activity */}
        <Card variant="default" padding="lg">
          <div className="flex items-center gap-3 mb-md">
            <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-info" />
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-content">Overnight Activity</h2>
              <p className="text-small text-content-secondary">What happened while you were away</p>
            </div>
          </div>

          {report?.overnightActivity && report.overnightActivity.length > 0 ? (
            <div className="space-y-2">
              {report.overnightActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {activity.type === "new_lead" && (
                      <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-success" />
                      </div>
                    )}
                    {activity.type === "response" && (
                      <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-info" />
                      </div>
                    )}
                    {activity.type === "status_change" && (
                      <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 text-warning" />
                      </div>
                    )}
                    {activity.type === "closed" && (
                      <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-success" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-content text-small">{activity.title}</p>
                      <p className="text-tiny text-content-secondary">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-tiny text-content-tertiary">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-content-secondary">
              <p>No overnight activity to report.</p>
            </div>
          )}
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {/* Section 3: Hot Opportunities */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-3 mb-md">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h2 className="text-h3 font-semibold text-content">Hot Opportunities</h2>
                <p className="text-small text-content-secondary">Top 10 by motivation score</p>
              </div>
            </div>

            <div className="space-y-2">
              {report?.hotOpportunities.slice(0, 5).map((opp, idx) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0 cursor-pointer hover:bg-muted/50 rounded-md px-2 -mx-2"
                  onClick={() => navigate(`/properties/${opp.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-small text-content-tertiary w-4">{idx + 1}</span>
                    <div>
                      <p className="font-medium text-content text-small">{opp.address}</p>
                      <p className="text-tiny text-content-secondary">
                        {opp.city}, {opp.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {opp.movement === "new" && (
                      <Badge variant="success" size="sm">NEW</Badge>
                    )}
                    <Badge
                      variant={opp.motivationScore >= 80 ? "destructive" : opp.motivationScore >= 60 ? "warning" : "secondary"}
                      size="sm"
                    >
                      {opp.motivationScore}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => navigate("/properties?sort=motivation")}
            >
              View all hot leads
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Card>

          {/* Section 4: Needs Attention */}
          <Card variant="default" padding="lg">
            <div className="flex items-center gap-3 mb-md">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-h3 font-semibold text-content">Needs Attention</h2>
                <p className="text-small text-content-secondary">Items that may be falling through the cracks</p>
              </div>
            </div>

            {report?.needsAttention && report.needsAttention.length > 0 ? (
              <div className="space-y-2">
                {report.needsAttention.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
                  >
                    <div>
                      <p className="font-medium text-content text-small">{item.address}</p>
                      <p className="text-tiny text-content-secondary">{item.issue}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-tiny text-destructive">{item.daysSince}d</span>
                      <Button variant="outline" size="sm" className="h-7 text-tiny">
                        {item.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-content-secondary">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success opacity-50" />
                <p>Everything looks good!</p>
              </div>
            )}
          </Card>
        </div>

        {/* Section 5: Performance Snapshot */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="text-h3 font-semibold text-content">Performance Snapshot</h2>
                <p className="text-small text-content-secondary">This week vs last week</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {report?.performance.map((perf) => (
              <div key={perf.metric} className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-tiny text-content-secondary uppercase mb-1">{perf.metric}</p>
                <p className="text-h2 font-bold text-content">{perf.thisWeek}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {perf.change > 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-success" />
                      <span className="text-tiny text-success">+{perf.change}%</span>
                    </>
                  ) : perf.change < 0 ? (
                    <>
                      <ArrowDown className="h-3 w-3 text-destructive" />
                      <span className="text-tiny text-destructive">{perf.change}%</span>
                    </>
                  ) : (
                    <span className="text-tiny text-content-tertiary">No change</span>
                  )}
                </div>
                <p className="text-tiny text-content-tertiary mt-1">vs {perf.lastWeek} last week</p>
              </div>
            ))}
          </div>

          {/* Pipeline Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center justify-between p-4 bg-brand-accent/5 rounded-lg">
              <div>
                <p className="text-small text-content-secondary">Pipeline Value</p>
                <p className="text-h3 font-bold text-brand-accent">
                  ${report?.pipelineValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-brand-accent/30" />
            </div>
            <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg">
              <div>
                <p className="text-small text-content-secondary">Projected Closings</p>
                <p className="text-h3 font-bold text-success">
                  {report?.projectedClosings} deals
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success/30" />
            </div>
          </div>
        </Card>

        {/* Custom Reports Placeholder */}
        <Card variant="default" padding="lg" className="border-dashed">
          <div className="text-center py-6">
            <Download className="h-10 w-10 mx-auto mb-3 text-content-tertiary" />
            <h3 className="text-h3 font-medium text-content mb-2">Custom Reports Builder</h3>
            <p className="text-small text-content-secondary mb-4 max-w-md mx-auto">
              Select custom metrics, filters, and date ranges to generate and export tailored reports.
            </p>
            <Button variant="secondary" disabled>
              Coming Soon
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
