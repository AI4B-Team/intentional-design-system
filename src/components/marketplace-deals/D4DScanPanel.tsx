import React, { useState, useMemo } from "react";
import { X, AlertTriangle, DollarSign, MapPin, Eye, ChevronDown, ChevronUp, Flame, Scale, Download, User, Phone, Mail, SlidersHorizontal, Maximize2, Minimize2, ListPlus, Megaphone, PhoneCall, MailPlus, Brain, Lock, Crown, Users, Zap, Bed, Bath, Tag, RefreshCw, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { D4DProperty } from "./d4d-scan-data";
import { getDistressColor } from "./d4d-scan-data";
import { D4DPropertyDetail } from "./D4DPropertyDetail";
import { D4DBuyerBanner, getPropertyBuyerCount, getBuyerMatchReason, getBuyerTypes } from "./D4DBuyerBanner";
import { D4DUpgradeModal } from "./D4DUpgradeModal";
import { toast } from "sonner";
import { CreateListModal } from "@/components/lists/create-list-modal";
import { useIsTopPlan } from "@/hooks/useIsTopPlan";

interface D4DScanPanelProps {
  properties: D4DProperty[];
  onClose: () => void;
  onFocusProperty: (property: D4DProperty) => void;
  onRescan?: () => void;
  totalScanned: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

type SortMode = "distress" | "equity" | "value" | "spread";
type FilterLevel = "all" | "high" | "moderate" | "mild";

export function D4DScanPanel({ properties, onClose, onFocusProperty, onRescan, totalScanned, isExpanded = false, onToggleExpand }: D4DScanPanelProps) {
  const [sortMode, setSortMode] = useState<SortMode>("distress");
  const [filterLevel, setFilterLevel] = useState<FilterLevel>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailProperty, setDetailProperty] = useState<D4DProperty | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; property?: D4DProperty }>({ open: false });
  const { isTopPlan } = useIsTopPlan();

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

  const avgEquity = useMemo(() => sorted.length ? Math.round(sorted.reduce((s, p) => s + p.estimatedEquityPct, 0) / sorted.length) : 0, [sorted]);
  const avgSpread = useMemo(() => sorted.length ? Math.round(sorted.reduce((s, p) => s + p.wholesaleSpread, 0) / sorted.length) : 0, [sorted]);

  const handleExportCSV = () => {
    const headers = ["Address", "City", "State", "Zip", "Distress Score", "Est. Value", "ARV", "Wholesale Spread", "Equity %", "Est. Rehab", "Neighborhood"];
    const rows = sorted.map(p => [
      p.address, p.city, p.state, p.zip, p.distressScore, p.estimatedValue, p.arvEstimate, p.wholesaleSpread,
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

  const handleGatedAction = (property?: D4DProperty) => {
    if (isTopPlan) return true;
    setUpgradeModal({ open: true, property });
    return false;
  };

  const handleCallProperty = (e: React.MouseEvent, property: D4DProperty) => {
    e.stopPropagation();
    if (!handleGatedAction(property)) return;
    if (property.phoneAvailable) {
      toast.success(`Calling ${property.ownerName}...`, { description: property.address });
    } else {
      toast.error("No phone number available", { description: "Run skip trace to find contact info" });
    }
  };

  const handleEmailProperty = (e: React.MouseEvent, property: D4DProperty) => {
    e.stopPropagation();
    if (!handleGatedAction(property)) return;
    if (property.emailAvailable) {
      toast.success(`Composing email to ${property.ownerName}...`, { description: property.address });
    } else {
      toast.error("No email available", { description: "Run skip trace to find contact info" });
    }
  };

  return (
    <>
      <div className={cn(
        "h-full flex flex-col bg-background border-l relative transition-all duration-300",
        isExpanded ? "w-full min-w-0" : "w-[520px] min-w-[520px]"
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
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ScanSearch className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Scanner</h3>
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
              {onRescan && (
                <Button variant="default" size="sm" className="h-7 gap-1 text-xs" onClick={onRescan}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Rescan
                </Button>
              )}
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

          {/* Buyer Interest Banner */}
          <D4DBuyerBanner properties={properties} />

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
            {isTopPlan ? (
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
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 flex-1"
                onClick={() => setUpgradeModal({ open: true })}
              >
                <Lock className="h-3 w-3" />
                Upgrade For Dial Queue Access
              </Button>
            )}
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
              const buyerCount = getPropertyBuyerCount(property);
              const buyerReason = getBuyerMatchReason(property);
              const buyerTypes = getBuyerTypes(property);

              return (
                <div
                  key={property.id}
                  className={cn(
                    "rounded-xl border bg-card overflow-hidden transition-all cursor-pointer hover:shadow-md",
                    isItemExpanded && "shadow-md",
                    isExpanded && "flex flex-col",
                  )}
                >
                  {/* Main card layout */}
                  <div
                    className="flex items-start gap-3 p-3"
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
                        className={cn("rounded-lg object-cover", isExpanded ? "w-[140px] h-[110px]" : "w-[120px] h-[96px]")}
                      />
                      <div
                        className="absolute -top-1.5 -left-1.5 h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 border-white shadow-sm"
                        style={{ backgroundColor: color, color: "white" }}
                      >
                        {property.distressScore}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Address */}
                      <p className="text-sm font-bold truncate leading-tight">{property.address}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{property.city}, {property.state} {property.zip}</p>

                      {/* Specs row with icons */}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Bed className="h-3.5 w-3.5" />
                          {property.beds}bd
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Bath className="h-3.5 w-3.5" />
                          {property.baths}ba
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Tag className="h-3.5 w-3.5" />
                          {property.sqft.toLocaleString()}sf
                        </span>
                      </div>

                      {/* Price + Contact row */}
                      <div className="flex items-center gap-3 mt-2">
                        {isTopPlan ? (
                          <>
                            <span className="text-sm font-bold text-primary tabular-nums">
                              ${(property.estimatedValue / 1000).toFixed(0)}K
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                                <User className="h-3 w-3 inline mr-0.5" />
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
                          </>
                        ) : (
                          <div className="h-5 w-28 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 blur-[6px] flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Right column: Tags + Chevron row, then Unlock */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0 self-stretch">
                      {/* Top row: Tags + Chevron side by side */}
                      <div className="flex items-start gap-1.5">
                        <div className="flex flex-wrap items-center gap-1 justify-end">
                          {property.vacant && (
                            <Badge variant="outline" className="text-[10px] px-2.5 py-1 rounded-full border-amber-300 text-amber-700 bg-amber-50 font-medium">
                              Vacant
                            </Badge>
                          )}
                          {property.preForeclosure && (
                            <Badge variant="outline" className="text-[10px] px-2.5 py-1 rounded-full border-red-300 text-red-700 bg-red-50 font-medium">
                              Pre-FC
                            </Badge>
                          )}
                          {property.taxLien && (
                            <Badge variant="outline" className="text-[10px] px-2.5 py-1 rounded-full border-orange-300 text-orange-700 bg-orange-50 font-medium">
                              Tax Lien
                            </Badge>
                          )}
                          {property.probate && (
                            <Badge variant="outline" className="text-[10px] px-2.5 py-1 rounded-full border-purple-300 text-purple-700 bg-purple-50 font-medium">
                              Probate
                            </Badge>
                          )}
                        </div>
                        <button className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors border border-border flex-shrink-0">
                          {isItemExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* Bottom: Unlock Contact */}
                      {!isTopPlan && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleGatedAction(property); }}
                          className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 transition-colors mt-auto"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          <span className="font-medium">Unlock Contact</span>
                        </button>
                      )}
                    </div>
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
                          <p className="text-[10px] text-muted-foreground">Value</p>
                          <p className="text-xs font-bold tabular-nums">${(property.estimatedValue / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="bg-muted/50 rounded p-1.5">
                          <p className="text-[10px] text-muted-foreground">ARV</p>
                          <p className="text-xs font-bold tabular-nums">${(property.arvEstimate / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="bg-muted/50 rounded p-1.5">
                          <p className="text-[10px] text-muted-foreground">Rehab</p>
                          <p className="text-xs font-bold tabular-nums">${(property.estimatedRehab / 1000).toFixed(0)}K</p>
                        </div>
                        <div className="bg-green-50 rounded p-1.5">
                          <p className="text-[10px] text-green-700">Spread</p>
                          <p className="text-xs font-bold text-green-800 tabular-nums">${(property.wholesaleSpread / 1000).toFixed(0)}K</p>
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

                      {/* AI reasoning snippet */}
                      <div className="mt-2 p-2 rounded-md bg-muted/50 border">
                        <div className="flex items-start gap-1.5">
                          <Brain className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                            <span className="font-semibold text-foreground">AI: </span>
                            {property.overallReasoning || "Analyzing property distress signals..."}
                          </p>
                        </div>
                      </div>

                      {/* Buyer Intelligence Panel */}
                      <div className="mt-2 p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Users className="h-3.5 w-3.5 text-amber-600" />
                          <span className={cn(
                            "text-xs font-bold",
                            buyerCount >= 15 ? "text-amber-700" : buyerCount >= 8 ? "text-blue-700" : "text-stone-700"
                          )}>
                            {buyerCount} Matched Buyers
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {buyerTypes.map(type => (
                            <Badge key={type} variant="outline" className="text-[9px] px-1.5 py-0 bg-background/80 border-amber-200 text-amber-800">
                              {type}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-[10px] text-amber-900/80 leading-relaxed">{buyerReason}</p>
                        {isTopPlan ? (
                          <Button
                            size="sm"
                            className="h-6 text-[10px] gap-1 mt-1.5 bg-primary hover:bg-primary/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`Viewing ${buyerCount} matched buyers for ${property.address}`);
                            }}
                          >
                            <Users className="h-3 w-3" />
                            View Matched Buyers
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] gap-1 mt-1.5 bg-stone-800 text-white hover:bg-stone-700 border-stone-800"
                            onClick={(e) => { e.stopPropagation(); handleGatedAction(property); }}
                          >
                            <Crown className="h-3 w-3" />
                            Upgrade To Connect With These Buyers
                          </Button>
                        )}
                      </div>

                      {/* Action buttons — gated */}
                      {isTopPlan ? (
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
                      ) : (
                        <div className="flex gap-1.5 mt-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs flex-1 gap-1 bg-stone-800 text-white hover:bg-stone-700"
                            onClick={(e) => { e.stopPropagation(); handleGatedAction(property); }}
                          >
                            <Lock className="h-3 w-3" />
                            Upgrade To Access
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onFocusProperty(property); }}>
                            <MapPin className="h-3 w-3" />
                            Map
                          </Button>
                        </div>
                      )}
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

      {/* Upgrade Modal */}
      <D4DUpgradeModal
        open={upgradeModal.open}
        onOpenChange={(open) => setUpgradeModal({ open })}
        propertyAddress={upgradeModal.property?.address}
        ownerName={upgradeModal.property?.ownerName}
        buyerCount={upgradeModal.property ? getPropertyBuyerCount(upgradeModal.property) : undefined}
        cityZip={upgradeModal.property ? `${upgradeModal.property.city}, ${upgradeModal.property.zip}` : undefined}
      />
    </>
  );
}
