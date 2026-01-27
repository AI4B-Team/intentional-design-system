import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PremiumTable, type Column } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Mail,
  MessageSquare,
  FileText,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  RefreshCw,
  ExternalLink,
  Inbox,
  Activity,
} from "lucide-react";
import { useAllOffers, useOfferStats, useOfferActivity } from "@/hooks/useOfferTracking";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getDeliveryStatusIcon(status: string) {
  switch (status) {
    case "delivered":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
    case "opened":
      return <Eye className="h-3.5 w-3.5 text-info" />;
    case "clicked":
      return <ExternalLink className="h-3.5 w-3.5 text-brand" />;
    case "bounced":
    case "failed":
      return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    default:
      return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function getChannelIcon(channel: string) {
  switch (channel) {
    case "email":
      return Mail;
    case "sms":
      return MessageSquare;
    case "mail":
      return FileText;
    default:
      return Send;
  }
}

function StatCard({
  label,
  value,
  trend,
  icon,
  iconBgClass,
}: {
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon: React.ReactNode;
  iconBgClass: string;
}) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconBgClass)}>
          {icon}
        </div>
        {trend && (
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-tiny font-medium",
              trend.isPositive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="text-display font-semibold text-content tabular-nums mb-1">{value}</div>
      <div className="text-small text-content-secondary uppercase tracking-wide">{label}</div>
    </Card>
  );
}

function ActivityItem({
  activity,
  onClick,
}: {
  activity: {
    id: string;
    type: string;
    channel: string;
    timestamp: string;
    propertyAddress?: string;
    ownerName?: string;
    propertyId?: string;
  };
  onClick: () => void;
}) {
  const ChannelIcon = getChannelIcon(activity.channel);
  
  const getActivityMessage = () => {
    const owner = activity.ownerName || "Owner";
    const property = activity.propertyAddress || "a property";
    
    switch (activity.type) {
      case "opened":
        return (
          <>
            <span className="font-medium text-foreground">{owner}</span>
            {" opened your offer for "}
            <span className="font-medium text-foreground">{property}</span>
          </>
        );
      case "clicked":
        return (
          <>
            <span className="font-medium text-foreground">{owner}</span>
            {" clicked a link in your offer for "}
            <span className="font-medium text-foreground">{property}</span>
          </>
        );
      case "sent":
        return (
          <>
            {"Offer sent via "}
            <span className="capitalize">{activity.channel}</span>
            {" for "}
            <span className="font-medium text-foreground">{property}</span>
          </>
        );
      default:
        return `Activity for ${property}`;
    }
  };

  const getActivityIcon = () => {
    switch (activity.type) {
      case "opened":
        return "🔥";
      case "clicked":
        return "👆";
      case "sent":
        return "📧";
      default:
        return "📋";
    }
  };

  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-3 rounded-medium hover:bg-background-secondary transition-colors text-left w-full"
    >
      <span className="text-lg">{getActivityIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className="text-small text-muted-foreground">{getActivityMessage()}</p>
        <p className="text-tiny text-muted-foreground/70 mt-0.5">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
      <ChannelIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
    </button>
  );
}

const filterOptions = [
  { value: "all", label: "All Offers" },
  { value: "opened", label: "Opened (no response)" },
  { value: "not_opened", label: "Not Opened" },
  { value: "followup_due", label: "Follow-up Due" },
];

export default function Offers() {
  const navigate = useNavigate();
  const { data: offers, isLoading: offersLoading } = useAllOffers();
  const { data: stats, isLoading: statsLoading } = useOfferStats();
  const { data: activity, isLoading: activityLoading } = useOfferActivity();
  
  const [filter, setFilter] = React.useState("all");

  // Filter pending offers
  const pendingOffers = React.useMemo(() => {
    if (!offers) return [];
    return offers.filter(o => !o.response || o.response === "pending");
  }, [offers]);

  const columns: Column<any>[] = [
    {
      key: "property",
      header: "Property",
      render: (_, row) => (
        <div>
          <div className="font-medium text-foreground">
            {row.properties?.address || "Unknown"}
          </div>
          <div className="text-tiny text-muted-foreground">
            {[row.properties?.city, row.properties?.state].filter(Boolean).join(", ")}
          </div>
        </div>
      ),
    },
    {
      key: "owner_name",
      header: "Owner",
      render: (_, row) => row.properties?.owner_name || "-",
    },
    {
      key: "offer_amount",
      header: "Amount",
      render: (value) => (
        <span className="font-semibold tabular-nums">{formatCurrency(Number(value))}</span>
      ),
    },
    {
      key: "sent_date",
      header: "Sent",
      render: (value) => value ? format(new Date(value), "MMM d, yyyy") : "-",
    },
    {
      key: "days_pending",
      header: "Days Pending",
      render: (_, row) => {
        const days = row.sent_date ? differenceInDays(new Date(), new Date(row.sent_date)) : 0;
        return (
          <Badge variant={days > 7 ? "warning" : "secondary"} size="sm">
            {days}d
          </Badge>
        );
      },
    },
    {
      key: "delivery",
      header: "Delivery",
      render: (_, row) => {
        const channels = row.sent_via?.split(", ") || [];
        return (
          <div className="flex items-center gap-1">
            {channels.map((channel: string, i: number) => {
              const Icon = getChannelIcon(channel.toLowerCase().trim());
              return <Icon key={i} className="h-4 w-4 text-muted-foreground" />;
            })}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/properties/${row.properties?.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1 font-bold text-foreground">Offer Tracking</h1>
          <p className="text-body text-muted-foreground">
            Monitor your offers and track engagement
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={<RefreshCw />}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} variant="default" padding="md">
              <Skeleton className="h-10 w-10 rounded-full mb-3" />
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-4 w-24" />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              label="Offers This Week"
              value={stats?.offersThisWeek || 0}
              icon={<Send className="h-5 w-5 text-brand" />}
              iconBgClass="bg-brand/10"
            />
            <StatCard
              label="Delivery Rate"
              value={`${stats?.deliveryRate || 0}%`}
              trend={{ value: 5, isPositive: true }}
              icon={<CheckCircle2 className="h-5 w-5 text-success" />}
              iconBgClass="bg-success/10"
            />
            <StatCard
              label="Open Rate"
              value={`${stats?.openRate || 0}%`}
              trend={{ value: 12, isPositive: true }}
              icon={<Eye className="h-5 w-5 text-info" />}
              iconBgClass="bg-info/10"
            />
            <StatCard
              label="Response Rate"
              value={`${stats?.responseRate || 0}%`}
              trend={{ value: 3, isPositive: false }}
              icon={<BarChart3 className="h-5 w-5 text-warning" />}
              iconBgClass="bg-warning/10"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Offers Table */}
        <div className="lg:col-span-2">
          <Card variant="default" padding="none">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-h3 font-semibold">Pending Offers</h2>
                <Badge variant="secondary" size="sm">{pendingOffers.length}</Badge>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {filterOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PremiumTable
              columns={columns}
              data={pendingOffers}
              loading={offersLoading}
              emptyMessage="No pending offers"
              onRowClick={(row) => navigate(`/properties/${row.properties?.id}`)}
            />
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <Card variant="default" padding="none">
            <div className="p-4 border-b border-border-subtle flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-h3 font-semibold">Recent Activity</h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {activityLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="divide-y divide-border-subtle">
                  {activity.map((item) => (
                    <ActivityItem
                      key={item.id}
                      activity={item}
                      onClick={() => item.propertyId && navigate(`/properties/${item.propertyId}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-small">No recent activity</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
