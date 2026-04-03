import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RECORD_CATEGORIES, MOTIVATED_FLAGS, type RecordCategory } from "./public-records-config";

interface RecordsSidebarProps {
  selectedCategories: string[];
  onCategoriesChange: (cats: string[]) => void;
  selectedFlags: string[];
  onFlagsChange: (flags: string[]) => void;
  minScore: number;
  onMinScoreChange: (val: number) => void;
  minAmount: string;
  maxAmount: string;
  onMinAmountChange: (val: string) => void;
  onMaxAmountChange: (val: string) => void;
  categoryCounts: Record<string, number>;
}

export function RecordsSidebar({
  selectedCategories,
  onCategoriesChange,
  selectedFlags,
  onFlagsChange,
  minScore,
  onMinScoreChange,
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
  categoryCounts,
}: RecordsSidebarProps) {
  const toggleCategory = (id: string) => {
    onCategoriesChange(
      selectedCategories.includes(id)
        ? selectedCategories.filter(c => c !== id)
        : [...selectedCategories, id]
    );
  };

  const toggleFlag = (id: string) => {
    onFlagsChange(
      selectedFlags.includes(id)
        ? selectedFlags.filter(f => f !== id)
        : [...selectedFlags, id]
    );
  };

  return (
    <div className="w-64 shrink-0 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] pr-2 scrollbar-hide">
      {/* Categories */}
      <div>
        <h3 className="text-tiny font-semibold text-content-secondary uppercase tracking-wider mb-3">
          Categories
        </h3>
        <div className="space-y-1">
          {RECORD_CATEGORIES.map(cat => {
            const count = categoryCounts[cat.id] || 0;
            const active = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left transition-all text-small",
                  active
                    ? "bg-brand/10 text-content font-medium"
                    : "text-content-secondary hover:text-content hover:bg-surface-hover"
                )}
              >
                <Checkbox
                  checked={active}
                  className="h-3.5 w-3.5"
                  onCheckedChange={() => toggleCategory(cat.id)}
                />
                <cat.icon className={cn("h-3.5 w-3.5 shrink-0", cat.color)} />
                <span className="truncate flex-1">{cat.label}</span>
                <Badge variant="outline" size="sm" className="text-[10px] tabular-nums">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Motivated Seller Flags */}
      <div>
        <h3 className="text-tiny font-semibold text-content-secondary uppercase tracking-wider mb-3">
          Motivated Seller Flags
        </h3>
        <div className="space-y-1">
          {MOTIVATED_FLAGS.map(flag => {
            const active = selectedFlags.includes(flag.id);
            return (
              <button
                key={flag.id}
                onClick={() => toggleFlag(flag.id)}
                className={cn(
                  "flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left transition-all text-tiny",
                  active
                    ? "bg-amber-500/10 text-content font-medium"
                    : "text-content-secondary hover:text-content hover:bg-surface-hover"
                )}
              >
                <Checkbox
                  checked={active}
                  className="h-3 w-3"
                  onCheckedChange={() => toggleFlag(flag.id)}
                />
                <span className="truncate">{flag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Seller Score */}
      <div>
        <h3 className="text-tiny font-semibold text-content-secondary uppercase tracking-wider mb-3">
          Min Seller Score
        </h3>
        <div className="px-1">
          <Slider
            value={[minScore]}
            onValueChange={([v]) => onMinScoreChange(v)}
            max={100}
            step={5}
            className="mb-2"
          />
          <div className="flex justify-between text-[10px] text-content-tertiary tabular-nums">
            <span>0</span>
            <span className="font-medium text-content">{minScore}</span>
            <span>100</span>
          </div>
        </div>
      </div>

      {/* Amount Due */}
      <div>
        <h3 className="text-tiny font-semibold text-content-secondary uppercase tracking-wider mb-3">
          Amount Due
        </h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Min $"
              value={minAmount}
              onChange={e => onMinAmountChange(e.target.value)}
              className="text-tiny h-8"
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Max $"
              value={maxAmount}
              onChange={e => onMaxAmountChange(e.target.value)}
              className="text-tiny h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
