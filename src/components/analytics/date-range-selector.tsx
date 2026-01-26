import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar as CalendarIcon, ChevronDown, ArrowLeftRight } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from "date-fns";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  compareEnabled?: boolean;
  onCompareChange?: (enabled: boolean) => void;
  compareRange?: DateRange;
  className?: string;
}

const presets = [
  { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: "Yesterday", getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: "Last 7 days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "Last 90 days", getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: "This month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "This year", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

export function DateRangeSelector({
  value,
  onChange,
  compareEnabled = false,
  onCompareChange,
  className,
}: DateRangeSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange>(value);

  const formatRange = (range: DateRange) => {
    if (format(range.from, "yyyy-MM-dd") === format(range.to, "yyyy-MM-dd")) {
      return format(range.from, "MMM d, yyyy");
    }
    return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`;
  };

  const handlePresetSelect = (preset: typeof presets[0]) => {
    const newRange = preset.getValue();
    onChange(newRange);
  };

  const handleApplyCustom = () => {
    onChange(tempRange);
    setIsCalendarOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Preset Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {formatRange(value)}
            <ChevronDown className="h-3.5 w-3.5 text-content-tertiary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 bg-white">
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.label}
              onClick={() => handlePresetSelect(preset)}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCalendarOpen(true)}>
            Custom range...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Compare Toggle */}
      {onCompareChange && (
        <Button
          variant={compareEnabled ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onCompareChange(!compareEnabled)}
          className={cn(
            "gap-2",
            compareEnabled && "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
          )}
        >
          <ArrowLeftRight className="h-4 w-4" />
          Compare
        </Button>
      )}

      {/* Custom Range Calendar Popover */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <span />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <div className="p-4 space-y-4">
            <div className="text-small font-medium text-content">Select date range</div>
            <Calendar
              mode="range"
              selected={{ from: tempRange.from, to: tempRange.to }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setTempRange({ from: range.from, to: range.to });
                } else if (range?.from) {
                  setTempRange({ from: range.from, to: range.from });
                }
              }}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <Button variant="ghost" size="sm" onClick={() => setIsCalendarOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleApplyCustom}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Compare Badge */}
      {compareEnabled && (
        <Badge variant="secondary" size="sm" className="text-content-secondary">
          vs. previous period
        </Badge>
      )}
    </div>
  );
}
