import React, { useState, useMemo } from "react";
import { X, AlertTriangle, DollarSign, MapPin, Eye, ChevronDown, ChevronUp, Flame, Scale, Download, User, Phone, Mail, SlidersHorizontal, Maximize2, Minimize2, ListPlus, Megaphone, PhoneCall, MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { D4DProperty } from "./d4d-scan-data";
import { getDistressColor } from "./d4d-scan-data";
import { D4DPropertyDetail } from "./D4DPropertyDetail";
import { toast } from "sonner";
import { CreateListModal } from "@/components/lists/create-list-modal";

interface D4DScanPanelProps {
  properties: D4DProperty[];
  onClose: () => void;
  onFocusProperty: (property: D4DProperty) => void;
  totalScanned: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

type SortMode = "distress" | "equity" | "value" | "spread";
type FilterLevel = "all" | "high" | "moderate" | "mild";

export function D4DScanPanel({ properties, onClose, onFocusProperty, totalScanned, isExpanded = false, onToggleExpand }: D4DScanPanelProps) {
  const [sortMode, setSortMode] = useState<SortMode>("distress");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailProperty, setDetailProperty] = useState<D4DProperty | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);

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
    if (sortMode === "spread") return b.wholesaleSpread - a.wholesaleSpread;
    return a.estimatedValue - b.estimatedValue;
  });

  const highCount = properties.filter(p => p.distressScore >= 70).length;
  const modCount = properties.filter(p => p.distressScore >= 45 && p.distressScore < 70).length;

  const totalValue = useMemo(() => sorted.reduce((s, p) => s + p.estimatedValue, 0), [sorted]);
  const avgEquity = useMemo(() => sorted.length ? Math.round(sorted.reduce((s, p) => s + p.estimatedEquityPct, 0) / sorted.length) : 0, [sorted]);
  const avgSpread = useMemo(() => sorted.length ? Math.round(sorted.reduce((s, p) => s + p.wholesaleSpread, 0) / sorted.length) : 0, [sorted]);

  const handleExportCSV = () => {
    const headers = ["Address", "City", "State", "Zip", "Distress Score", "Est. Value", "ARV", "Wholesale Spread", "Owner", "Owner Type", "Phone Available", "Email Available", "Vacant", "Pre-Foreclosure", "Tax Lien", "Probate", "Equity %", "Est. Rehab", "Neighborhood"];
    const rows = sorted.map(p => [
      p.address, p.city, p.state, p.zip, p.distressScore, p.estimatedValue, p.arvEstimate, p.wholesaleSpread,
      p.ownerName, p.ownerType, p.phoneAvailable ? "Yes" : "No", p.emailAvailable ? "Yes" : "No",
      p.vacant ? "Yes" : "No", p.preForeclosure ? "Yes" : "No", p.taxLien ? "Yes" : "No", p.probate ? "Yes" : "No",
      p.estimatedEquityPct, p.estimatedRehab, p.neighborhoodName,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `d4d-scan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateList = () => {
    toast.success(`Creating list with ${sorted.length} leads from D4D scan...`);
    setShowCreateList(true);
  };

  const handleLaunchCampaign = () => {
    const withContact = sorted.filter(p => p.phoneAvailable || p.emailAvailable).length;
    toast.success(`Launching campaign for ${withContact} contactable leads`, {
      description: `${sorted.length} total leads, ${withContact} with contact info`,
    });
  };

  const handleCallProperty = (e: React.MouseEvent, property: D4DProperty) => {
    e.stopPropagation();
    if (property.phoneAvailable) {
      toast.success(`Calling ${property.ownerName}...`, {
        description: property.address,
      });
    } else {
      toast.error("No phone number available", {
        description: "Run skip trace to find contact info",
      });
    }
  };

  const handleEmailProperty = (e: React.MouseEvent, property: D4DProperty) => {
    e.stopPropagation();
    if (property.emailAvailable) {
      toast.success(`Composing email to ${property.ownerName}...`, {
        description: property.address,
      });
    } else {
      toast.error("No email available", {
        description: "Run skip trace to find contact info",
      });
    }
  };

  return (
    <>
      <div className={cn(
        "h-full flex flex-col bg-background border-l relative transition-all duration-300",
        isExpanded ? "w-full min-w-0" : "w-[400px] min-w-[400px]"
      )}>
        {/* Property detail overlay */}
        {detailProperty && (
          <D4DPropertyDetail
            property={detailProperty}
            onClose={() => setDetailProperty(null)}
            onLocate={() => {
              onFocusProperty(detailProperty);
              setDetailProperty(null);
            }}
          />
        )}

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
            <div className="flex items-center gap-1">
              {onToggleExpand && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleExpand} title={isExpanded ? "Minimize panel" : "Expand to full view"}>
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExportCSV} title="Export CSV">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className={cn("grid gap-1.5 mt-2", isExpanded ? "grid-cols-6" : "grid-cols-4")}>
            <div className="bg-destructive/10 rounded-md p-1.5 text-center">
              <div className="text-base font-bold text-destructive">{highCount}</div>
              <div className="text-[9px] text-muted-foreground">High Distress</div>
            </div>
            <div className="bg-orange-100 rounded-md p-1.5 text-center">
              <div className="text-base font-bold text-orange-600">{modCount}</div>
              <div className="text-[9px] text-muted-foreground">Moderate</div>
            </div>
            <div className="bg-muted rounded-md p-1.5 text-center">
              <div className="text-base font-bold text-foreground">{avgEquity}%</div>
              <div className="text-[9px] text-muted-foreground">Avg Equity</div>
            </div>
            <div className="bg-green-50 rounded-md p-1.5 text-center">
              <div className="text-base font-bold text-green-700">${(avgSpread / 1000).toFixed(0)}K</div>
              <div className="text-[9px] text-muted-foreground">Avg Spread</div>
            </div>
            {isExpanded && (
              <>
                <div className="bg-blue-50 rounded-md p-1.5 text-center">
                  <div className="text-base font-bold text-blue-700">{sorted.filter(p => p.phoneAvailable).length}</div>
                  <div className="text-[9px] text-muted-foreground">Phone Avail</div>
                </div>
                <div className="bg-violet-50 rounded-md p-1.5 text-center">
                  <div className="text-base font-bold text-violet-700">{sorted.filter(p => p.emailAvailable).length}</div>
                  <div className="text-[9px] text-muted-foreground">Email Avail</div>
                </div>
              </>
            )}
          </div>

          {/* Action buttons bar */}
          <div className="flex gap-1.5 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 flex-1"
              onClick={handleCreateList}
            >
              <ListPlus className="h-3 w-3" />
              Create List ({sorted.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 flex-1"
              onClick={() => {
                const withPhone = sorted.filter(p => p.phoneAvailable).length;
                toast.success(`Adding ${withPhone} leads to Dial Queue`, {
                  description: `${withPhone} of ${sorted.length} leads have phone numbers`,
                });
              }}
            >
              <Phone className="h-3 w-3" />
              Add All To Dial Queue
            </Button>
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
                {level === "all" ? `All (${properties.length})` : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1.5 mt-2">
            {([
              { key: "distress", label: "Distress", icon: AlertTriangle },
              { key: "equity", label: "Equity", icon: Scale },
              { key: "spread", label: "Spread", icon: DollarSign },
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
          <div className={cn("p-2 space-y-1.5", isExpanded && "grid grid-cols-2 xl:grid-cols-3 gap-2 space-y-0")}>
            {sorted.map(property => {
              const isItemExpanded = expandedId === property.id;
              const color = getDistressColor(property.distressScore);

              return (
                <div
                  key={property.id}
                  className={cn(
                    "rounded-lg border bg-card overflow-hidden transition-all cursor-pointer hover:shadow-sm",
                    isItemExpanded && "shadow-md",
                    isExpanded && "flex flex-col"
                  )}
                >
                  {/* Main row with street view thumbnail */}
                  <div
                    className="flex items-start gap-2 p-2"
                    onClick={() => {
                      setExpandedId(isItemExpanded ? null : property.id);
                      onFocusProperty(property);
                    }}
                  >
                    {/* Street view thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={property.streetViewUrl}
                        alt=""
                        className={cn("rounded-md object-cover", isExpanded ? "w-20 h-20" : "w-16 h-16")}
                      />
                      <div
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white"
                        style={{ backgroundColor: color, color: "white" }}
                      >
                        {property.distressScore}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{property.address}</p>
                      <p className="text-[10px] text-muted-foreground">{property.city}, {property.state} {property.zip}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-primary">
                          ${(property.estimatedValue / 1000).toFixed(0)}K
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {property.beds}bd/{property.baths}ba • {property.sqft.toLocaleString()}sf
                        </span>
                      </div>
                      {/* Owner & contact badges */}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          <User className="h-2.5 w-2.5 inline mr-0.5" />
                          {property.ownerName}
                        </span>
                        <button
                          onClick={(e) => handleCallProperty(e, property)}
                          className={cn(
                            "p-0.5 rounded transition-colors",
                            property.phoneAvailable
                              ? "text-green-600 hover:bg-green-100"
                              : "text-muted-foreground/40 cursor-not-allowed"
                          )}
                          title={property.phoneAvailable ? `Call ${property.ownerName}` : "No phone available"}
                        >
                          <Phone className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleEmailProperty(e, property)}
                          className={cn(
                            "p-0.5 rounded transition-colors",
                            property.emailAvailable
                              ? "text-blue-600 hover:bg-blue-100"
                              : "text-muted-foreground/40 cursor-not-allowed"
                          )}
                          title={property.emailAvailable ? `Email ${property.ownerName}` : "No email available"}
                        >
                          <Mail className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      {property.vacant && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-300 text-amber-700 bg-amber-50">
                          Vacant
                        </Badge>
                      )}
                      {property.preForeclosure && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-red-300 text-red-700 bg-red-50">
                          Pre-FC
                        </Badge>
                      )}
                      {property.taxLien && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-orange-300 text-orange-700 bg-orange-50">
                          Tax Lien
                        </Badge>
                      )}
                      {property.probate && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-purple-300 text-purple-700 bg-purple-50">
                          Probate
                        </Badge>
                      )}
                    </div>

                    <button className="p-0.5 text-muted-foreground flex-shrink-0 mt-1">
                      {isItemExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isItemExpanded && (
                    <div className="px-2 pb-2 border-t bg-muted/20">
                      {/* Larger street view */}
                      <img
                        src={property.streetViewUrl}
                        alt={`Street view of ${property.address}`}
                        className="w-full h-32 object-cover rounded-md mt-2"
                      />

                      <div className="grid grid-cols-3 gap-1.5 mt-2 text-center">
                        <div className="bg-muted/50 rounded p-1.5">
                          <p className="text-[10px] text-muted-foreground">ARV</p>
                          <p className="text-xs font-bold">${(property.arvEstimate / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="bg-muted/50 rounded p-1.5">
                          <p className="text-[10px] text-muted-foreground">Rehab</p>
                          <p className="text-xs font-bold">${(property.estimatedRehab / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="bg-green-50 rounded p-1.5">
                          <p className="text-[10px] text-green-700">Spread</p>
                          <p className="text-xs font-bold text-green-800">${(property.wholesaleSpread / 1000).toFixed(0)}K</p>
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
                        <Button size="sm" className="h-7 text-xs flex-1 gap-1" onClick={(e) => { e.stopPropagation(); setDetailProperty(property); }}>
                          <Eye className="h-3 w-3" />
                          Full Details
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); handleCallProperty(e, property); }}>
                          <PhoneCall className="h-3 w-3" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); handleEmailProperty(e, property); }}>
                          <MailPlus className="h-3 w-3" />
                          Email
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onFocusProperty(property); }}>
                          <MapPin className="h-3 w-3" />
                          Map
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

      {/* Create List Modal */}
      <CreateListModal
        open={showCreateList}
        onOpenChange={setShowCreateList}
        defaultTab="manual"
      />
    </>
  );
}
