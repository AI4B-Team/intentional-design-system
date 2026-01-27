import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Zap,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
  Flag,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";
import {
  calculateVelocityScore,
  getUrgencyColor,
  getVelocityScoreColor,
  type PropertyVelocityData,
  type VelocityResult,
  type VelocityFactor,
} from "@/lib/velocity-scoring";
import { cn } from "@/lib/utils";

interface VelocityScoreCardProps {
  velocityData: PropertyVelocityData;
  onRecalculate?: () => void;
  onCompetitionFlag?: (data: { detected: boolean; notes: string }) => void;
  isRecalculating?: boolean;
  className?: string;
}

function VelocityGauge({ score }: { score: number }) {
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="relative w-32 h-16 overflow-hidden">
      {/* Background arc */}
      <div className="absolute inset-0 border-8 border-muted rounded-t-full" />
      
      {/* Colored segments */}
      <div
        className="absolute inset-0 border-8 rounded-t-full"
        style={{
          borderColor: "transparent",
          borderTopColor: score >= 40 ? (score >= 70 ? (score >= 90 ? "hsl(var(--destructive))" : "hsl(var(--warning))") : "hsl(var(--info))") : "hsl(var(--muted))",
          transform: `rotate(${Math.min(rotation, 90)}deg)`,
          transformOrigin: "bottom center",
        }}
      />

      {/* Needle */}
      <div
        className="absolute bottom-0 left-1/2 w-1 h-14 bg-foreground origin-bottom rounded-t-full"
        style={{
          transform: `translateX(-50%) rotate(${rotation}deg)`,
        }}
      />

      {/* Center dot */}
      <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-foreground rounded-full -translate-x-1/2 translate-y-1/2" />
    </div>
  );
}

function FactorItem({ factor }: { factor: VelocityFactor }) {
  const iconMap = {
    competition: Users,
    market: TrendingUp,
    seller_urgency: AlertCircle,
  };
  const Icon = iconMap[factor.category];

  return (
    <div className="flex items-start gap-3 py-2 border-b border-border-subtle last:border-0">
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-small font-medium">{factor.name}</span>
          <Badge variant="secondary" size="sm">
            +{factor.points}
          </Badge>
        </div>
        <p className="text-tiny text-muted-foreground mt-0.5">{factor.description}</p>
      </div>
    </div>
  );
}

export function VelocityScoreCard({
  velocityData,
  onRecalculate,
  onCompetitionFlag,
  isRecalculating,
  className,
}: VelocityScoreCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showCompetitionModal, setShowCompetitionModal] = React.useState(false);
  const [competitionNotes, setCompetitionNotes] = React.useState(velocityData.competition_notes || "");
  const [competitionChecks, setCompetitionChecks] = React.useState({
    other_investors: velocityData.other_investors_contacted || false,
    wholesaler_lists: velocityData.on_wholesaler_lists || false,
    multiple_inquiries: velocityData.multiple_recent_inquiries || false,
  });

  const result = React.useMemo(() => calculateVelocityScore(velocityData), [velocityData]);
  const urgencyColors = getUrgencyColor(result.urgency_level);
  const scoreColor = getVelocityScoreColor(result.score);

  const handleCompetitionSubmit = () => {
    const hasCompetition = Object.values(competitionChecks).some(Boolean);
    onCompetitionFlag?.({
      detected: hasCompetition,
      notes: competitionNotes,
    });
    setShowCompetitionModal(false);
  };

  return (
    <Card variant="default" padding="md" className={cn("relative overflow-hidden", className)}>
      {/* Critical warning banner */}
      {result.urgency_level === "CRITICAL" && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", urgencyColors.bg)}>
            <Zap className={cn("h-5 w-5", urgencyColors.text)} />
          </div>
          <div>
            <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
              Velocity Score
            </h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={cn("text-display font-bold", scoreColor)}>{result.score}</span>
              <span className="text-small text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        <Badge
          variant={
            result.urgency_level === "CRITICAL"
              ? "error"
              : result.urgency_level === "HIGH"
              ? "warning"
              : result.urgency_level === "STANDARD"
              ? "info"
              : "secondary"
          }
          size="md"
        >
          {result.urgency_level}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <Progress 
          value={result.score} 
          className={cn(
            "h-2",
            result.score >= 90 && "[&>div]:bg-destructive",
            result.score >= 70 && result.score < 90 && "[&>div]:bg-warning",
            result.score >= 40 && result.score < 70 && "[&>div]:bg-info"
          )}
        />
      </div>

      {/* Deadline warning */}
      {result.deadline && result.days_until_deadline !== undefined && (
        <div className={cn(
          "mt-4 p-3 rounded-lg flex items-center gap-2",
          result.days_until_deadline <= 7 ? "bg-destructive/10" : "bg-warning/10"
        )}>
          <AlertTriangle className={cn(
            "h-4 w-4 flex-shrink-0",
            result.days_until_deadline <= 7 ? "text-destructive" : "text-warning"
          )} />
          <span className="text-small font-medium">
            ⚠️ {result.deadline_type} in {result.days_until_deadline} days
          </span>
        </div>
      )}

      {/* Recommended action */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2 text-small">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span>{result.recommended_action}</span>
        </div>
      </div>

      {/* Expandable factors */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mt-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            <span>View {result.factors.length} contributing factors</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="border border-border-subtle rounded-lg p-3">
            {result.factors.length === 0 ? (
              <p className="text-small text-muted-foreground text-center py-2">
                No urgency factors detected
              </p>
            ) : (
              result.factors.map((factor, i) => (
                <FactorItem key={i} factor={factor} />
              ))
            )}

            {/* Score breakdown */}
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-tiny text-muted-foreground">Competition</div>
                  <div className="text-small font-semibold">
                    {result.factors.filter(f => f.category === "competition").reduce((s, f) => s + f.points, 0)}/40
                  </div>
                </div>
                <div>
                  <div className="text-tiny text-muted-foreground">Market</div>
                  <div className="text-small font-semibold">
                    {result.factors.filter(f => f.category === "market").reduce((s, f) => s + f.points, 0)}/25
                  </div>
                </div>
                <div>
                  <div className="text-tiny text-muted-foreground">Urgency</div>
                  <div className="text-small font-semibold">
                    {result.factors.filter(f => f.category === "seller_urgency").reduce((s, f) => s + f.points, 0)}/35
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <Dialog open={showCompetitionModal} onOpenChange={setShowCompetitionModal}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" icon={<Flag />} className="flex-1">
              Flag Competition
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Flag Competition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={competitionChecks.other_investors}
                    onCheckedChange={(c) =>
                      setCompetitionChecks((p) => ({ ...p, other_investors: !!c }))
                    }
                  />
                  <span className="text-small">I saw another investor at this property</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={competitionChecks.wholesaler_lists}
                    onCheckedChange={(c) =>
                      setCompetitionChecks((p) => ({ ...p, wholesaler_lists: !!c }))
                    }
                  />
                  <span className="text-small">Found on another wholesaler's list</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={competitionChecks.multiple_inquiries}
                    onCheckedChange={(c) =>
                      setCompetitionChecks((p) => ({ ...p, multiple_inquiries: !!c }))
                    }
                  />
                  <span className="text-small">Seller mentioned other buyers</span>
                </label>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={competitionNotes}
                  onChange={(e) => setCompetitionNotes(e.target.value)}
                  placeholder="Any additional details about the competition..."
                  rows={3}
                />
              </div>
              <Button variant="primary" className="w-full" onClick={handleCompetitionSubmit}>
                Save & Recalculate
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          icon={<RefreshCw className={cn(isRecalculating && "animate-spin")} />}
          onClick={onRecalculate}
          disabled={isRecalculating}
          className="flex-1"
        >
          Recalculate
        </Button>
      </div>
    </Card>
  );
}
