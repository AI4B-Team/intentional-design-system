import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Users,
  Phone,
  Calendar,
  FileText,
  Clock,
  Handshake,
  BadgeDollarSign,
  Megaphone,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icon mapping for pipeline stages
const PIPELINE_STAGE_ICONS: Record<string, React.ElementType> = {
  new: Users,
  contacted: Phone,
  appointment: Calendar,
  offer_made: FileText,
  negotiating: FileText,
  follow_up: Clock,
  under_contract: Handshake,
  marketing: Megaphone,
  closed: BadgeDollarSign,
  sold: BadgeDollarSign,
};

const PIPELINE_STAGE_ICON_BG: Record<string, string> = {
  new: "bg-red-100", contacted: "bg-red-100", appointment: "bg-red-100",
  offer_made: "bg-amber-100", negotiating: "bg-amber-100", follow_up: "bg-amber-100",
  under_contract: "bg-blue-100", marketing: "bg-blue-100",
  closed: "bg-emerald-100", sold: "bg-emerald-100",
};

const PIPELINE_STAGE_ICON_COLOR: Record<string, string> = {
  new: "text-red-500", contacted: "text-red-500", appointment: "text-red-500",
  offer_made: "text-amber-500", negotiating: "text-amber-500", follow_up: "text-amber-500",
  under_contract: "text-blue-600", marketing: "text-blue-600",
  closed: "text-emerald-500", sold: "text-emerald-500",
};

interface PipelineStageData {
  status: string;
  label: string;
  count: number;
  color: string;
}

function PipelineStage({
  stage,
  total,
  previousCount,
  onClick,
  isBottleneck,
  bottleneckReason,
}: {
  stage: PipelineStageData;
  total: number;
  previousCount: number;
  onClick: () => void;
  isBottleneck?: boolean;
  bottleneckReason?: string;
}) {
  const percentage = total > 0 ? Math.round((stage.count / total) * 100) : 0;
  const isEmpty = stage.count === 0;
  const showGap = isEmpty && previousCount > 0 && stage.status !== "marketing";
  const emptyMessage = isEmpty ? `NO ${stage.label.replace(/s$/i, '').toUpperCase()}` : null;

  const StageIcon = PIPELINE_STAGE_ICONS[stage.status] || Users;
  const categoryIconBg = PIPELINE_STAGE_ICON_BG[stage.status] || "bg-muted";
  const categoryIconColor = PIPELINE_STAGE_ICON_COLOR[stage.status] || "text-muted-foreground";

  const getPerformanceColor = (pct: number) => {
    if (pct >= 80) return { bar: "bg-emerald-500", text: "text-emerald-500" };
    if (pct >= 40) return { bar: "bg-amber-500", text: "text-amber-500" };
    return { bar: "bg-red-500", text: "text-red-500" };
  };

  const performanceColor = getPerformanceColor(percentage);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-150 group",
        "hover:bg-background-secondary"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "flex items-center justify-center w-7 h-7 rounded-full transition-transform duration-150 group-hover:scale-110",
        categoryIconBg
      )}>
        <StageIcon className={cn("h-3.5 w-3.5", categoryIconColor)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-small font-medium group-hover:text-primary transition-colors truncate",
            categoryIconColor
          )}>
            {stage.label}
          </p>
          {showGap && (
            <span className="text-tiny bg-warning/10 text-warning px-1.5 py-0.5 rounded font-medium flex items-center gap-1 shrink-0">
              <AlertTriangle className="h-2.5 w-2.5" />
              Gap
            </span>
          )}
          {isBottleneck && !showGap && (
            <span className="text-tiny bg-info/10 text-info px-1.5 py-0.5 rounded font-medium flex items-center gap-1 shrink-0">
              <Clock className="h-2.5 w-2.5" />
              Slow
            </span>
          )}
        </div>
        {showGap && emptyMessage && (
          <p className="text-tiny text-destructive/70 mt-0.5 uppercase tracking-wide">{emptyMessage} — NEEDS ATTENTION</p>
        )}
        {bottleneckReason && !showGap && (
          <p className="text-tiny text-warning/80 mt-0.5">{bottleneckReason}</p>
        )}
      </div>

      <div className="text-right flex items-center gap-3">
        <div className="w-16 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", percentage > 0 ? performanceColor.bar : "bg-transparent")}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-body font-bold tabular-nums w-8 text-right text-foreground">
          {stage.count}
        </p>
        <p className={cn("text-tiny w-12 text-right", performanceColor.text)}>
          {percentage}%
        </p>
      </div>
    </div>
  );
}

interface PipelineOverviewCardProps {
  pipelineStats: PipelineStageData[] | null;
  pipelineLoading: boolean;
  pipelineTimePeriod: string;
  setPipelineTimePeriod: (period: string) => void;
  pipelineValueStats: any;
}

export function PipelineOverviewCard({
  pipelineStats,
  pipelineLoading,
  pipelineTimePeriod,
  setPipelineTimePeriod,
  pipelineValueStats,
}: PipelineOverviewCardProps) {
  const navigate = useNavigate();

  const getPipelineStatsForTimePeriod = React.useMemo(() => {
    if (!pipelineStats) return null;

    if (pipelineTimePeriod === "ALL TIME") {
      const leadsCount = pipelineValueStats?.leads.count || 0;
      const offersCount = pipelineValueStats?.offers.count || 0;
      const contractsCount = pipelineValueStats?.contracted.count || 0;
      const soldCount = pipelineValueStats?.sold.count || 0;

      return pipelineStats.map(stage => {
        if (stage.status === "new") return { ...stage, count: leadsCount };
        if (stage.status === "offer_made") return { ...stage, count: offersCount };
        if (stage.status === "under_contract") return { ...stage, count: contractsCount };
        if (stage.status === "sold") return { ...stage, count: soldCount };
        return stage;
      });
    }

    return pipelineStats;
  }, [pipelineStats, pipelineTimePeriod, pipelineValueStats]);

  const totalPipeline = getPipelineStatsForTimePeriod?.reduce((sum, s) => sum + s.count, 0) || 0;

  return (
    <Card variant="default" padding="none" className="overflow-hidden flex flex-col">
      <div className="flex flex-col gap-1 p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:flex-nowrap">
          <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
            <h2 className="text-body font-semibold text-foreground whitespace-nowrap">Pipeline Overview</h2>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 text-tiny font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer">
                {pipelineTimePeriod}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" sideOffset={4}>
                {["THIS WEEK", "THIS MONTH", "ALL TIME"].map(period => (
                  <DropdownMenuItem key={period} onClick={() => setPipelineTimePeriod(period)}>
                    {period}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <span className="text-small font-medium px-2.5 py-1 rounded-full bg-background-secondary text-muted-foreground tabular-nums">
            {totalPipeline} Total
          </span>
        </div>
        <p className="text-tiny text-muted-foreground">Deals move left to right as momentum increases</p>
      </div>
      {pipelineLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <div className="flex-1" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-2 flex-1">
          {getPipelineStatsForTimePeriod?.map((stage, index) => (
            <PipelineStage
              key={stage.status}
              stage={stage}
              total={totalPipeline}
              previousCount={index > 0 ? (getPipelineStatsForTimePeriod[index - 1]?.count || stage.count) : stage.count}
              onClick={() => navigate(`/pipeline?filter=${stage.status}`)}
            />
          ))}
        </div>
      )}
      {/* Pipeline Composition Bar */}
      {!pipelineLoading && totalPipeline > 0 && (
        <div className="px-4 pb-4">
          <p className="text-tiny text-muted-foreground mb-2 uppercase tracking-wide">Pipeline Legend</p>
          <div className="flex h-3 rounded-full overflow-hidden bg-background-tertiary shadow-inner">
            {[
              { statuses: ["new", "contacted", "appointment"], color: "bg-destructive", label: "Discovery" },
              { statuses: ["offer_made", "negotiating", "follow_up"], color: "bg-warning", label: "Intent" },
              { statuses: ["under_contract", "marketing"], color: "bg-info", label: "Commitment" },
              { statuses: ["closed", "sold"], color: "bg-success", label: "Outcome" },
            ].map(category => {
              const count = getPipelineStatsForTimePeriod
                ?.filter(s => category.statuses.includes(s.status))
                .reduce((sum, s) => sum + s.count, 0) || 0;
              const pct = (count / totalPipeline) * 100;
              return pct > 0 ? (
                <div
                  key={category.label}
                  className={cn(category.color, "transition-all duration-500")}
                  style={{ width: `${pct}%` }}
                  title={`${category.label}: ${count} (${Math.round(pct)}%)`}
                />
              ) : null;
            })}
          </div>
          <div className="flex items-start justify-between w-full mt-2 text-tiny text-muted-foreground">
            {[
              { color: "bg-destructive", label: "Discovery", sub: "(Leads)" },
              { color: "bg-warning", label: "Intent", sub: "(Offers)" },
              { color: "bg-info", label: "Commitment", sub: "(Contracts)" },
              { color: "bg-success", label: "Outcome", sub: "(Sold)" },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-1.5">
                <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1", item.color)} />
                <span className="text-center leading-tight">{item.label}<br />{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className="flex items-center justify-center gap-2 py-3 border-t border-border-subtle text-small text-muted-foreground hover:text-primary cursor-pointer transition-colors mt-auto"
        onClick={() => navigate("/pipeline")}
      >
        <span>View Full Pipeline</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Card>
  );
}
