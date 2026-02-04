import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  MessageCircle,
  Building2,
  Home,
  Star,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  TrendingUp,
  Wallet,
  Target,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyerProfile {
  id: string;
  name: string;
  company?: string;
  phone?: string;
  email: string;
  buyerType: "flipper" | "landlord";
  rating?: number;
  dealsCompleted?: number;
  preferredAreas?: string[];
  maxPrice?: number;
  isVerified?: boolean;
  // Extended details
  minPrice?: number;
  avgCloseTime?: number;
  fundingType?: string;
  propertyTypes?: string[];
  bedsRange?: string;
  bathsRange?: string;
  sqftRange?: string;
  lastActive?: string;
  memberSince?: string;
  responseRate?: number;
  notes?: string;
  recentDeals?: { address: string; price: number; date: string }[];
}

interface BuyerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyer: BuyerProfile | null;
  onContact: (type: "call" | "sms" | "email") => void;
}

// Generate extended mock data for a buyer
function getExtendedBuyerData(buyer: BuyerProfile): BuyerProfile {
  return {
    ...buyer,
    minPrice: buyer.maxPrice ? buyer.maxPrice * 0.4 : 100000,
    avgCloseTime: Math.floor(Math.random() * 20) + 10,
    fundingType: buyer.buyerType === "flipper" ? "Hard Money / Cash" : "Cash / Private Lending",
    propertyTypes: buyer.buyerType === "flipper" 
      ? ["Single Family", "Duplex"] 
      : ["Single Family", "Multi-Family", "Apartment"],
    bedsRange: "2-4",
    bathsRange: "1-3",
    sqftRange: "1,000 - 2,500",
    lastActive: "2 hours ago",
    memberSince: "March 2023",
    responseRate: Math.floor(Math.random() * 20) + 80,
    notes: buyer.isVerified 
      ? "Reliable buyer with quick closings. Prefers off-market deals." 
      : "New buyer, still building track record.",
    recentDeals: [
      { address: "1234 Oak Street, Tampa", price: 245000, date: "Jan 15, 2026" },
      { address: "567 Palm Ave, Clearwater", price: 312000, date: "Dec 28, 2025" },
      { address: "890 Pine Road, Brandon", price: 189000, date: "Nov 12, 2025" },
    ],
  };
}

export function BuyerProfileModal({ 
  open, 
  onOpenChange, 
  buyer,
  onContact 
}: BuyerProfileModalProps) {
  if (!buyer) return null;
  
  const extendedBuyer = getExtendedBuyerData(buyer);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                {extendedBuyer.name}
                {extendedBuyer.isVerified && (
                  <Badge variant="outline" className="text-xs border-success text-success gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </DialogTitle>
              {extendedBuyer.company && (
                <p className="text-sm text-muted-foreground mt-1">{extendedBuyer.company}</p>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                extendedBuyer.buyerType === "flipper"
                  ? "border-primary text-primary bg-primary/10"
                  : "border-warning text-warning bg-warning/10"
              )}
            >
              {extendedBuyer.buyerType === "flipper" ? (
                <><Home className="h-3 w-3 mr-1" /> Flipper</>
              ) : (
                <><Building2 className="h-3 w-3 mr-1" /> Landlord</>
              )}
            </Badge>
          </div>
        </DialogHeader>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-warning mb-1">
              <Star className="h-4 w-4 fill-warning" />
              <span className="font-bold text-lg">{extendedBuyer.rating || "N/A"}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="font-bold text-lg text-foreground">{extendedBuyer.dealsCompleted || 0}</div>
            <p className="text-xs text-muted-foreground">Deals Closed</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="font-bold text-lg text-foreground">{extendedBuyer.avgCloseTime}d</div>
            <p className="text-xs text-muted-foreground">Avg Close</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="font-bold text-lg text-foreground">{extendedBuyer.responseRate}%</div>
            <p className="text-xs text-muted-foreground">Response Rate</p>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => onContact("call")}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => onContact("sms")}
          >
            <MessageCircle className="h-4 w-4" />
            <Sparkles className="h-3 w-3 text-primary" />
            SMS
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={() => onContact("email")}
          >
            <Mail className="h-4 w-4" />
            <Sparkles className="h-3 w-3 text-primary" />
            Email
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{extendedBuyer.phone || "Not provided"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{extendedBuyer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Last active: {extendedBuyer.lastActive}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Member since: {extendedBuyer.memberSince}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Buy Box / Preferences */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Buy Box Criteria</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Price Range</p>
                  <p className="text-xs text-muted-foreground">
                    ${((extendedBuyer.minPrice || 0) / 1000).toFixed(0)}k - ${((extendedBuyer.maxPrice || 0) / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Preferred Areas</p>
                  <p className="text-xs text-muted-foreground">
                    {extendedBuyer.preferredAreas?.join(", ") || "Any"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Property Types</p>
                  <p className="text-xs text-muted-foreground">
                    {extendedBuyer.propertyTypes?.join(", ")}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Size Preferences</p>
                  <p className="text-xs text-muted-foreground">
                    {extendedBuyer.bedsRange} beds • {extendedBuyer.bathsRange} baths
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {extendedBuyer.sqftRange} sqft
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Funding Type</p>
                  <p className="text-xs text-muted-foreground">{extendedBuyer.fundingType}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Strategy</p>
                  <p className="text-xs text-muted-foreground">
                    {extendedBuyer.buyerType === "flipper" ? "Fix & Flip" : "Buy & Hold"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Notes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Notes</h3>
          </div>
          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            {extendedBuyer.notes}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Recent Deals */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Recent Deals</h3>
          <div className="space-y-2">
            {extendedBuyer.recentDeals?.map((deal, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{deal.address}</p>
                  <p className="text-xs text-muted-foreground">{deal.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">
                    ${deal.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
