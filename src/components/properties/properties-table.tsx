import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Eye, MapPin, Flame, Zap } from "lucide-react";
import {
  calculateVelocityScore,
  getDefaultVelocityData,
} from "@/lib/velocity-scoring";

interface Property {
  id: string | number;
  address: string;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
  arv?: number;
  score: number;
  status: string;
  source?: string;
  addedDate: string;
  distress_signals?: string[];
}

interface PropertiesTableProps {
  properties: Property[];
  selectedIds: (string | number)[];
  onSelectionChange: (ids: (string | number)[]) => void;
  onRowClick: (property: Property) => void;
  onCall?: (id: string | number) => void;
  onView?: (id: string | number) => void;
  sortBy?: string;
  className?: string;
}

function getScoreColor(score: number): { bg: string; text: string } {
  if (score >= 800) return { bg: "bg-score-hot/15", text: "text-score-hot" };
  if (score >= 600) return { bg: "bg-score-warm/15", text: "text-score-warm" };
  if (score >= 400) return { bg: "bg-score-moderate/15", text: "text-score-moderate" };
  if (score >= 200) return { bg: "bg-score-cool/15", text: "text-score-cool" };
  return { bg: "bg-score-cold/15", text: "text-score-cold" };
}

function getStatusVariant(status: string) {
  switch (status) {
    case "Hot Lead":
      return "success";
    case "Warm":
      return "warning";
    case "In Review":
      return "info";
    case "On Hold":
      return "error";
    case "Closed":
      return "default";
    default:
      return "secondary";
  }
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

function getVelocityColor(level: string): string {
  switch (level) {
    case "CRITICAL":
      return "text-destructive";
    case "HIGH":
      return "text-warning";
    case "STANDARD":
      return "text-info";
    default:
      return "text-muted-foreground";
  }
}

export function PropertiesTable({
  properties,
  selectedIds,
  onSelectionChange,
  onRowClick,
  onCall,
  onView,
  sortBy,
  className,
}: PropertiesTableProps) {
  // Calculate velocity for each property
  const propertiesWithVelocity = React.useMemo(() => {
    return properties.map((p) => {
      const velocityData = getDefaultVelocityData({
        motivation_score: p.score,
        distress_signals: p.distress_signals,
      });
      const velocity = calculateVelocityScore(velocityData);
      return { ...p, velocity };
    });
  }, [properties]);

  // Sort by velocity if requested
  const sortedProperties = React.useMemo(() => {
    if (sortBy === "velocity") {
      return [...propertiesWithVelocity].sort((a, b) => b.velocity.score - a.velocity.score);
    }
    return propertiesWithVelocity;
  }, [propertiesWithVelocity, sortBy]);

  const allSelected = properties.length > 0 && selectedIds.length === properties.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < properties.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(properties.map((p) => p.id));
    }
  };

  const handleSelectRow = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-medium border border-border-subtle", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="sticky top-0 z-10 bg-surface-secondary shadow-sm">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  // @ts-ignore
                  indeterminate={someSelected}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">
                Property
              </th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">
                Status
              </th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">
                Score
              </th>
              <th className="px-4 py-3 text-center text-tiny font-medium uppercase tracking-wide text-content-secondary">
                Velocity
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">
                Beds/Baths
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">
                Sq Ft
              </th>
              <th className="px-4 py-3 text-right text-tiny font-medium uppercase tracking-wide text-content-secondary">
                ARV
              </th>
              <th className="px-4 py-3 text-left text-tiny font-medium uppercase tracking-wide text-content-secondary">
                Added
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedProperties.map((property, index) => {
              const isSelected = selectedIds.includes(property.id);
              const scoreColors = getScoreColor(property.score);
              const isHot = property.score >= 800;
              const isCriticalVelocity = property.velocity.urgency_level === "CRITICAL";

              return (
                <tr
                  key={property.id}
                  onClick={() => onRowClick(property)}
                className={cn(
                    "h-14 cursor-pointer transition-colors group",
                    isCriticalVelocity && "bg-destructive/5",
                    !isCriticalVelocity && index % 2 === 0 && "bg-white",
                    !isCriticalVelocity && index % 2 !== 0 && "bg-surface-secondary/50",
                    isSelected && "bg-brand-accent/5",
                    "hover:bg-brand-accent/5"
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-4">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => {}}
                      onClick={(e) => handleSelectRow(property.id, e)}
                    />
                  </td>

                  {/* Property */}
                  <td className="px-4">
                    <div>
                      <div className="text-body font-medium text-content group-hover:text-brand-accent transition-colors">
                        {property.address}
                        {isCriticalVelocity && (
                          <Badge variant="error" size="sm" className="ml-2 animate-pulse">
                            🚨 Critical
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-small text-content-secondary">
                        <MapPin className="h-3 w-3" />
                        {property.city}, {property.state}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4">
                    <Badge variant={getStatusVariant(property.status) as any} size="sm">
                      {property.status}
                    </Badge>
                  </td>

                  {/* Score */}
                  <td className="px-4 text-center">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-small font-medium",
                        scoreColors.bg,
                        scoreColors.text
                      )}
                    >
                      {isHot && <Flame className="h-3 w-3" />}
                      {property.score}
                    </div>
                  </td>

                  {/* Beds/Baths */}
                  <td className="px-4 text-right text-body tabular-nums">
                    {property.beds}/{property.baths}
                  </td>

                  {/* Sq Ft */}
                  <td className="px-4 text-right text-body tabular-nums">
                    {property.sqft.toLocaleString()}
                  </td>

                  {/* ARV */}
                  <td className="px-4 text-right text-body font-medium tabular-nums">
                    {property.arv ? formatCurrency(property.arv) : "—"}
                  </td>

                  {/* Velocity */}
                  <td className="px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Zap className={cn("h-3.5 w-3.5", getVelocityColor(property.velocity.urgency_level))} />
                      <span className={cn("font-semibold tabular-nums", getVelocityColor(property.velocity.urgency_level))}>
                        {property.velocity.score}
                      </span>
                    </div>
                  </td>

                  {/* Added */}
                  <td className="px-4 text-small text-content-secondary">
                    {property.addedDate}
                  </td>

                  {/* Actions */}
                  <td className="px-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCall?.(property.id);
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView?.(property.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-4 bg-brand text-white px-6 py-3 rounded-large shadow-xl">
            <span className="text-body font-medium">
              {selectedIds.length} selected
            </span>
            <div className="h-4 w-px bg-white/30" />
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              Export
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              Assign
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 text-red-300">
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
