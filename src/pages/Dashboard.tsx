import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  Flame,
  Calendar,
  Phone,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
  iconBg: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, iconBg }: StatCardProps) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-small text-content-secondary">{title}</p>
          <p className="text-h2 font-bold text-content mt-1 tabular-nums">{value}</p>
          {change && (
            <p
              className={`text-small mt-1 ${
                changeType === "positive"
                  ? "text-success"
                  : changeType === "negative"
                  ? "text-destructive"
                  : "text-content-secondary"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-h1 font-bold text-content">Welcome back!</h1>
        <p className="text-body text-content-secondary mt-1">
          Here's what's happening with your deals today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Properties"
          value="24"
          change="+3 this week"
          changeType="positive"
          icon={Building2}
          iconBg="bg-brand-accent"
        />
        <StatCard
          title="Deal Sources"
          value="12"
          change="2 active"
          changeType="neutral"
          icon={Users}
          iconBg="bg-info"
        />
        <StatCard
          title="Potential Profit"
          value="$156K"
          change="+12% vs last month"
          changeType="positive"
          icon={DollarSign}
          iconBg="bg-success"
        />
        <StatCard
          title="Conversion Rate"
          value="8.4%"
          change="-2.1% this month"
          changeType="negative"
          icon={TrendingUp}
          iconBg="bg-warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card variant="interactive" padding="md" className="hover:border-brand-accent/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-brand-accent/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-brand-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-content">Add Property</h3>
              <p className="text-small text-content-secondary">Add a new lead to your pipeline</p>
            </div>
            <ArrowRight className="h-5 w-5 text-content-tertiary" />
          </div>
        </Card>

        <Card variant="interactive" padding="md" className="hover:border-brand-accent/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-content">Log Call</h3>
              <p className="text-small text-content-secondary">Record a seller conversation</p>
            </div>
            <ArrowRight className="h-5 w-5 text-content-tertiary" />
          </div>
        </Card>

        <Card variant="interactive" padding="md" className="hover:border-brand-accent/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-content">Schedule</h3>
              <p className="text-small text-content-secondary">Book an appointment</p>
            </div>
            <ArrowRight className="h-5 w-5 text-content-tertiary" />
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Leads */}
        <Card variant="default" padding="none">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              <h2 className="text-h3 font-semibold text-content">Hot Leads</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/properties")}
            >
              View All
            </Button>
          </div>
          <div className="divide-y divide-border-subtle">
            {[
              { address: "1423 Elm Street", city: "Austin, TX", score: 892, status: "Appointment Set" },
              { address: "567 Oak Avenue", city: "Dallas, TX", score: 856, status: "Offer Pending" },
              { address: "890 Pine Road", city: "Houston, TX", score: 824, status: "Negotiating" },
            ].map((property, index) => (
              <div key={index} className="flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-surface-tertiary flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-content-tertiary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-content truncate">{property.address}</p>
                  <p className="text-small text-content-secondary">{property.city}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-score-hot/10 text-score-hot text-small font-medium">
                    <Flame className="h-3 w-3" />
                    {property.score}
                  </div>
                  <p className="text-tiny text-content-tertiary mt-0.5">{property.status}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card variant="default" padding="none">
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-accent" />
              <h2 className="text-h3 font-semibold text-content">Today's Tasks</h2>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="divide-y divide-border-subtle">
            {[
              { task: "Follow up with John Smith", time: "10:00 AM", type: "Call" },
              { task: "Property inspection at 567 Oak", time: "2:00 PM", type: "Appointment" },
              { task: "Send offer to 890 Pine Road", time: "4:00 PM", type: "Offer" },
              { task: "Review comp analysis", time: "5:00 PM", type: "Task" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 hover:bg-surface-secondary transition-colors cursor-pointer">
                <div className="h-10 w-10 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-brand-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-content truncate">{item.task}</p>
                  <p className="text-small text-content-secondary">{item.time}</p>
                </div>
                <span className="text-tiny px-2 py-1 rounded-full bg-surface-tertiary text-content-secondary">
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
