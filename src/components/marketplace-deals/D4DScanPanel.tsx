import React, { useState } from "react";
import { X, AlertTriangle, Home, DollarSign, MapPin, Eye, ChevronDown, ChevronUp, Flame, Building2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { D4DProperty } from "./d4d-scan-data";
import { getDistressColor, getDistressLabel } from "./d4d-scan-data";

interface D4DScanPanelProps {
  properties: D4DProperty[];
  onClose: () => void;
  onFocusProperty: (property: D4DProperty) => void;
  totalScanned: number;
}

type SortMode = "distress" | "equity" | "value";
type FilterLevel = "all" | "high" | "moderate" | "mild";

export function D4DScanPanel({ properties, onClose, onFocusProperty, totalScanned }: D4DScanPanelProps) {
  const [sortMode, setSortMode] = useState<SortMode>("distress");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = properties.filter(p => {
    if (filterLevel === "all") return true;
    if (filterLevel === "high") return p.distressScore >= 70;
    if (filterLevel === "moderate") return p.distressScore >= 45 && p.distressScore < 70;
    if (filterLevel === "mild") return p.distressScore >= 25 && p.distressScore < 45;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === "distress") return b.distressScore - a.distressScore;
    if (sortMode === "equity") return b.estimatedEquityPct - a.estimatedEquityPct;
    return a.estimatedValue - b.estimatedValue;
  });

  const highCount = properties.filter(p => p.distressScore >= 70).length;
  const modCount = properties.filter(p => p.distressScore >= 45 && p.distressScore < 70).length;

  return (
    <div className="h-full flex flex-col bg-background border-l w-[380px] min-w-[380px]">
      {/* Header */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Flame className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI D4D Scanner</h3>
              <p className="text-xs text-muted-foreground">{totalScanned.toLocaleString()} properties scanned</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-destructive/10 rounded-md p-2 text-center">
            <div className="text-lg font-bold text-destructive">{highCount}</div>
            <div className="text-[10px] text-muted-foreground">High Distress</div>
          </div>
          <div className="bg-orange-100 rounded-md p-2 text-center">
            <div className="text-lg font-bold text-orange-600">{modCount}</div>
            <div className="text-[10px] text-muted-foreground">Moderate</div>
          </div>
          <div className="bg-muted rounded-md p-2 text-center">
            <div className="text-lg font-bold text-foreground">{sorted.length}</div>
            <div className="text-[10px] text-muted-foreground">Showing</div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {(["all", "high", "moderate", "mild"] as FilterLevel[]).map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                filterLevel === level
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-1.5 mt-2">
          {([
            { key: "distress", label: "Distress", icon: AlertTriangle },
            { key: "equity", label: "Equity", icon: Scale },
            { key: "value", label: "Value", icon: DollarSign },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSortMode(key)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                sortMode === key
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Property list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {sorted.map(property => {
            const isExpanded = expandedId === property.id;
            const color = getDistressColor(property.distressScore);

            return (
              <div
                key={property.id}
                className={cn(
                  "rounded-lg border bg-card overflow-hidden transition-all cursor-pointer hover:shadow-sm",
                  isExpanded && "shadow-md"
                )}
              >
                {/* Main row */}
                <div
                  className="flex items-start gap-2.5 p-2.5"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : property.id);
                    onFocusProperty(property);
                  }}
                >
                  {/* Distress score badge */}
                  <div
                    className="h-10 w-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <span className="text-sm font-bold" style={{ color }}>{property.distressScore}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{property.address}</p>
                    <p className="text-xs text-muted-foreground">{property.city}, {property.state} {property.zip}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-primary">
                        ${(property.estimatedValue / 1000).toFixed(0)}K
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {property.beds}bd / {property.baths}ba • {property.sqft.toLocaleString()} sqft
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {property.vacant && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-700 bg-amber-50">
                        Vacant
                      </Badge>
                    )}
                    {property.preForeclosure && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-red-300 text-red-700 bg-red-50">
                        Pre-FC
                      </Badge>
                    )}
                    {property.taxLien && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-300 text-orange-700 bg-orange-50">
                        Tax Lien
                      </Badge>
                    )}
                  </div>

                  <button className="p-0.5 text-muted-foreground flex-shrink-0">
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-2.5 pb-2.5 border-t bg-muted/20">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {/* Physical signals */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Physical</p>
                        <div className="space-y-0.5 text-xs">
                          {property.overgrown && <p className="flex items-center gap-1">🌿 Overgrown yard</p>}
                          {property.boardedWindows && <p className="flex items-center gap-1">🪟 Boarded windows</p>}
                          {property.roofDamage && <p className="flex items-center gap-1">🏚️ Roof damage</p>}
                          {property.codeViolations > 0 && <p className="flex items-center gap-1">⚠️ {property.codeViolations} code violations</p>}
                          {property.vacant && <p className="flex items-center gap-1">🏠 Vacant</p>}
                          {!property.overgrown && !property.boardedWindows && !property.roofDamage && property.codeViolations === 0 && !property.vacant && (
                            <p className="text-muted-foreground">None detected</p>
                          )}
                        </div>
                      </div>
                      {/* Financial signals */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Financial</p>
                        <div className="space-y-0.5 text-xs">
                          {property.preForeclosure && <p className="flex items-center gap-1">🏦 Pre-foreclosure</p>}
                          {property.taxLien && <p className="flex items-center gap-1">💰 Tax lien</p>}
                          {property.probate && <p className="flex items-center gap-1">📜 Probate</p>}
                          {property.highEquity && <p className="flex items-center gap-1">📈 High equity ({property.estimatedEquityPct}%)</p>}
                          <p className="flex items-center gap-1">🕐 Owned {property.ownershipYears} yrs</p>
                        </div>
                      </div>
                    </div>

                    {/* Score bars */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-14 text-muted-foreground">Physical</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: `${property.physicalScore}%` }} />
                        </div>
                        <span className="text-[10px] font-medium w-6 text-right">{property.physicalScore}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] w-14 text-muted-foreground">Financial</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-red-500" style={{ width: `${property.financialScore}%` }} />
                        </div>
                        <span className="text-[10px] font-medium w-6 text-right">{property.financialScore}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 mt-2">
                      <Button size="sm" className="h-7 text-xs flex-1 gap-1">
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1">
                        <MapPin className="h-3 w-3" />
                        Street View
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
