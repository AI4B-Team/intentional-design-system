import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building,
  Home,
  Star,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  Sparkles,
  TrendingUp,
  MapPin,
  DollarSign,
  Hammer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyerProperty {
  address: string;
  purchasePrice: number;
  soldPrice: number;
  purchaseDate: string;
  soldDate: string;
  beds: number;
  baths: number;
  sqft: number;
  arvPercent: number;
}

interface Buyer {
  id: string;
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  type: "flipper" | "landlord";
  dealCount: number;
  avgArvPercent: number;
  avgPurchasePrice: number;
  avgPricePerSqft: number;
  matchScore: number;
  recentDeals: BuyerProperty[];
}

interface BuyerSearchProps {
  subjectAddress: string;
  subjectCity: string;
  subjectState: string;
  subjectPrice: number;
  subjectArv: number;
}

// Mock buyer data
const mockBuyers: Buyer[] = [
  {
    id: "1",
    name: "John Martinez",
    companyName: "Martinez Investments LLC",
    phone: "(555) 123-4567",
    email: "john@martinezinv.com",
    type: "flipper",
    dealCount: 24,
    avgArvPercent: 68,
    avgPurchasePrice: 175000,
    avgPricePerSqft: 95,
    matchScore: 95,
    recentDeals: [
      {
        address: "1234 Oak St, Tampa, FL",
        purchasePrice: 165000,
        soldPrice: 245000,
        purchaseDate: "2025-08-15",
        soldDate: "2025-11-20",
        beds: 3,
        baths: 2,
        sqft: 1650,
        arvPercent: 67,
      },
      {
        address: "5678 Pine Ave, Tampa, FL",
        purchasePrice: 180000,
        soldPrice: 275000,
        purchaseDate: "2025-06-10",
        soldDate: "2025-10-05",
        beds: 4,
        baths: 2,
        sqft: 1850,
        arvPercent: 65,
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Chen",
    companyName: "Sunshine Properties",
    phone: "(555) 234-5678",
    email: "sarah@sunshineprops.com",
    type: "landlord",
    dealCount: 18,
    avgArvPercent: 72,
    avgPurchasePrice: 195000,
    avgPricePerSqft: 105,
    matchScore: 88,
    recentDeals: [
      {
        address: "9012 Maple Dr, Tampa, FL",
        purchasePrice: 195000,
        soldPrice: 0, // Kept as rental
        purchaseDate: "2025-09-01",
        soldDate: "",
        beds: 3,
        baths: 2,
        sqft: 1700,
        arvPercent: 70,
      },
    ],
  },
  {
    id: "3",
    name: "Michael Thompson",
    companyName: "Flip Masters Inc",
    phone: "(555) 345-6789",
    email: "mike@flipmasters.com",
    type: "flipper",
    dealCount: 42,
    avgArvPercent: 65,
    avgPurchasePrice: 155000,
    avgPricePerSqft: 88,
    matchScore: 82,
    recentDeals: [
      {
        address: "3456 Cedar Ln, Tampa, FL",
        purchasePrice: 145000,
        soldPrice: 220000,
        purchaseDate: "2025-07-20",
        soldDate: "2025-10-15",
        beds: 3,
        baths: 1.5,
        sqft: 1450,
        arvPercent: 66,
      },
    ],
  },
  {
    id: "4",
    name: "Lisa Rodriguez",
    companyName: "Bay Area Holdings",
    phone: "(555) 456-7890",
    email: "lisa@bayareaholdings.com",
    type: "landlord",
    dealCount: 31,
    avgArvPercent: 74,
    avgPurchasePrice: 210000,
    avgPricePerSqft: 112,
    matchScore: 76,
    recentDeals: [
      {
        address: "7890 Birch St, Tampa, FL",
        purchasePrice: 205000,
        soldPrice: 0,
        purchaseDate: "2025-10-05",
        soldDate: "",
        beds: 4,
        baths: 2.5,
        sqft: 1900,
        arvPercent: 72,
      },
    ],
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "Held";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function BuyerCard({ buyer, isExpanded, onToggle }: { buyer: Buyer; isExpanded: boolean; onToggle: () => void }) {
  const profit = buyer.recentDeals[0]?.soldPrice 
    ? buyer.recentDeals[0].soldPrice - buyer.recentDeals[0].purchasePrice 
    : 0;

  return (
    <Card className={cn(
      "p-4 transition-all",
      buyer.matchScore >= 90 && "ring-2 ring-success/30 bg-success/5"
    )}>
      <div className="flex items-start justify-between gap-4">
        {/* Buyer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "p-1.5 rounded-md",
              buyer.type === "flipper" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
            )}>
              {buyer.type === "flipper" ? (
                <Hammer className="h-4 w-4" />
              ) : (
                <Building className="h-4 w-4" />
              )}
            </div>
            <span className="font-semibold truncate">{buyer.name}</span>
            {buyer.matchScore >= 90 && (
              <Badge variant="success" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Match
              </Badge>
            )}
          </div>
          {buyer.companyName && (
            <p className="text-sm text-muted-foreground truncate mb-2">
              {buyer.companyName}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              {buyer.dealCount} Deals
            </Badge>
            <span>{buyer.avgArvPercent}% Avg ARV</span>
            <span>${buyer.avgPricePerSqft}/sqft</span>
          </div>
        </div>

        {/* Match Score & Actions */}
        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "text-lg font-bold",
            buyer.matchScore >= 90 ? "text-success" 
              : buyer.matchScore >= 75 ? "text-warning" 
              : "text-muted-foreground"
          )}>
            {buyer.matchScore}%
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggle}
            className="gap-1 h-8"
          >
            {isExpanded ? "Less" : "More"}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Contact Info */}
          <div className="flex items-center gap-4 text-sm">
            {buyer.phone && (
              <a 
                href={`tel:${buyer.phone}`} 
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {buyer.phone}
              </a>
            )}
            {buyer.email && (
              <a 
                href={`mailto:${buyer.email}`}
                className="flex items-center gap-1.5 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {buyer.email}
              </a>
            )}
          </div>

          {/* Recent Deals */}
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Deals</h4>
            <div className="space-y-2">
              {buyer.recentDeals.map((deal, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {deal.address}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        deal.arvPercent <= 70 ? "border-success text-success" : "border-amber-500 text-amber-700"
                      )}
                    >
                      {deal.arvPercent}% ARV
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{deal.beds}bd • {deal.baths}ba • {deal.sqft.toLocaleString()}sqft</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(deal.purchasePrice)}
                    </span>
                    {deal.soldPrice > 0 && (
                      <span className="text-success font-medium">
                        → {formatCurrency(deal.soldPrice)} (+{formatCurrency(deal.soldPrice - deal.purchasePrice)})
                      </span>
                    )}
                    <span>{formatDate(deal.purchaseDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1">
              <Mail className="h-4 w-4" />
              Send Deal
            </Button>
            <Button size="sm" variant="outline" className="gap-1">
              <Phone className="h-4 w-4" />
              Call
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function BuyerSearch({
  subjectAddress,
  subjectCity,
  subjectState,
  subjectPrice,
  subjectArv,
}: BuyerSearchProps) {
  const [expandedBuyers, setExpandedBuyers] = React.useState<Set<string>>(new Set());

  const toggleBuyer = (id: string) => {
    setExpandedBuyers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Calculate market stats
  const avgArvPercent = Math.round(
    mockBuyers.reduce((sum, b) => sum + b.avgArvPercent, 0) / mockBuyers.length
  );
  const avgPricePerSqft = Math.round(
    mockBuyers.reduce((sum, b) => sum + b.avgPricePerSqft, 0) / mockBuyers.length
  );
  const avgPurchasePrice = Math.round(
    mockBuyers.reduce((sum, b) => sum + b.avgPurchasePrice, 0) / mockBuyers.length
  );

  // Calculate suggested purchase price based on what buyers are paying
  const suggestedPrice = Math.round(subjectArv * (avgArvPercent / 100));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Buyer Search</h2>
        </div>
        <Badge variant="secondary">{mockBuyers.length} Active Buyers</Badge>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{avgArvPercent}%</div>
          <div className="text-xs text-muted-foreground">Avg ARV Paid</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">${avgPricePerSqft}</div>
          <div className="text-xs text-muted-foreground">Avg $/SqFt</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{formatCurrency(avgPurchasePrice)}</div>
          <div className="text-xs text-muted-foreground">Avg Purchase</div>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">AI Recommendation</span>
        </div>
        <p className="text-sm text-muted-foreground mb-2">
          Based on what buyers in this area are paying, you should aim to purchase this property at:
        </p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-success">{formatCurrency(suggestedPrice)}</span>
          <Badge variant="outline" className="text-muted-foreground">
            {avgArvPercent}% of ${subjectArv.toLocaleString()} ARV
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This is {formatCurrency(subjectPrice - suggestedPrice)} below the current asking price.
        </p>
      </div>

      {/* Buyer List */}
      <div className="space-y-3">
        {mockBuyers.map((buyer) => (
          <BuyerCard
            key={buyer.id}
            buyer={buyer}
            isExpanded={expandedBuyers.has(buyer.id)}
            onToggle={() => toggleBuyer(buyer.id)}
          />
        ))}
      </div>

      {/* View All Button */}
      <Button variant="ghost" className="w-full mt-4 gap-1">
        View All Buyers
        <ChevronRight className="h-4 w-4" />
      </Button>
    </Card>
  );
}
