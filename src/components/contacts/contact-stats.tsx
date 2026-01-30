import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  DollarSign,
  BadgeCheck,
  Star,
  Briefcase,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactStats, ContactType } from "@/hooks/useContacts";

interface ContactStatsCardProps {
  stats: ContactStats | null;
  isLoading: boolean;
  activeType?: ContactType | "all";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface StatItem {
  label: string;
  value: number | string;
  icon: typeof Users;
  color: string;
  bgColor: string;
  isLarge?: boolean;
}

// Stats configurations per contact type
const getStatsConfig = (type: ContactType | "all" | undefined, stats: ContactStats | null): StatItem[] => {
  const baseStats: StatItem[] = [
    {
      label: "Total Contacts",
      value: stats?.total || 0,
      icon: Users,
      color: "text-brand",
      bgColor: "bg-brand/10",
    },
    {
      label: "Active",
      value: stats?.active || 0,
      icon: UserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  // Type-specific stats
  switch (type) {
    case "buyer":
      return [
        ...baseStats,
        {
          label: "POF Verified",
          value: stats?.pofVerified || 0,
          icon: BadgeCheck,
          color: "text-emerald-600",
          bgColor: "bg-emerald-100",
        },
        {
          label: "Deals Closed",
          value: stats?.dealsThisMonth || 0,
          icon: TrendingUp,
          color: "text-info",
          bgColor: "bg-info/10",
        },
      ];
    
    case "contractor":
      return [
        ...baseStats,
        {
          label: "Top Rated (4.5+)",
          value: stats?.topRated || 0,
          icon: Star,
          color: "text-warning",
          bgColor: "bg-warning/10",
        },
        {
          label: "Jobs Completed",
          value: stats?.activeJobs || 0,
          icon: Briefcase,
          color: "text-success",
          bgColor: "bg-success/10",
        },
      ];
    
    case "lender":
      return [
        ...baseStats,
        {
          label: "Licensed",
          value: stats?.licenseVerified || 0,
          icon: Shield,
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
        },
        {
          label: "Total Profit",
          value: formatCurrency(stats?.totalProfit || 0),
          icon: DollarSign,
          color: "text-success",
          bgColor: "bg-success/10",
          isLarge: true,
        },
      ];
    
    case "agent":
    case "wholesaler":
      return [
        ...baseStats,
        {
          label: "Deals This Month",
          value: stats?.dealsThisMonth || 0,
          icon: TrendingUp,
          color: "text-info",
          bgColor: "bg-info/10",
        },
        {
          label: "Total Profit",
          value: formatCurrency(stats?.totalProfit || 0),
          icon: DollarSign,
          color: "text-success",
          bgColor: "bg-success/10",
          isLarge: true,
        },
      ];
    
    default:
      // Default stats for "all" or other types
      return [
        ...baseStats,
        {
          label: "Deals This Month",
          value: stats?.dealsThisMonth || 0,
          icon: TrendingUp,
          color: "text-info",
          bgColor: "bg-info/10",
        },
        {
          label: "Total Profit",
          value: formatCurrency(stats?.totalProfit || 0),
          icon: DollarSign,
          color: "text-success",
          bgColor: "bg-success/10",
          isLarge: true,
        },
      ];
  }
};

export function ContactStatsCard({ stats, isLoading, activeType = "all" }: ContactStatsCardProps) {
  const items = getStatsConfig(activeType, stats);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} variant="default" padding="md">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className={cn("h-10 w-10 rounded-medium flex items-center justify-center flex-shrink-0", item.bgColor)}>
                  <Icon className={cn("h-5 w-5", item.color)} />
                </div>
                <div>
                  <p className="text-tiny text-content-tertiary uppercase tracking-wide">{item.label}</p>
                  <p className={cn("font-semibold tabular-nums", item.isLarge ? "text-h3" : "text-h2")}>
                    {item.value}
                  </p>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
