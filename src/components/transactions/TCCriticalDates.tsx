import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { format, differenceInDays, isPast, isToday, addDays } from "date-fns";
import { 
  CriticalDate, 
  DEFAULT_CRITICAL_DATES,
  TransactionStageId,
  getStageConfig,
} from "@/lib/transaction-stages";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TCCriticalDatesProps {
  contractDate: Date;
  criticalDates: CriticalDate[];
  onUpdateDate: (dateId: string, updates: Partial<CriticalDate>) => void;
  className?: string;
}

export function TCCriticalDates({
  contractDate,
  criticalDates,
  onUpdateDate,
  className,
}: TCCriticalDatesProps) {
  const [expanded, setExpanded] = useState(true);

  // Calculate upcoming deadlines
  const upcomingDates = criticalDates
    .filter(d => d.date && !d.isCompleted && !isPast(d.date))
    .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0))
    .slice(0, 5);

  const overdueDates = criticalDates.filter(
    d => d.date && !d.isCompleted && isPast(d.date) && !isToday(d.date)
  );

  const todayDates = criticalDates.filter(
    d => d.date && !d.isCompleted && isToday(d.date)
  );

  const completedCount = criticalDates.filter(d => d.isCompleted).length;
  const totalCount = criticalDates.length;

  return (
    <Card className={cn("p-4", className)}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Critical Dates</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {overdueDates.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {overdueDates.length} Overdue
                </Badge>
              )}
              {todayDates.length > 0 && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1">
                  <Clock className="h-3 w-3" />
                  {todayDates.length} Due Today
                </Badge>
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-3">
          {/* AI Alert Card */}
          {(overdueDates.length > 0 || todayDates.length > 0) && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    AI Deadline Alert
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                    {overdueDates.length > 0 
                      ? `${overdueDates.length} deadline(s) are overdue. Consider reaching out to stakeholders to resolve.`
                      : `${todayDates.length} deadline(s) due today. Take action before end of business.`
                    }
                  </p>
                  <Button variant="link" size="sm" className="p-0 h-auto text-amber-600 mt-1">
                    Send Reminder to Inbox →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Overdue Items */}
          {overdueDates.map(date => (
            <DateItem 
              key={date.id} 
              date={date} 
              status="overdue"
              onUpdate={onUpdateDate}
            />
          ))}

          {/* Today Items */}
          {todayDates.map(date => (
            <DateItem 
              key={date.id} 
              date={date} 
              status="today"
              onUpdate={onUpdateDate}
            />
          ))}

          {/* Upcoming Items */}
          {upcomingDates.map(date => (
            <DateItem 
              key={date.id} 
              date={date} 
              status="upcoming"
              onUpdate={onUpdateDate}
            />
          ))}

          {upcomingDates.length === 0 && todayDates.length === 0 && overdueDates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              All deadlines completed or no dates set
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface DateItemProps {
  date: CriticalDate;
  status: "overdue" | "today" | "upcoming";
  onUpdate: (dateId: string, updates: Partial<CriticalDate>) => void;
}

function DateItem({ date, status, onUpdate }: DateItemProps) {
  const daysUntil = date.date ? differenceInDays(date.date, new Date()) : 0;
  const stageConfig = getStageConfig(date.stageId);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        status === "overdue" && "bg-destructive/5 border-destructive/20",
        status === "today" && "bg-amber-500/5 border-amber-200",
        status === "upcoming" && "bg-muted/50 border-border"
      )}
    >
      <Checkbox
        checked={date.isCompleted}
        onCheckedChange={(checked) => 
          onUpdate(date.id, { isCompleted: checked === true })
        }
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium",
            date.isCompleted && "line-through text-muted-foreground"
          )}>
            {date.label}
          </span>
          {date.isRequired && (
            <Badge variant="outline" className="text-xs">Required</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
          <Badge variant="secondary" className={cn("text-xs", stageConfig.bgColor, stageConfig.color)}>
            {stageConfig.shortLabel}
          </Badge>
          {date.date && (
            <span>{format(date.date, "MMM d, yyyy")}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === "overdue" && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {Math.abs(daysUntil)}d overdue
          </Badge>
        )}
        {status === "today" && (
          <Badge className="bg-amber-500 text-white gap-1">
            <Clock className="h-3 w-3" />
            Due Today
          </Badge>
        )}
        {status === "upcoming" && daysUntil <= date.alertDaysBefore && (
          <Badge className="bg-amber-500/10 text-amber-600 gap-1">
            <Bell className="h-3 w-3" />
            {daysUntil}d left
          </Badge>
        )}
        {status === "upcoming" && daysUntil > date.alertDaysBefore && (
          <span className="text-sm text-muted-foreground">
            {daysUntil} days
          </span>
        )}
      </div>
    </div>
  );
}
