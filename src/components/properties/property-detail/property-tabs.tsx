import * as React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface PropertyTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function PropertyTabs({ tabs, activeTab, onTabChange, className }: PropertyTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  React.useEffect(() => {
    const activeElement = tabRefs.current.get(activeTab);
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className={cn("relative border-b border-border-subtle", className)}>
      <div className="flex items-center gap-1 px-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
            }}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative px-4 py-3 text-body transition-colors",
              activeTab === tab.id
                ? "text-content font-medium"
                : "text-content-secondary hover:text-content"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1.5 px-1.5 py-0.5 text-tiny rounded-full",
                  activeTab === tab.id
                    ? "bg-brand-accent/10 text-brand-accent"
                    : "bg-surface-tertiary text-content-tertiary"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Animated Underline */}
      <div
        className="absolute bottom-0 h-0.5 bg-brand-accent transition-all duration-200 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
}
