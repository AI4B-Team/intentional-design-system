import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps) {
  const [activeIndex, setActiveIndex] = React.useState(
    options.findIndex((o) => o.value === value)
  );

  React.useEffect(() => {
    const index = options.findIndex((o) => o.value === value);
    setActiveIndex(index);
  }, [value, options]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-medium bg-surface-secondary p-1",
        className
      )}
    >
      {/* Sliding background */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-small shadow-xs transition-all duration-200 ease-out"
        style={{
          left: `calc(${(activeIndex / options.length) * 100}% + 4px)`,
          width: `calc(${100 / options.length}% - 8px)`,
        }}
      />

      {/* Options */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative z-10 flex items-center justify-center gap-2 px-3 py-1.5 text-small font-medium transition-colors duration-150",
            "rounded-small",
            value === option.value
              ? "text-content"
              : "text-content-secondary hover:text-content"
          )}
          style={{ minWidth: `${100 / options.length}%` }}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
