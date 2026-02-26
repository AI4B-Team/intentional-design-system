import * as React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Target,
  CheckCircle2,
  Phone,
  Clock,
  Flame,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useFocusTasks, type FocusItem } from "@/hooks/useFocusTasks";

const iconMap = {
  lead_contact: Phone,
  offer_followup: Clock,
  hot_deal: Flame,
  stalling: AlertTriangle,
  appointment: Calendar,
  task: Target,
};

const priorityStyles = {
  critical: {
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
  high: {
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    badge: "bg-warning/10 text-warning",
  },
  medium: {
    iconBg: "bg-info/10",
    iconColor: "text-info",
    badge: "bg-info/10 text-info",
  },
  low: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
};

interface FocusItemRowProps {
  item: FocusItem;
  onComplete: () => void;
  isAnimatingOut?: boolean;
}

function FocusItemRow({ item, onComplete, isAnimatingOut }: FocusItemRowProps) {
  const navigate = useNavigate();
  const Icon = iconMap[item.type] || Target;
  const styles = priorityStyles[item.priority];

  const handleClick = () => {
    if (item.actionRoute) {
      navigate(item.actionRoute);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3.5 hover:bg-background-secondary transition-all cursor-pointer group border-b border-border-subtle last:border-b-0",
        isAnimatingOut && "animate-fade-out",
        !isAnimatingOut && "animate-fade-in"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
        styles.iconBg
      )}>
        <Icon className={cn("h-5 w-5", styles.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-small font-medium text-foreground truncate">
            {item.title}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {item.subtitle && (
            <p className="text-tiny text-muted-foreground truncate">
              {item.subtitle}
            </p>
          )}
          {item.time && (
            <span className={cn(
              "text-tiny font-medium shrink-0",
              item.time === "Overdue" ? "text-destructive" : 
              item.time === "Act Now" ? "text-warning" : 
              "text-muted-foreground"
            )}>
              · {item.time}
            </span>
          )}
        </div>
        {item.priority === "critical" && (
          <p className="text-tiny text-destructive font-medium flex items-center gap-1 mt-1">
            <Zap className="h-3 w-3" />
            Critical Priority
          </p>
        )}
      </div>

      {/* Action */}
      <div className="flex items-center gap-2 shrink-0">
        {item.actionLabel && (
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-primary"
            onClick={(e) => {
              e.stopPropagation();
              if (item.actionRoute) navigate(item.actionRoute);
            }}
          >
            {item.actionLabel}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
        <button
          onClick={handleComplete}
          className={cn(
            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
            "border-border hover:border-success hover:bg-success/10"
          )}
          title="Mark as complete"
        >
          <CheckCircle2 className="h-4 w-4 text-transparent hover:text-success" />
        </button>
      </div>
    </div>
  );
}

export function TodaysFocus() {
  const navigate = useNavigate();
  const { 
    focusItems, 
    completeFocusItem, 
    allFocusComplete, 
    isLoading 
  } = useFocusTasks();

  const [animatingOutId, setAnimatingOutId] = React.useState<string | null>(null);

  const handleComplete = (itemId: string) => {
    // Trigger animation
    setAnimatingOutId(itemId);
    
    // After animation, mark as complete
    setTimeout(() => {
      completeFocusItem(itemId);
      setAnimatingOutId(null);
    }, 200);
  };

  // Demo focus items if no real data
  const demoFocusItems: FocusItem[] = [
    {
      id: "demo-focus-1",
      type: "lead_contact",
      title: "3 Leads Need First Contact",
      subtitle: "No outreach yet",
      time: "Added Today",
      priority: "critical",
      urgencyScore: 95,
      source: "insight",
      completed: false,
      actionLabel: "Call Now",
      actionRoute: "/properties?status=new",
    },
    {
      id: "demo-focus-2",
      type: "offer_followup",
      title: "2 Offers Awaiting Response",
      subtitle: "Follow up needed",
      time: "Waiting 2 Days",
      priority: "high",
      urgencyScore: 85,
      source: "insight",
      completed: false,
      actionLabel: "Follow Up",
      actionRoute: "/properties?status=offer_made",
    },
    {
      id: "demo-focus-3",
      type: "hot_deal",
      title: "1 Hot Deal Needs Action",
      subtitle: "High momentum opportunity",
      time: "Waiting 2 Days",
      priority: "high",
      urgencyScore: 75,
      source: "insight",
      completed: false,
      actionLabel: "View Deal",
      actionRoute: "/pipeline",
    },
  ];

  const displayFocusItems = focusItems.length > 0 ? focusItems : demoFocusItems;
  const isAllComplete = focusItems.length > 0 ? allFocusComplete : false;

  if (isLoading) {
    return (
      <Card variant="default" padding="none" className="mb-6 animate-pulse">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-5 w-32 bg-muted rounded" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      variant="default" 
      padding="none" 
      className={cn(
        "mb-6 overflow-hidden",
        isAllComplete ? "border-success/30" : "border-primary/20"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex flex-wrap items-center gap-3 px-4 py-3 border-b",
        isAllComplete 
          ? "bg-gradient-to-r from-success/5 to-transparent border-success/20" 
          : "bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-border-subtle"
      )}>
        <div className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center",
          isAllComplete ? "bg-success/10" : "bg-primary/10"
        )}>
          {isAllComplete ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Target className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-small font-semibold text-foreground">Today's Focus</h3>
          <p className="text-tiny text-muted-foreground">
            {isAllComplete 
              ? "You're all caught up! Great work." 
              : `${displayFocusItems.length} urgent action${displayFocusItems.length !== 1 ? "s" : ""} need your attention`
            }
          </p>
        </div>
        {!isAllComplete && (
          <span className="text-tiny font-medium px-2 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
            {displayFocusItems.length}/6 Priorities
          </span>
        )}
      </div>

      {/* Focus Items */}
      {!isAllComplete && (
        <div className="divide-y divide-border-subtle">
          {displayFocusItems.map((item) => (
            <FocusItemRow
              key={item.id}
              item={item}
              onComplete={() => handleComplete(item.id)}
              isAnimatingOut={animatingOutId === item.id}
            />
          ))}
        </div>
      )}

      {/* All Clear State */}
      {isAllComplete && (
        <div className="px-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h4 className="text-body font-semibold text-foreground mb-1">All caught up!</h4>
          <p className="text-small text-muted-foreground mb-4">
            No urgent actions right now. Check your tasks or explore the pipeline.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/tasks")}
            >
              View Tasks
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => navigate("/pipeline")}
            >
              View Pipeline
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Footer Link */}
      {!isAllComplete && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
          <div 
            className="flex items-center gap-2 text-small text-muted-foreground hover:text-primary cursor-pointer transition-colors"
            onClick={() => navigate("/calendar")}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>View in Calendar</span>
          </div>
          <div 
            className="flex items-center gap-2 text-small text-muted-foreground hover:text-primary cursor-pointer transition-colors"
            onClick={() => navigate("/tasks?filter=priority")}
          >
            <span>All Tasks</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      )}
    </Card>
  );
}
