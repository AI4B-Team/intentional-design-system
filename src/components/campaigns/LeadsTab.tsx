import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Globe, 
  Phone, 
  Mail, 
  Megaphone, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock lead sources data
const leadSources = [
  {
    id: "1",
    name: "Seller Website",
    type: "website",
    icon: Globe,
    leads: 156,
    converted: 23,
    conversionRate: 14.7,
    cost: 0,
    roi: null,
    status: "active",
    lastLead: "2 hours ago",
  },
  {
    id: "2",
    name: "Cold Calling",
    type: "phone",
    icon: Phone,
    leads: 89,
    converted: 12,
    conversionRate: 13.5,
    cost: 2500,
    roi: 380,
    status: "active",
    lastLead: "4 hours ago",
  },
  {
    id: "3",
    name: "Direct Mail",
    type: "mail",
    icon: Mail,
    leads: 67,
    converted: 8,
    conversionRate: 11.9,
    cost: 5200,
    roi: 220,
    status: "active",
    lastLead: "1 day ago",
  },
  {
    id: "4",
    name: "MLS Campaigns",
    type: "mls",
    icon: Megaphone,
    leads: 234,
    converted: 45,
    conversionRate: 19.2,
    cost: 1200,
    roi: 890,
    status: "active",
    lastLead: "30 min ago",
  },
  {
    id: "5",
    name: "Referrals",
    type: "referral",
    icon: Users,
    leads: 45,
    converted: 18,
    conversionRate: 40.0,
    cost: 0,
    roi: null,
    status: "active",
    lastLead: "3 days ago",
  },
  {
    id: "6",
    name: "Facebook Ads",
    type: "ads",
    icon: TrendingUp,
    leads: 112,
    converted: 9,
    conversionRate: 8.0,
    cost: 3400,
    roi: 150,
    status: "paused",
    lastLead: "1 week ago",
  },
];

const typeColors: Record<string, string> = {
  website: "bg-info/10 text-info",
  phone: "bg-success/10 text-success",
  mail: "bg-warning/10 text-warning",
  mls: "bg-primary/10 text-primary",
  referral: "bg-accent/10 text-accent",
  ads: "bg-destructive/10 text-destructive",
};

export function LeadsTab() {
  const totalLeads = leadSources.reduce((sum, s) => sum + s.leads, 0);
  const totalConverted = leadSources.reduce((sum, s) => sum + s.converted, 0);
  const totalCost = leadSources.reduce((sum, s) => sum + s.cost, 0);
  const avgConversion = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Track and optimize your lead generation channels
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold">{totalLeads}</p>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +12% this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Converted</p>
            <p className="text-2xl font-bold">{totalConverted}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {avgConversion}% conversion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Spend</p>
            <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalConverted > 0 ? Math.round(totalCost / totalConverted) : 0}/conversion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active Sources</p>
            <p className="text-2xl font-bold">
              {leadSources.filter(s => s.status === "active").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {leadSources.length} total configured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leadSources.map((source) => {
          const Icon = source.icon;
          return (
            <Card key={source.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${typeColors[source.type]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base whitespace-nowrap">{source.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Last lead: {source.lastLead}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={source.status === "active" ? "default" : "secondary"}
                      className={source.status === "active" ? "bg-success/10 text-success" : ""}
                    >
                      {source.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Source</DropdownMenuItem>
                        <DropdownMenuItem>View Leads</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          {source.status === "active" ? "Pause" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold">{source.leads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{source.converted}</p>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary">{source.conversionRate}%</p>
                    <p className="text-xs text-muted-foreground">Rate</p>
                  </div>
                </div>
                {source.cost > 0 && (
                  <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Spend: ${source.cost.toLocaleString()}
                    </span>
                    {source.roi && (
                      <span className="text-success font-medium">
                        {source.roi}% ROI
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Source Card */}
        <Card className="border-dashed flex items-center justify-center min-h-[200px] hover:bg-muted/50 transition-colors cursor-pointer">
          <div className="text-center text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Add Lead Source</p>
            <p className="text-xs">Track a new channel</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
