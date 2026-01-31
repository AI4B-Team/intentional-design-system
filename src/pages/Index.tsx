import * as React from "react";
import { DashboardLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import {
  DashboardStatCard,
  HotOpportunitiesList,
  PipelineFunnel,
  TasksList,
  RecentActivityList,
  RecentAnalysesWidget,
} from "@/components/dashboard";
import { WorkflowShowcase, RenovationDemo } from "@/components/landing";
import { Users, Calendar, FileText, DollarSign } from "lucide-react";

// Get greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Format current date
function formatDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Sample data
const statsData = [
  {
    id: "leads",
    label: "New Leads",
    value: "47",
    trend: { value: 12, isPositive: true },
    icon: <Users />,
    iconBgClass: "bg-red-100",
    iconColorClass: "text-red-500",
  },
  {
    id: "appointments",
    label: "Appointments",
    value: "12",
    trend: { value: 8, isPositive: true },
    icon: <Calendar />,
    iconBgClass: "bg-teal-100",
    iconColorClass: "text-teal-500",
  },
  {
    id: "offers",
    label: "Offers Sent",
    value: "8",
    trend: { value: -5, isPositive: false },
    icon: <FileText />,
    iconBgClass: "bg-amber-100",
    iconColorClass: "text-amber-500",
  },
  {
    id: "closed",
    label: "Closed Deals",
    value: "3",
    trend: { value: 50, isPositive: true },
    icon: <DollarSign />,
    iconBgClass: "bg-violet-100",
    iconColorClass: "text-violet-500",
  },
];

const hotOpportunities = [
  { id: 1, address: "1423 Elm Street", city: "Austin", state: "TX", score: 92, daysAgo: 0 },
  { id: 2, address: "567 Oak Avenue", city: "Dallas", state: "TX", score: 85, daysAgo: 1 },
  { id: 3, address: "890 Pine Road", city: "Houston", state: "TX", score: 78, daysAgo: 2 },
  { id: 4, address: "234 Maple Drive", city: "San Antonio", state: "TX", score: 71, daysAgo: 3 },
  { id: 5, address: "456 Cedar Lane", city: "Fort Worth", state: "TX", score: 65, daysAgo: 5 },
];

const pipelineStages = [
  { id: "leads", name: "New Leads", count: 47, value: "$2.1M", conversionRate: 68 },
  { id: "contacted", name: "Contacted", count: 32, value: "$1.4M", conversionRate: 45 },
  { id: "appointments", name: "Appointments", count: 14, value: "$620K", conversionRate: 57 },
  { id: "offers", name: "Offers Made", count: 8, value: "$350K", conversionRate: 38 },
  { id: "closed", name: "Closed", count: 3, value: "$132K" },
];

const initialTasks = [
  { id: 1, title: "Call back John Smith about 123 Oak St", time: "9:00 AM", priority: "high" as const, completed: false },
  { id: 2, title: "Send offer for 456 Pine Avenue", time: "10:30 AM", priority: "high" as const, completed: false },
  { id: 3, title: "Review comps for Cedar Lane property", time: "1:00 PM", priority: "medium" as const, completed: false },
  { id: 4, title: "Follow up with title company", time: "3:00 PM", priority: "low" as const, completed: false },
  { id: 5, title: "Schedule property inspection", time: "4:30 PM", priority: "medium" as const, completed: false },
];

const recentActivities = [
  { id: 1, type: "lead" as const, description: "New lead added:", target: "1423 Elm Street", time: "5 min ago", targetHref: "#" },
  { id: 2, type: "contact" as const, description: "Call completed with", target: "Sarah Johnson", time: "28 min ago", targetHref: "#" },
  { id: 3, type: "offer" as const, description: "Offer sent for", target: "567 Oak Avenue", time: "1 hour ago", targetHref: "#" },
  { id: 4, type: "response" as const, description: "Counter-offer received on", target: "890 Pine Road", time: "2 hours ago", targetHref: "#" },
  { id: 5, type: "closed" as const, description: "Deal closed:", target: "234 Maple Drive", time: "Yesterday", targetHref: "#" },
  { id: 6, type: "lead" as const, description: "New lead from marketing:", target: "789 Birch Court", time: "Yesterday", targetHref: "#" },
];

export default function Index() {
  const [tasks, setTasks] = React.useState(initialTasks);

  const handleToggleTask = (id: string | number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      {/* Header Greeting */}
      <div className="mb-lg animate-fade-in">
        <h1 className="text-h1 font-semibold text-content">
          {getGreeting()}, Brian
        </h1>
        <p className="text-body text-content-secondary mt-1">{formatDate()}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        {statsData.map((stat, index) => (
          <DashboardStatCard
            key={stat.id}
            {...stat}
            style={{ animationDelay: `${index * 100}ms` }}
            className="animate-fade-in"
          />
        ))}
      </div>

      {/* Middle Section: Hot Opportunities + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-md mb-lg">
        {/* Hot Opportunities - 60% */}
        <Card padding="md" className="lg:col-span-3 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <HotOpportunitiesList
            opportunities={hotOpportunities}
            onViewAll={() => console.log("View all opportunities")}
            onCall={(id) => console.log("Call", id)}
            onView={(id) => console.log("View", id)}
          />
        </Card>

        {/* Pipeline - 40% */}
        <Card padding="md" className="lg:col-span-2 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="text-h3 font-semibold text-content mb-4">Pipeline</h3>
          <PipelineFunnel stages={pipelineStages} />
        </Card>
      </div>

      {/* Bottom Section: Tasks + Activity + Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Today's Tasks */}
        <Card padding="md" className="animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h3 font-semibold text-content">Today's Tasks</h3>
            <span className="text-small text-content-secondary">
              {tasks.filter((t) => t.completed).length}/{tasks.length} completed
            </span>
          </div>
          <TasksList tasks={tasks} onToggle={handleToggleTask} />
        </Card>

        {/* Recent Activity */}
        <Card padding="md" className="animate-fade-in" style={{ animationDelay: "700ms" }}>
          <h3 className="text-h3 font-semibold text-content mb-4">Recent Activity</h3>
          <RecentActivityList activities={recentActivities} />
        </Card>

        {/* Recent Analyses Widget */}
        <div className="animate-fade-in" style={{ animationDelay: "800ms" }}>
          <RecentAnalysesWidget />
        </div>
      </div>

      {/* Workflow Showcase */}
      <Card padding="none" className="mt-lg animate-fade-in" style={{ animationDelay: "800ms" }}>
        <WorkflowShowcase />
      </Card>

      {/* Renovation Demo */}
      <div className="mt-lg animate-fade-in" style={{ animationDelay: "900ms" }}>
        <RenovationDemo />
      </div>
    </DashboardLayout>
  );
}
