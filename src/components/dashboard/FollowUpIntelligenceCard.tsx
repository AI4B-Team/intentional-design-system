import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowUpIntelligence, type StaleLeadRow } from "@/hooks/useFollowUpIntelligence";
import { Zap, Send, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function DaysLabel({ days }: { days: number | null }) {
  if (days === null) return <span className="text-[11px] font-medium px-1.5 py-px rounded-full bg-destructive/10 text-destructive">Never</span>;
  const color = days <= 7
    ? "bg-success/10 text-success"
    : days <= 21
    ? "bg-warning/10 text-warning"
    : "bg-destructive/10 text-destructive";
  return <span className={cn("text-[11px] font-medium px-1.5 py-px rounded-full whitespace-nowrap", color)}>{days}d ago</span>;
}

function MotivationBadge({ score }: { score: number | null }) {
  if (!score) return null;
  const color = score > 800
    ? "bg-destructive text-destructive-foreground"
    : score > 500
    ? "bg-warning text-warning-foreground"
    : "bg-muted text-muted-foreground";
  return <span className={cn("text-[11px] font-medium px-1.5 py-px rounded-full", color)}>{score}</span>;
}

function LeadRow({ lead }: { lead: StaleLeadRow }) {
  const navigate = useNavigate();
  const days = daysSince(lead.updated_at);

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-background-secondary rounded-lg transition-all duration-150 group">
      <MotivationBadge score={lead.motivation_score} />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/properties/${lead.id}`)}>
        <p className="text-small font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {lead.owner_name || lead.address}
        </p>
        <p className="text-tiny text-muted-foreground truncate">
          {lead.address}{lead.city ? `, ${lead.city}` : ""}{lead.state ? ` ${lead.state}` : ""}
        </p>
      </div>
      <DaysLabel days={days} />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/communications?contact=${lead.id}&prefill=followup`);
        }}
      >
        <Send className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function FollowUpIntelligenceCard() {
  const navigate = useNavigate();
  const { data: staleLeads, isLoading } = useFollowUpIntelligence();

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-warning/5 to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-warning/10">
            <Zap className="h-4 w-4 text-warning" />
          </div>
          <div>
            <h2 className="text-body font-semibold text-foreground">⚡ Follow-Up Intelligence</h2>
            <p className="text-tiny text-muted-foreground">Sellers who need attention now</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/properties?filter=stale")}
        >
          View All
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            ))}
          </div>
        ) : staleLeads && staleLeads.length > 0 ? (
          staleLeads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="p-3 rounded-full bg-success/10 mb-3">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <p className="text-body font-semibold text-foreground">You're all caught up!</p>
            <p className="text-small text-muted-foreground text-center mt-1">
              All active leads have been contacted within 14 days
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
