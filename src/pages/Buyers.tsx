import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Users,
  BadgeCheck,
  Activity,
  HandshakeIcon,
  MoreHorizontal,
  Eye,
  Pencil,
  Send,
  UserMinus,
  CheckCircle2,
} from "lucide-react";
import { useBuyers, useBuyerStats, type Buyer } from "@/hooks/useBuyers";
import { AddBuyerModal } from "@/components/buyers/add-buyer-modal";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

function StatCard({
  label,
  value,
  icon,
  iconBgClass,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass: string;
}) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconBgClass)}>
          {icon}
        </div>
      </div>
      <div className="text-display font-semibold text-foreground tabular-nums mt-3">{value}</div>
      <div className="text-small text-muted-foreground">{label}</div>
    </Card>
  );
}

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getBuyBoxSummary(buyBox: Buyer["buy_box"]): string {
  const parts: string[] = [];
  if (buyBox.property_types?.length) {
    parts.push(buyBox.property_types.slice(0, 2).join(", "));
  }
  if (buyBox.price_min || buyBox.price_max) {
    const min = buyBox.price_min ? `$${(buyBox.price_min / 1000).toFixed(0)}K` : "$0";
    const max = buyBox.price_max ? `$${(buyBox.price_max / 1000).toFixed(0)}K` : "+";
    parts.push(`${min}-${max}`);
  }
  if (buyBox.target_areas?.length) {
    parts.push(buyBox.target_areas.slice(0, 2).join(", "));
  }
  return parts.join(" • ") || "Not specified";
}

function getReliabilityBadge(score: number) {
  if (score >= 80) {
    return <Badge variant="success" size="sm">{score}%</Badge>;
  } else if (score >= 50) {
    return <Badge variant="warning" size="sm">{score}%</Badge>;
  } else {
    return <Badge variant="error" size="sm">{score}%</Badge>;
  }
}

export default function Buyers() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [pofFilter, setPofFilter] = React.useState("all");
  const [activityFilter, setActivityFilter] = React.useState("all");
  const [sort, setSort] = React.useState("newest");

  const { data: buyers, isLoading } = useBuyers({
    search,
    pofVerified: pofFilter,
    activity: activityFilter,
    sort,
  });
  const { data: stats } = useBuyerStats();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1 font-bold text-foreground">Cash Buyers</h1>
          <p className="text-body text-muted-foreground">
            Manage your buyer network and deal distribution
          </p>
        </div>
        <Button variant="primary" icon={<Plus />} onClick={() => setIsAddModalOpen(true)}>
          Add Buyer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Buyers"
          value={stats?.total || 0}
          icon={<Users className="h-5 w-5 text-brand" />}
          iconBgClass="bg-brand/10"
        />
        <StatCard
          label="POF Verified"
          value={stats?.verified || 0}
          icon={<BadgeCheck className="h-5 w-5 text-success" />}
          iconBgClass="bg-success/10"
        />
        <StatCard
          label="Active This Month"
          value={stats?.activeThisMonth || 0}
          icon={<Activity className="h-5 w-5 text-info" />}
          iconBgClass="bg-info/10"
        />
        <StatCard
          label="Deals Closed"
          value={stats?.totalDealsClosed || 0}
          icon={<HandshakeIcon className="h-5 w-5 text-warning" />}
          iconBgClass="bg-warning/10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buyers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={pofFilter} onValueChange={setPofFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="POF Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All POF Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="not_verified">Not Verified</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activityFilter} onValueChange={setActivityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Activity" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="active">Active (30 days)</SelectItem>
            <SelectItem value="dormant">Dormant</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="most_active">Most Active</SelectItem>
            <SelectItem value="highest_volume">Highest Volume</SelectItem>
            <SelectItem value="best_reliability">Best Reliability</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buyers Table */}
      <Card variant="default" padding="none">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : buyers && buyers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Buy Box</TableHead>
                <TableHead className="text-center">Deals Closed</TableHead>
                <TableHead className="text-center">Reliability</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-center">POF</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buyers.map((buyer) => (
                <TableRow
                  key={buyer.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/buyers/${buyer.id}`)}
                >
                  <TableCell>
                    <span className="font-medium">{buyer.name}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {buyer.company || "—"}
                  </TableCell>
                  <TableCell>
                    <span className="text-small text-muted-foreground truncate max-w-[200px] block">
                      {getBuyBoxSummary(buyer.buy_box)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {buyer.deals_closed}
                  </TableCell>
                  <TableCell className="text-center">
                    {getReliabilityBadge(buyer.reliability_score)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {buyer.last_activity
                      ? formatDistanceToNow(new Date(buyer.last_activity), { addSuffix: true })
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-center">
                    {buyer.pof_verified ? (
                      <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem onClick={() => navigate(`/buyers/${buyer.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Send Deal
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <UserMinus className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-h3 font-semibold mb-2">No buyers yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your cash buyer database
            </p>
            <Button variant="primary" icon={<Plus />} onClick={() => setIsAddModalOpen(true)}>
              Add Your First Buyer
            </Button>
          </div>
        )}
      </Card>

      <AddBuyerModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </DashboardLayout>
  );
}
