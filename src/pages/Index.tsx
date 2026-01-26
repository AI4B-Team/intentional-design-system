import {
  DashboardLayout,
  PageHeader,
  ContentSection,
  StatsGrid,
} from "@/components/layout";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge, HeatScoreBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumTable, type Column } from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  ArrowRight,
  MapPin,
} from "lucide-react";

// Sample data
const recentProperties = [
  {
    id: 1,
    address: "123 Oak Street",
    city: "Austin, TX",
    price: "$425,000",
    type: "Single Family",
    score: 850,
    status: "Hot Lead",
  },
  {
    id: 2,
    address: "456 Pine Avenue",
    city: "Dallas, TX",
    price: "$315,000",
    type: "Multi-Family",
    score: 720,
    status: "In Review",
  },
  {
    id: 3,
    address: "789 Elm Boulevard",
    city: "Houston, TX",
    price: "$275,000",
    type: "Single Family",
    score: 580,
    status: "New",
  },
  {
    id: 4,
    address: "321 Maple Drive",
    city: "San Antonio, TX",
    price: "$195,000",
    type: "Condo",
    score: 420,
    status: "Analyzing",
  },
  {
    id: 5,
    address: "654 Cedar Lane",
    city: "Fort Worth, TX",
    price: "$380,000",
    type: "Single Family",
    score: 290,
    status: "On Hold",
  },
];

const columns: Column[] = [
  {
    key: "address",
    header: "Property",
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-medium bg-surface-tertiary">
          <Building2 className="h-5 w-5 text-content-tertiary" />
        </div>
        <div>
          <div className="font-medium text-content">{row.address}</div>
          <div className="flex items-center gap-1 text-small text-content-secondary">
            <MapPin className="h-3 w-3" />
            {row.city}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "type",
    header: "Type",
    render: (value) => (
      <Badge variant="secondary" size="sm">
        {value}
      </Badge>
    ),
  },
  {
    key: "price",
    header: "Price",
    align: "right",
    render: (value) => (
      <span className="font-medium tabular-nums">{value}</span>
    ),
  },
  {
    key: "score",
    header: "Heat Score",
    align: "center",
    render: (value) => <HeatScoreBadge score={value} size="sm" />,
  },
  {
    key: "status",
    header: "Status",
    render: (value) => {
      const variant =
        value === "Hot Lead"
          ? "success"
          : value === "In Review"
          ? "warning"
          : value === "On Hold"
          ? "error"
          : "default";
      return (
        <Badge variant={variant} size="sm">
          {value}
        </Badge>
      );
    },
  },
];

const recentActivity = [
  {
    id: 1,
    user: "Sarah Chen",
    action: "added a new property",
    target: "123 Oak Street",
    time: "2 min ago",
  },
  {
    id: 2,
    user: "Mike Johnson",
    action: "updated deal status",
    target: "456 Pine Avenue",
    time: "15 min ago",
  },
  {
    id: 3,
    user: "Emily Davis",
    action: "added notes to",
    target: "789 Elm Boulevard",
    time: "1 hour ago",
  },
  {
    id: 4,
    user: "Chris Wilson",
    action: "closed deal on",
    target: "999 Birch Court",
    time: "3 hours ago",
  },
];

export default function Index() {
  return (
    <DashboardLayout
      title="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your portfolio."
      />

      {/* Stats Grid */}
      <StatsGrid columns={4} className="mb-lg">
        <StatCard
          label="Total Properties"
          value="124"
          trend={{ value: 12, label: "vs last month" }}
          icon={<Building2 />}
        />
        <StatCard
          label="Portfolio Value"
          value="$4.2M"
          trend={{ value: 8.5, label: "vs last month" }}
          icon={<DollarSign />}
        />
        <StatCard
          label="Active Deals"
          value="18"
          trend={{ value: -3, label: "vs last month" }}
          icon={<TrendingUp />}
        />
        <StatCard
          label="Total Contacts"
          value="342"
          trend={{ value: 24, label: "vs last month" }}
          icon={<Users />}
        />
      </StatsGrid>

      <div className="grid gap-md lg:grid-cols-3">
        {/* Recent Properties */}
        <ContentSection
          title="Recent Properties"
          actions={
            <Button variant="ghost" size="sm" icon={<ArrowRight />} iconPosition="right">
              View all
            </Button>
          }
          className="lg:col-span-2"
        >
          <Card padding="none" className="overflow-hidden">
            <PremiumTable
              columns={columns}
              data={recentProperties}
              onRowClick={(row) => console.log("Clicked:", row)}
            />
          </Card>
        </ContentSection>

        {/* Recent Activity */}
        <ContentSection
          title="Recent Activity"
          actions={
            <Button variant="ghost" size="sm">
              View all
            </Button>
          }
        >
          <Card padding="none">
            <div className="divide-y divide-border-subtle">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-secondary"
                >
                  <Avatar name={activity.user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-small text-content">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-content-secondary">
                        {activity.action}
                      </span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-tiny text-content-tertiary mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </ContentSection>
      </div>
    </DashboardLayout>
  );
}
