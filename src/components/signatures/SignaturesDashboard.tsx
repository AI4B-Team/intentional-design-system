import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PenTool,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Send,
  XCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────

interface DashboardMetrics {
  totalSent: number;
  totalSigned: number;
  totalPending: number;
  totalDeclined: number;
  totalExpired: number;
  completionRate: number;
  avgSignTime: number; // hours
  expiringSoon: number;
  needsFollowUp: number;
  viewedNotSigned: number;
}

// ─── Mock Data ──────────────────────────────────────────────

const mockMetrics: DashboardMetrics = {
  totalSent: 156,
  totalSigned: 128,
  totalPending: 18,
  totalDeclined: 6,
  totalExpired: 4,
  completionRate: 82,
  avgSignTime: 14.2,
  expiringSoon: 3,
  needsFollowUp: 5,
  viewedNotSigned: 7,
};

const weeklyData = [
  { name: "Mon", sent: 4, signed: 3, declined: 0 },
  { name: "Tue", sent: 6, signed: 5, declined: 1 },
  { name: "Wed", sent: 3, signed: 4, declined: 0 },
  { name: "Thu", sent: 8, signed: 6, declined: 0 },
  { name: "Fri", sent: 5, signed: 7, declined: 1 },
  { name: "Sat", sent: 1, signed: 2, declined: 0 },
  { name: "Sun", sent: 0, signed: 1, declined: 0 },
];

const monthlyTrend = [
  { name: "Aug", rate: 74 },
  { name: "Sep", rate: 78 },
  { name: "Oct", rate: 76 },
  { name: "Nov", rate: 82 },
  { name: "Dec", rate: 80 },
  { name: "Jan", rate: 85 },
];

const statusBreakdown = [
  { name: "Signed", value: 128, color: "hsl(var(--success))" },
  { name: "Pending", value: 18, color: "hsl(var(--warning))" },
  { name: "Declined", value: 6, color: "hsl(var(--destructive))" },
  { name: "Expired", value: 4, color: "hsl(var(--muted-foreground))" },
];

const templateUsage = [
  { name: "Purchase Agmt", count: 47 },
  { name: "Assignment", count: 31 },
  { name: "Lead Paint", count: 22 },
  { name: "Seller Finance", count: 12 },
  { name: "Addendum", count: 8 },
];

// ─── Component ──────────────────────────────────────────────

export function SignaturesDashboard() {
  const metrics = mockMetrics;

  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{metrics.totalSent}</p>
              <p className="text-xs text-muted-foreground">Total Sent</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-success">{metrics.completionRate}%</p>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{metrics.avgSignTime}h</p>
              <p className="text-xs text-muted-foreground">Avg Sign Time</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{metrics.expiringSoon + metrics.needsFollowUp}</p>
              <p className="text-xs text-muted-foreground">Need Attention</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className={cn("border-l-4", metrics.expiringSoon > 0 ? "border-l-destructive" : "border-l-border-subtle")}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={cn("h-4 w-4", metrics.expiringSoon > 0 ? "text-destructive" : "text-muted-foreground")} />
            <span className="text-sm font-semibold text-foreground">Expiring Soon</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.expiringSoon}</p>
          <p className="text-xs text-muted-foreground">Documents expiring within 48 hours</p>
        </Card>

        <Card padding="md" className={cn("border-l-4", metrics.needsFollowUp > 0 ? "border-l-warning" : "border-l-border-subtle")}>
          <div className="flex items-center gap-2 mb-1">
            <Eye className={cn("h-4 w-4", metrics.needsFollowUp > 0 ? "text-warning" : "text-muted-foreground")} />
            <span className="text-sm font-semibold text-foreground">Needs Follow-Up</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.needsFollowUp}</p>
          <p className="text-xs text-muted-foreground">Viewed but not signed (6h+ ago)</p>
        </Card>

        <Card padding="md" className="border-l-4 border-l-border-subtle">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Declined</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.totalDeclined}</p>
          <p className="text-xs text-muted-foreground">Requests declined by recipients</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Weekly Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border-subtle))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="sent" fill="hsl(var(--brand))" radius={[3, 3, 0, 0]} />
              <Bar dataKey="signed" fill="hsl(var(--success))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Breakdown */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <PenTool className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Status Breakdown</h3>
          </div>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground flex-1">{item.name}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Completion Rate Trend */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Completion Rate Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-subtle))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border-subtle))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="rate" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Template Usage */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Top Templates</h3>
          </div>
          <div className="space-y-3">
            {templateUsage.map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.count} uses</span>
                  </div>
                  <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full"
                      style={{ width: `${(t.count / templateUsage[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
