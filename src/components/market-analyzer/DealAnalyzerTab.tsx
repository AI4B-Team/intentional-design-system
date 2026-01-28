import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  BarChart3,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  Copy,
  Trash2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface DealAnalyzerTabProps {
  onCreateAnalysis: () => void;
}

const analysisTypes = [
  { value: "all", label: "All Types" },
  { value: "flip", label: "Flip" },
  { value: "wholesale", label: "Wholesale" },
  { value: "brrrr", label: "BRRRR" },
  { value: "buy_hold", label: "Buy & Hold" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "analyzing", label: "Analyzing" },
  { value: "offer_ready", label: "Offer Ready" },
  { value: "offer_sent", label: "Offer Sent" },
  { value: "negotiating", label: "Negotiating" },
  { value: "under_contract", label: "Under Contract" },
  { value: "closed", label: "Closed" },
  { value: "dead", label: "Dead" },
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "highest_roi", label: "Highest ROI" },
  { value: "highest_profit", label: "Highest Profit" },
];

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadge(status: string | null) {
  const statusMap: Record<string, { variant: string; label: string }> = {
    analyzing: { variant: "warning", label: "Analyzing" },
    offer_ready: { variant: "info", label: "Offer Ready" },
    offer_sent: { variant: "secondary", label: "Offer Sent" },
    negotiating: { variant: "info", label: "Negotiating" },
    under_contract: { variant: "success", label: "Under Contract" },
    closed: { variant: "success", label: "Closed" },
    dead: { variant: "error", label: "Dead" },
  };
  const s = statusMap[status || "analyzing"] || statusMap.analyzing;
  return <Badge variant={s.variant as any} size="sm">{s.label}</Badge>;
}

function getTypeBadge(type: string | null) {
  const typeMap: Record<string, { color: string; label: string }> = {
    flip: { color: "bg-purple-100 text-purple-700", label: "Flip" },
    wholesale: { color: "bg-blue-100 text-blue-700", label: "Wholesale" },
    brrrr: { color: "bg-orange-100 text-orange-700", label: "BRRRR" },
    buy_hold: { color: "bg-green-100 text-green-700", label: "Buy & Hold" },
  };
  const t = typeMap[type || "flip"] || typeMap.flip;
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", t.color)}>
      {t.label}
    </span>
  );
}

function getRoiColor(roi: number | null): string {
  if (roi == null) return "border-border-subtle";
  if (roi > 20) return "border-l-4 border-l-green-500";
  if (roi >= 10) return "border-l-4 border-l-yellow-500";
  return "border-l-4 border-l-red-500";
}

export function DealAnalyzerTab({ onCreateAnalysis }: DealAnalyzerTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const { data: analyses, isLoading, refetch } = useQuery({
    queryKey: ["deal-analyses", user?.id, typeFilter, statusFilter, sortBy, search],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from("deal_analyses")
        .select("*")
        .eq("user_id", user.id);

      if (typeFilter !== "all") {
        query = query.eq("analysis_type", typeFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (search) {
        query = query.ilike("address", `%${search}%`);
      }

      // Sort
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "oldest") {
        query = query.order("created_at", { ascending: true });
      } else if (sortBy === "highest_roi") {
        query = query.order("roi_percentage", { ascending: false, nullsFirst: false });
      } else if (sortBy === "highest_profit") {
        query = query.order("net_profit", { ascending: false, nullsFirst: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("deal_analyses").delete().eq("id", id);
    if (!error) refetch();
  };

  const handleDuplicate = async (analysis: any) => {
    const { id, created_at, updated_at, ...rest } = analysis;
    const { error } = await supabase.from("deal_analyses").insert({
      ...rest,
      name: `${rest.name} (Copy)`,
    });
    if (!error) refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {analysisTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-l-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {analyses?.length === 0 && (
        <Card className="p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-h3 font-semibold text-foreground mb-2">
            No analyses yet
          </h3>
          <p className="text-body text-muted-foreground max-w-md mb-6">
            Create your first deal analysis to evaluate investment opportunities.
          </p>
          <Button onClick={onCreateAnalysis} icon={<Plus />}>
            Create Analysis
          </Button>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === "grid" && analyses && analyses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyses.map((analysis) => (
            <Card
              key={analysis.id}
              className={cn(
                "p-4 hover:shadow-md transition-shadow cursor-pointer",
                getRoiColor(analysis.roi_percentage ? Number(analysis.roi_percentage) : null)
              )}
              onClick={() => navigate(`/tools/market-analyzer/${analysis.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-small font-medium text-foreground truncate max-w-[180px]">
                    {analysis.address}
                  </span>
                </div>
                {getTypeBadge(analysis.analysis_type)}
              </div>

              <div className="grid grid-cols-3 gap-2 text-small mb-3">
                <div>
                  <div className="text-muted-foreground">Purchase</div>
                  <div className="font-medium tabular-nums">
                    {formatCurrency(analysis.purchase_price ? Number(analysis.purchase_price) : null)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">ARV</div>
                  <div className="font-medium tabular-nums">
                    {formatCurrency(analysis.arv ? Number(analysis.arv) : null)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Repairs</div>
                  <div className="font-medium tabular-nums">
                    {formatCurrency(analysis.repair_estimate ? Number(analysis.repair_estimate) : null)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1 text-small">
                  <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-muted-foreground">Net:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(analysis.net_profit ? Number(analysis.net_profit) : null)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-small">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-muted-foreground">ROI:</span>
                  <span className="font-semibold text-blue-600">
                    {analysis.roi_percentage ? `${Number(analysis.roi_percentage).toFixed(1)}%` : "—"}
                  </span>
                </div>
              </div>

              <div className="text-small text-muted-foreground mb-3">
                MAO (70%): {formatCurrency(analysis.mao_70_pct ? Number(analysis.mao_70_pct) : null)}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge(analysis.status)}
                  <span className="text-tiny text-muted-foreground">
                    {formatDistanceToNow(new Date(analysis.created_at!), { addSuffix: true })}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/tools/market-analyzer/${analysis.id}`); }}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(analysis); }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(analysis.id); }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && analyses && analyses.length > 0 && (
        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-secondary/50">
                <th className="text-left text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">Address</th>
                <th className="text-left text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">Type</th>
                <th className="text-right text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">Purchase</th>
                <th className="text-right text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">ARV</th>
                <th className="text-right text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">Net Profit</th>
                <th className="text-right text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">ROI</th>
                <th className="text-center text-tiny uppercase tracking-wide text-muted-foreground font-medium px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((analysis) => (
                <tr
                  key={analysis.id}
                  className="border-b border-border-subtle hover:bg-surface-secondary/30 cursor-pointer"
                  onClick={() => navigate(`/tools/market-analyzer/${analysis.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{analysis.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getTypeBadge(analysis.analysis_type)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(analysis.purchase_price ? Number(analysis.purchase_price) : null)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(analysis.arv ? Number(analysis.arv) : null)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-green-600">
                    {formatCurrency(analysis.net_profit ? Number(analysis.net_profit) : null)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-blue-600">
                    {analysis.roi_percentage ? `${Number(analysis.roi_percentage).toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(analysis.status)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/tools/market-analyzer/${analysis.id}`); }}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(analysis); }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(analysis.id); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
