import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";

export type SectionStatus = "complete" | "incomplete" | "error" | "optional";

interface BuilderSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: SectionStatus;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  isRequired?: boolean;
}

export function BuilderSection({
  id,
  title,
  icon,
  status,
  isOpen,
  onToggle,
  children,
  badge,
  isRequired = true,
}: BuilderSectionProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "incomplete":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      case "optional":
        return <Circle className="h-4 w-4 text-muted-foreground/50" />;
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-lg transition-colors text-left",
            isOpen
              ? "bg-accent/5 border border-accent"
              : "bg-background-secondary hover:bg-background-secondary/80 border border-transparent"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-md",
                isOpen ? "bg-accent/10" : "bg-background"
              )}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{title}</span>
                {badge && (
                  <Badge variant="secondary" size="sm">
                    {badge}
                  </Badge>
                )}
                {!isRequired && (
                  <Badge variant="secondary" size="sm">
                    Optional
                  </Badge>
                )}
              </div>
              {status === "complete" && (
                <p className="text-tiny text-success">Completed</p>
              )}
              {status === "error" && (
                <p className="text-tiny text-destructive">Missing required fields</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-4 pb-2 px-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface SectionListProps {
  children: React.ReactNode;
}

export function SectionList({ children }: SectionListProps) {
  return <div className="space-y-3">{children}</div>;
}
