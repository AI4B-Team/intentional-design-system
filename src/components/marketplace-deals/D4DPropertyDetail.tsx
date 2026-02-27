import React, { useState } from "react";
import { X, MapPin, User, Mail, Phone, AtSign, Droplets, FileText, Shield, DollarSign, Home, Ruler, Calendar, TrendingUp, AlertTriangle, Building2, PhoneCall, MailPlus, Brain, Eye, Landmark, Lock, Crown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { D4DProperty } from "./d4d-scan-data";
import { getDistressColor, getDistressLabel } from "./d4d-scan-data";
import { getPropertyBuyerCount, getBuyerMatchReason, getBuyerTypes } from "./D4DBuyerBanner";
import { D4DUpgradeModal } from "./D4DUpgradeModal";
import { useIsTopPlan } from "@/hooks/useIsTopPlan";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface D4DPropertyDetailProps {
  property: D4DProperty;
  onClose: () => void;
  onLocate: () => void;
}

export function D4DPropertyDetail({ property, onClose, onLocate }: D4DPropertyDetailProps) {
  const color = getDistressColor(property.distressScore);
  const { isTopPlan } = useIsTopPlan();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const buyerCount = getPropertyBuyerCount(property);
  const buyerReason = getBuyerMatchReason(property);
  const buyerTypes = getBuyerTypes(property);

  const handleGatedAction = () => {
    if (isTopPlan) return true;
    setShowUpgrade(true);
    return false;
  };

  return (
    <>
    <div className="absolute inset-0 z-30 bg-background flex flex-col">
      {/* Header with street view */}
      <div className="relative">
        <img
          src={property.streetViewUrl}
          alt={`Street view of ${property.address}`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-black/40 text-white hover:bg-black/60"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: `${color}30`, color }}
            >
              {property.distressScore}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{property.address}</p>
              <p className="text-white/70 text-xs">{property.city}, {property.state} {property.zip}</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            <StatBox icon={DollarSign} label="Est. Value" value={`$${(property.estimatedValue / 1000).toFixed(0)}K`} />
            <StatBox icon={TrendingUp} label="ARV" value={`$${(property.arvEstimate / 1000).toFixed(0)}K`} />
            <StatBox icon={DollarSign} label="Spread" value={`$${(property.wholesaleSpread / 1000).toFixed(0)}K`} accent />
          </div>

          {/* Property details */}
          <Section title="Property Info">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <Detail icon={Home} label="Type" value={property.propertyType} />
              <Detail icon={Ruler} label="Sqft" value={`${property.sqft.toLocaleString()}`} />
              <Detail icon={Home} label="Beds/Baths" value={`${property.beds}bd / ${property.baths}ba`} />
              <Detail icon={Calendar} label="Year Built" value={`${property.yearBuilt}`} />
              <Detail icon={Ruler} label="Lot" value={`${property.lotSqft.toLocaleString()} sqft`} />
              <Detail icon={Building2} label="Zoning" value={property.zoning} />
              <Detail icon={DollarSign} label="Last Sale" value={`$${property.lastSalePrice.toLocaleString()}`} />
              <Detail icon={Calendar} label="Sale Date" value={property.lastSaleDate} />
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {property.floodZone && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-300 text-blue-700 bg-blue-50">Flood Zone</Badge>}
              {property.hoaFee && <Badge variant="outline" className="text-[10px] px-1.5 py-0">HOA ${property.hoaFee}/mo</Badge>}
              {property.permitActivity && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-300 text-green-700 bg-green-50">Permit Activity</Badge>}
            </div>
          </Section>

          {/* Owner info — gated */}
          <Section title="Owner / Skip Trace">
            {isTopPlan ? (
              <div className="space-y-1.5 text-xs">
                <Detail icon={User} label="Owner" value={property.ownerName} />
                <Detail icon={Building2} label="Type" value={property.ownerType.charAt(0).toUpperCase() + property.ownerType.slice(1)} />
                <Detail icon={MapPin} label="Mailing" value={property.mailingAddress} />
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={property.mailStatus === "deliverable" ? "default" : "destructive"}
                    className="text-[10px] px-1.5 py-0 cursor-pointer"
                    onClick={() => {
                      if (property.mailStatus === "deliverable") {
                        toast.success(`Preparing mailer to ${property.ownerName}`, { description: property.mailingAddress });
                      } else {
                        toast.error("Address not deliverable");
                      }
                    }}
                  >
                    <Mail className="h-2.5 w-2.5 mr-1" />
                    {property.mailStatus}
                  </Badge>
                  <Badge
                    variant={property.phoneAvailable ? "default" : "outline"}
                    className="text-[10px] px-1.5 py-0 cursor-pointer"
                    onClick={() => {
                      if (property.phoneAvailable) {
                        toast.success(`Calling ${property.ownerName}...`, { description: property.address });
                      } else {
                        toast.error("No phone number available");
                      }
                    }}
                  >
                    <Phone className="h-2.5 w-2.5 mr-1" />
                    {property.phoneAvailable ? "Phone found" : "No phone"}
                  </Badge>
                  <Badge
                    variant={property.emailAvailable ? "default" : "outline"}
                    className="text-[10px] px-1.5 py-0 cursor-pointer"
                    onClick={() => {
                      if (property.emailAvailable) {
                        toast.success(`Composing email to ${property.ownerName}...`, { description: property.address });
                      } else {
                        toast.error("No email available");
                      }
                    }}
                  >
                    <AtSign className="h-2.5 w-2.5 mr-1" />
                    {property.emailAvailable ? "Email found" : "No email"}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="blur-sm select-none font-medium">{property.ownerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                    <Lock className="h-2.5 w-2.5 mr-1" /> Phone Locked
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                    <Lock className="h-2.5 w-2.5 mr-1" /> Email Locked
                  </Badge>
                </div>
                <Button size="sm" className="w-full h-10 text-sm gap-2 rounded-full bg-stone-900 text-white hover:bg-stone-800" onClick={() => setShowUpgrade(true)}>
                  <Lock className="h-4 w-4" /> Unlock Homeowner Contact & Potential Buyers
                </Button>
              </div>
            )}
          </Section>

          {/* AI Overall Score Reasoning */}
          <Section title="AI Lead Score Analysis">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border">
              <Brain className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold">Distress Score: {property.distressScore}/100</span>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0" style={{ borderColor: color, color }}>
                    {getDistressLabel(property.distressScore)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{property.overallReasoning}</p>
              </div>
            </div>
          </Section>

          {/* Buyer Intelligence Panel */}
          <Section title="Buyer Interest">
            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
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
                  className="h-6 text-[10px] gap-1 mt-2 bg-primary hover:bg-primary/90"
                  onClick={() => toast.success(`Viewing ${buyerCount} matched buyers for ${property.address}`)}
                >
                  <Users className="h-3 w-3" />
                  View Matched Buyers
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] gap-1 mt-2 bg-stone-800 text-white hover:bg-stone-700 border-stone-800"
                  onClick={() => setShowUpgrade(true)}
                >
                  <Crown className="h-3 w-3" />
                  Upgrade To Connect With These Buyers
                </Button>
              )}
            </div>
          </Section>

          {/* Physical Distress - AI Reasoning */}
          <Section title="Physical Distress Analysis">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Based on Street View & Records ({property.physicalScore}/100)</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${property.physicalScore}%` }} />
              </div>
              <div className="space-y-0.5 text-xs">
                {property.overgrown && <p>🌿 Overgrown yard</p>}
                {property.boardedWindows && <p>🪟 Boarded windows</p>}
                {property.roofDamage && <p>🏚️ Roof damage</p>}
                {property.codeViolations > 0 && <p>⚠️ {property.codeViolations} violations</p>}
                {property.vacant && <p>🏠 Vacant{property.daysVacant ? ` (${property.daysVacant}d)` : ""}</p>}
                {property.waterShutoff && <p>💧 Water shutoff</p>}
              </div>
              <div className="p-2 rounded-md bg-amber-50 border border-amber-200 mt-1">
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  <span className="font-semibold">AI Analysis: </span>
                  {property.physicalReasoning}
                </p>
              </div>
            </div>
          </Section>

          {/* Financial Distress - AI Reasoning */}
          <Section title="Financial Distress Analysis">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-red-600" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Based on Public Records ({property.financialScore}/100)</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${property.financialScore}%` }} />
              </div>
              <div className="space-y-0.5 text-xs">
                {property.preForeclosure && <p>🏦 Pre-foreclosure</p>}
                {property.taxLien && <p>💰 Tax lien</p>}
                {property.probate && <p>📜 Probate</p>}
                {property.highEquity && <p>📈 {property.estimatedEquityPct}% equity</p>}
                <p>🕐 Owned {property.ownershipYears} yrs</p>
              </div>
              <div className="p-2 rounded-md bg-red-50 border border-red-200 mt-1">
                <p className="text-[11px] text-red-900 leading-relaxed">
                  <span className="font-semibold">AI Analysis: </span>
                  {property.financialReasoning}
                </p>
              </div>
            </div>
          </Section>

          {/* Deal analysis */}
          <Section title="Deal Analysis">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-muted-foreground text-[10px]">Est. Rehab</p>
                <p className="font-semibold tabular-nums">${property.estimatedRehab.toLocaleString()}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-muted-foreground text-[10px]">Equity</p>
                <p className="font-semibold tabular-nums">{property.estimatedEquityPct}%</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-muted-foreground text-[10px]">Neighborhood</p>
                <p className="font-semibold">{property.neighborhoodName}</p>
                <p className="text-[10px] text-muted-foreground">{property.neighborhoodRating}/10 rating</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <p className="text-green-700 text-[10px]">Spread</p>
                <p className="font-semibold text-green-800 tabular-nums">${property.wholesaleSpread.toLocaleString()}</p>
              </div>
            </div>
          </Section>

          {/* Actions — gated */}
          {isTopPlan ? (
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="text-xs h-8" onClick={onLocate}>
                <MapPin className="h-3 w-3 mr-1" />
                Locate On Map
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => toast.success("Adding to list...")}>
                <FileText className="h-3 w-3 mr-1" />
                Add To List
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() => {
                  if (property.phoneAvailable) {
                    toast.success(`Calling ${property.ownerName}...`, { description: property.address });
                  } else {
                    toast.error("No phone number available");
                  }
                }}
              >
                <PhoneCall className="h-3 w-3 mr-1" />
                Call Owner
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() => {
                  if (property.emailAvailable) {
                    toast.success(`Composing email to ${property.ownerName}...`, { description: property.address });
                  } else {
                    toast.error("No email available");
                  }
                }}
              >
                <MailPlus className="h-3 w-3 mr-1" />
                Email Owner
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="text-xs h-8" onClick={onLocate}>
                <MapPin className="h-3 w-3 mr-1" />
                Locate On Map
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => toast.success("Adding to list...")}>
                <FileText className="h-3 w-3 mr-1" />
                Add To List
              </Button>
              <Button
                size="sm"
                className="text-sm h-10 col-span-2 rounded-full bg-stone-900 text-white hover:bg-stone-800 gap-2"
                onClick={() => setShowUpgrade(true)}
              >
                <Lock className="h-4 w-4" />
                Unlock Homeowner Contact & Potential Buyers
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>

    <D4DUpgradeModal
      open={showUpgrade}
      onOpenChange={setShowUpgrade}
      propertyAddress={property.address}
      ownerName={property.ownerName}
      buyerCount={buyerCount}
      cityZip={`${property.city}, ${property.zip}`}
    />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</h4>
      {children}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-2 text-center ${accent ? "bg-green-50 border border-green-200" : "bg-muted/50"}`}>
      <Icon className={`h-3.5 w-3.5 mx-auto mb-0.5 ${accent ? "text-green-600" : "text-muted-foreground"}`} />
      <p className={`text-sm font-bold tabular-nums ${accent ? "text-green-700" : ""}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
