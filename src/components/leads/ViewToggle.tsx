import React from "react";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid, Kanban } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewType = "list" | "grid" | "kanban";

interface ViewToggleProps {
  value: ViewType;
  onChange: (value: ViewType) => void;
  className?: string;
}

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  const views: { id: ViewType; icon: React.ReactNode; label: string }[] = [
    { id: "list", icon: <List className="h-4 w-4" />, label: "List" },
    { id: "grid", icon: <LayoutGrid className="h-4 w-4" />, label: "Grid" },
    { id: "kanban", icon: <Kanban className="h-4 w-4" />, label: "Kanban" },
  ];

  return (
    <div className={cn("inline-flex rounded-lg border border-border-subtle p-1 bg-muted/30", className)}>
      {views.map((view) => (
        <Button
          key={view.id}
          variant={value === view.id ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChange(view.id)}
          className={cn(
            "gap-1.5 px-3",
            value === view.id && "bg-white shadow-sm"
          )}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  );
}
