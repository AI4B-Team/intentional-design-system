import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, TrendingUp, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealSourceStatsProps {
  stats: {
    total: number;
    active: number;
    dealsThisMonth: number;
    totalProfit: number;
  } | null;
  isLoading: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DealSourceStats({ stats, isLoading }: DealSourceStatsProps) {
  const items = [
    {
      label: "Total Sources",
      value: stats?.total || 0,
      icon: Users,
      color: "text-brand",
      bgColor: "bg-brand/10",
    },
    {
      label: "Active Sources",
      value: stats?.active || 0,
      icon: UserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
    },
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
