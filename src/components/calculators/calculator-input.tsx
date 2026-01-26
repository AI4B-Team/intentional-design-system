import * as React from "react";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";

interface CalculatorInputProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  type?: "currency" | "percentage" | "number" | "years" | "months";
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CalculatorInput({
  label,
  value,
  onChange,
  type = "number",
  tooltip,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  className,
}: CalculatorInputProps) {
  const [focused, setFocused] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState(
    typeof value === "number" ? formatNumber(value, type) : value
  );

  React.useEffect(() => {
    if (!focused) {
      setDisplayValue(typeof value === "number" ? formatNumber(value, type) : value);
    }
  }, [value, focused, type]);

  function formatNumber(num: number, inputType: string): string {
    if (inputType === "currency") {
      return num.toLocaleString("en-US");
    }
    if (inputType === "percentage") {
      return num.toString();
    }
    return num.toLocaleString("en-US");
  }

  function parseNumber(str: string): number {
    const cleaned = str.replace(/[^0-9.-]/g, "");
    return parseFloat(cleaned) || 0;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseNumber(displayValue.toString());
    onChange(parsed);
    setDisplayValue(formatNumber(parsed, type));
  };

  const handleFocus = () => {
    setFocused(true);
    setDisplayValue(typeof value === "number" ? value.toString() : value);
  };

  const defaultPrefix = type === "currency" ? "$" : prefix;
  const defaultSuffix = type === "percentage" ? "%" : type === "years" ? " yrs" : type === "months" ? " mo" : suffix;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <label className="text-small font-medium text-content">{label}</label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-content-tertiary cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-brand text-white">
              <p className="text-small">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        {defaultPrefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary text-body">
            {defaultPrefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "flex h-10 w-full rounded-small border border-border bg-white text-right text-body tabular-nums transition-all duration-150",
            "placeholder:text-content-tertiary",
            "focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/10",
            defaultPrefix ? "pl-8" : "pl-3.5",
            defaultSuffix ? "pr-12" : "pr-3.5"
          )}
        />
        {defaultSuffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary text-body">
            {defaultSuffix}
          </span>
        )}
      </div>
    </div>
  );
}

interface CalculatorSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  tooltip?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function CalculatorSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = "%",
  tooltip,
  formatValue,
  className,
}: CalculatorSliderProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${suffix}`;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-small font-medium text-content">{label}</label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-content-tertiary cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-brand text-white">
                <p className="text-small">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-body font-semibold text-brand-accent tabular-nums">
          {displayValue}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="[&_[role=slider]]:border-brand-accent [&_[role=slider]]:bg-white [&>span:first-child]:bg-surface-tertiary [&>span:first-child>span]:bg-brand-accent"
      />
    </div>
  );
}

interface InputGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function InputGroup({ title, children, className }: InputGroupProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="text-tiny uppercase tracking-wide font-medium text-content-secondary">
        {title}
      </h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
