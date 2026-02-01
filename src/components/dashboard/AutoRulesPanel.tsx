import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Zap,
  Settings2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  FileText,
  Bell,
  Calendar,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { useAutoRules, type AutoRule } from "@/hooks/useAutoRules";

// Icon mapping for rule actions
const ACTION_ICONS: Record<string, React.ElementType> = {
  create_task: FileText,
  send_notification: Bell,
  draft_followup: FileText,
  create_timeline: Calendar,
  move_stage: ArrowRight,
};

// Color mapping for trigger types
const TRIGGER_COLORS: Record<string, string> = {
  stage_stall: "text-warning bg-warning/10",
  stage_entered: "text-success bg-success/10",
  score_threshold: "text-destructive bg-destructive/10",
  days_without_activity: "text-muted-foreground bg-muted",
};

interface RuleItemProps {
  rule: AutoRule;
  matchCount: number;
  onToggle: (isActive: boolean) => void;
}

function RuleItem({ rule, matchCount, onToggle }: RuleItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const ActionIcon = ACTION_ICONS[rule.action.type] || Zap;
  const triggerColor = TRIGGER_COLORS[rule.trigger.type] || "text-muted-foreground bg-muted";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn(
        "rounded-lg border border-border-subtle transition-colors",
        rule.isActive ? "bg-background" : "bg-muted/30"
      )}>
        {/* Rule Header */}
        <div className="flex items-center gap-3 p-3">
          <Switch
            checked={rule.isActive}
            onCheckedChange={onToggle}
            className="shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn(
                "text-small font-medium truncate",
                rule.isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {rule.name}
              </p>
              {matchCount > 0 && rule.isActive && (
                <Badge variant="destructive" className="text-tiny px-1.5 py-0 h-5">
                  {matchCount} triggered
                </Badge>
              )}
            </div>
            <p className="text-tiny text-muted-foreground truncate">
              {rule.description}
            </p>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Expanded Details */}
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border-subtle mt-0">
            <div className="pt-3 flex items-center gap-4 text-tiny">
              {/* Trigger */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">When:</span>
                <span className={cn("px-2 py-0.5 rounded-full font-medium", triggerColor)}>
                  {rule.trigger.type === "stage_stall" && `${rule.trigger.stage} stalls ${rule.trigger.days}d`}
                  {rule.trigger.type === "stage_entered" && `enters ${rule.trigger.stage}`}
                  {rule.trigger.type === "score_threshold" && `score ${rule.trigger.comparison} ${rule.trigger.scoreThreshold}`}
                  {rule.trigger.type === "days_without_activity" && `${rule.trigger.days}d inactive`}
                </span>
              </div>
              
              {/* Action */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Then:</span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  <ActionIcon className="h-3 w-3" />
                  {rule.action.type.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Match indicator */}
            {matchCount > 0 && rule.isActive && (
              <div className="flex items-center gap-2 text-tiny text-warning">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>{matchCount} {matchCount === 1 ? "deal matches" : "deals match"} this rule right now</span>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

interface AutoRulesPanelProps {
  isCompact?: boolean;
}

export function AutoRulesPanel({ isCompact = false }: AutoRulesPanelProps) {
  const {
    rules,
    evaluations,
    isLoading,
    toggleRule,
    activeRulesCount,
    triggeredRulesCount,
    totalMatchedProperties,
  } = useAutoRules();

  const [isExpanded, setIsExpanded] = React.useState(false);

  if (isLoading) {
    return (
      <Card variant="default" padding="none" className="overflow-hidden animate-pulse">
        <div className="flex items-center gap-3 p-4 border-b border-border-subtle">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-5 w-32 bg-muted rounded" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  // Get match counts for each rule
  const ruleMatchCounts = new Map(
    evaluations.map((e) => [e.rule.id, e.matchCount])
  );

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-accent/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="text-body font-semibold text-foreground">Auto-Rules</h3>
            <p className="text-tiny text-muted-foreground">
              {activeRulesCount} active • {triggeredRulesCount > 0 ? (
                <span className="text-warning">{triggeredRulesCount} triggered</span>
              ) : (
                <span className="text-success">all clear</span>
              )}
            </p>
          </div>
        </div>
        
        {triggeredRulesCount > 0 && (
          <Badge variant="outline" className="gap-1 text-warning border-warning/30 bg-warning/5">
            <AlertTriangle className="h-3 w-3" />
            {totalMatchedProperties} {totalMatchedProperties === 1 ? "deal" : "deals"} need action
          </Badge>
        )}
      </div>

      {/* Rules List */}
      <div className="p-3 space-y-2">
        {(isCompact ? rules.slice(0, 3) : rules).map((rule) => (
          <RuleItem
            key={rule.id}
            rule={rule}
            matchCount={ruleMatchCounts.get(rule.id) || 0}
            onToggle={(isActive) => toggleRule({ ruleId: rule.id, isActive })}
          />
        ))}
      </div>

      {/* Footer */}
      {isCompact && rules.length > 3 && (
        <div 
          className="flex items-center justify-center gap-2 py-3 border-t border-border-subtle text-small text-muted-foreground hover:text-primary cursor-pointer transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <Settings2 className="h-4 w-4" />
          <span>Manage All {rules.length} Rules</span>
        </div>
      )}

      {/* Active Rules Summary */}
      {triggeredRulesCount === 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 text-tiny text-success bg-success/5 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>All rules are running smoothly. No immediate actions needed.</span>
          </div>
        </div>
      )}
    </Card>
  );
}
