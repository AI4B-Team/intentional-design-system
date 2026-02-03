import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Users,
  Building,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  Clock,
  Target,
  Star,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyerTransaction {
  id: string;
  address: string;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
  purchasePrice: number;
  purchaseDate: string;
  soldPrice: number | null;
  soldDate: string | null;
  holdingDays: number;
  estProfit: number | null;
  status: "sold" | "holding" | "renovating";
  propertyType: string;
  distanceFromSubject: number;
}

interface Buyer {
  id: string;
  name: string;
  company: string | null;
  type: "flipper" | "landlord";
  phone: string | null;
  email: string | null;
  totalTransactions: number;
  avgDealSize: number;
  avgProfit: number;
  avgHoldingDays: number;
  lastActiveDate: string;
  rating: number;
  transactions: BuyerTransaction[];
}

interface BuyerActivitySearchProps {
  subjectAddress: string;
  subjectCity: string;
  subjectState: string;
  subjectPrice: number;
}

// Generate mock buyer data
function generateMockBuyers(city: string, state: string): Buyer[] {
  const names = [
    { name: "Marcus Chen", company: "Chen Property Group LLC", type: "flipper" as const },
    { name: "Sarah Williams", company: "SW Holdings", type: "landlord" as const },
    { name: "Rodriguez Investment Trust", company: null, type: "flipper" as const },
    { name: "David Park", company: "Park Rentals Inc", type: "landlord" as const },
    { name: "Elite Flip Partners", company: null, type: "flipper" as const },
    { name: "Jennifer Martinez", company: "JM Real Estate Investments", type: "flipper" as const },
    { name: "Thompson Family Trust", company: null, type: "landlord" as const },
    { name: "Mike Johnson", company: "Quick Flip Properties", type: "flipper" as const },
    { name: "Coastal Rentals LLC", company: null, type: "landlord" as const },
    { name: "Amanda Foster", company: "Foster Investment Group", type: "flipper" as const },
  ];

  const streets = ["Oak St", "Maple Ave", "Pine Rd", "Cedar Ln", "Elm Dr", "Birch Way", "Walnut Blvd", "Cherry Ct"];

  return names.map((buyer, idx) => {
    const transactionCount = Math.floor(Math.random() * 15) + 3;
    const transactions: BuyerTransaction[] = [];

    for (let i = 0; i < transactionCount; i++) {
      const purchasePrice = Math.floor(Math.random() * 200000) + 150000;
      const isSold = buyer.type === "flipper" ? Math.random() > 0.2 : Math.random() > 0.7;
      const soldPrice = isSold ? Math.floor(purchasePrice * (1 + Math.random() * 0.4 + 0.1)) : null;
      const holdingDays = isSold 
        ? (buyer.type === "flipper" ? Math.floor(Math.random() * 120) + 30 : Math.floor(Math.random() * 365) + 180)
        : Math.floor(Math.random() * 90) + 10;

      transactions.push({
        id: `${buyer.name}-${i}`,
        address: `${Math.floor(Math.random() * 9000) + 1000} ${streets[Math.floor(Math.random() * streets.length)]}`,
        city,
        state,
        beds: Math.floor(Math.random() * 3) + 2,
        baths: Math.floor(Math.random() * 2) + 1.5,
        sqft: Math.floor(Math.random() * 1000) + 1200,
        purchasePrice,
        purchaseDate: new Date(Date.now() - Math.random() * 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        soldPrice,
        soldDate: isSold ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : null,
        holdingDays,
        estProfit: soldPrice ? soldPrice - purchasePrice - Math.floor(purchasePrice * 0.15) : null,
        status: isSold ? "sold" : (Math.random() > 0.5 ? "renovating" : "holding"),
        propertyType: Math.random() > 0.3 ? "Single Family" : "Townhouse",
        distanceFromSubject: Math.random() * 2,
      });
    }

    const soldTransactions = transactions.filter(t => t.status === "sold");
    const avgProfit = soldTransactions.length > 0
      ? soldTransactions.reduce((sum, t) => sum + (t.estProfit || 0), 0) / soldTransactions.length
      : 0;

    return {
      id: `buyer-${idx}`,
      name: buyer.name,
      company: buyer.company,
      type: buyer.type,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: buyer.name.toLowerCase().replace(/\s+/g, ".") + "@email.com",
      totalTransactions: transactionCount,
      avgDealSize: Math.floor(transactions.reduce((sum, t) => sum + t.purchasePrice, 0) / transactionCount),
      avgProfit: Math.round(avgProfit),
      avgHoldingDays: Math.floor(transactions.reduce((sum, t) => sum + t.holdingDays, 0) / transactionCount),
      lastActiveDate: transactions[0]?.purchaseDate || new Date().toISOString().split("T")[0],
      rating: Math.floor(Math.random() * 2) + 4,
      transactions: transactions.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()),
    };
  });
}

export function BuyerActivitySearch({
  subjectAddress,
  subjectCity,
  subjectState,
  subjectPrice,
}: BuyerActivitySearchProps) {
  const [radius, setRadius] = useState("1");
  const [timeframe, setTimeframe] = useState("180");
  const [expandedBuyer, setExpandedBuyer] = useState<string | null>(null);
  const [buyerTypeFilter, setBuyerTypeFilter] = useState<"all" | "flipper" | "landlord">("all");

  const allBuyers = useMemo(
    () => generateMockBuyers(subjectCity, subjectState),
    [subjectCity, subjectState]
  );

  // Filter buyers based on radius, timeframe, and type
  const filteredBuyers = useMemo(() => {
    const radiusMiles = parseFloat(radius);
    const timeframeDays = parseInt(timeframe);
    const cutoffDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);

    return allBuyers
      .filter(buyer => {
        // Filter by type
        if (buyerTypeFilter !== "all" && buyer.type !== buyerTypeFilter) return false;

        // Filter transactions by radius and timeframe
        const relevantTransactions = buyer.transactions.filter(t => {
          const purchaseDate = new Date(t.purchaseDate);
          return t.distanceFromSubject <= radiusMiles && purchaseDate >= cutoffDate;
        });

        return relevantTransactions.length > 0;
      })
      .map(buyer => ({
        ...buyer,
        // Update transaction list to only show relevant ones
        relevantTransactionCount: buyer.transactions.filter(t => {
          const purchaseDate = new Date(t.purchaseDate);
          return t.distanceFromSubject <= parseFloat(radius) && purchaseDate >= cutoffDate;
        }).length,
      }))
      .sort((a, b) => b.totalTransactions - a.totalTransactions);
  }, [allBuyers, radius, timeframe, buyerTypeFilter]);

  const stats = useMemo(() => {
    const flippers = filteredBuyers.filter(b => b.type === "flipper").length;
    const landlords = filteredBuyers.filter(b => b.type === "landlord").length;
    const totalDeals = filteredBuyers.reduce((sum, b) => sum + b.relevantTransactionCount, 0);
    const avgPrice = filteredBuyers.length > 0
      ? Math.round(filteredBuyers.reduce((sum, b) => sum + b.avgDealSize, 0) / filteredBuyers.length)
      : 0;

    return { flippers, landlords, totalDeals, avgPrice };
  }, [filteredBuyers]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Search Criteria</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="radius">Radius (miles)</Label>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger id="radius">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5 miles</SelectItem>
                <SelectItem value="1">1 mile</SelectItem>
                <SelectItem value="2">2 miles</SelectItem>
                <SelectItem value="3">3 miles</SelectItem>
                <SelectItem value="5">5 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="timeframe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last 12 months</SelectItem>
                <SelectItem value="730">Last 2 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyerType">Buyer Type</Label>
            <Select value={buyerTypeFilter} onValueChange={(v) => setBuyerTypeFilter(v as typeof buyerTypeFilter)}>
              <SelectTrigger id="buyerType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buyers</SelectItem>
                <SelectItem value="flipper">Flippers Only</SelectItem>
                <SelectItem value="landlord">Landlords Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{filteredBuyers.length}</p>
          <p className="text-xs text-muted-foreground">Active Buyers</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-success" />
          <p className="text-2xl font-bold">{stats.flippers}</p>
          <p className="text-xs text-muted-foreground">Flippers</p>
        </Card>
        <Card className="p-4 text-center">
          <Building className="h-5 w-5 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold">{stats.landlords}</p>
          <p className="text-xs text-muted-foreground">Landlords</p>
        </Card>
        <Card className="p-4 text-center">
          <Repeat className="h-5 w-5 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold">{stats.totalDeals}</p>
          <p className="text-xs text-muted-foreground">Transactions</p>
        </Card>
      </div>

      {/* Buyer List */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Nearby Buyers</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredBuyers.length} buyers within {radius} mi • Last {timeframe} days
          </p>
        </div>

        <div className="space-y-3">
          {filteredBuyers.map((buyer) => (
            <Collapsible
              key={buyer.id}
              open={expandedBuyer === buyer.id}
              onOpenChange={() => setExpandedBuyer(expandedBuyer === buyer.id ? null : buyer.id)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {expandedBuyer === buyer.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {buyer.type === "flipper" ? (
                          <TrendingUp className="h-5 w-5 text-success" />
                        ) : (
                          <Building className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{buyer.name}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            buyer.type === "flipper"
                              ? "border-success text-success bg-success/10"
                              : "border-blue-500 text-blue-600 bg-blue-500/10"
                          )}
                        >
                          {buyer.type === "flipper" ? "Flipper" : "Landlord"}
                        </Badge>
                        <div className="flex items-center gap-0.5">
                          {[...Array(buyer.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      {buyer.company && (
                        <p className="text-sm text-muted-foreground">{buyer.company}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold">{buyer.totalTransactions}</p>
                      <p className="text-xs text-muted-foreground">Total Deals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">${(buyer.avgDealSize / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">Avg Price</p>
                    </div>
                    {buyer.type === "flipper" && (
                      <div className="text-center">
                        <p className={cn(
                          "text-lg font-bold",
                          buyer.avgProfit > 0 ? "text-success" : "text-destructive"
                        )}>
                          ${(buyer.avgProfit / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Profit</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-lg font-bold">{buyer.avgHoldingDays}d</p>
                      <p className="text-xs text-muted-foreground">Avg Hold</p>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-14 mt-2 space-y-3 pb-4">
                  {/* Contact Info */}
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    {buyer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{buyer.phone}</span>
                      </div>
                    )}
                    {buyer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{buyer.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Last active: {new Date(buyer.lastActiveDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Transaction History</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2 font-medium">Address</th>
                            <th className="text-center p-2 font-medium">Specs</th>
                            <th className="text-right p-2 font-medium">Purchase</th>
                            <th className="text-right p-2 font-medium">Sold</th>
                            <th className="text-right p-2 font-medium">Profit</th>
                            <th className="text-center p-2 font-medium">Timeline</th>
                            <th className="text-center p-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {buyer.transactions.slice(0, 10).map((tx) => (
                            <tr key={tx.id} className="border-t">
                              <td className="p-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="font-medium">{tx.address}</span>
                                </div>
                                <p className="text-xs text-muted-foreground ml-4">
                                  {tx.city}, {tx.state} • {tx.distanceFromSubject.toFixed(1)} mi
                                </p>
                              </td>
                              <td className="p-2 text-center text-muted-foreground">
                                <span>{tx.beds}bd/{tx.baths}ba</span>
                                <span className="mx-1">•</span>
                                <span>{tx.sqft.toLocaleString()} sqft</span>
                              </td>
                              <td className="p-2 text-right">
                                <p className="font-medium">${tx.purchasePrice.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(tx.purchaseDate).toLocaleDateString()}
                                </p>
                              </td>
                              <td className="p-2 text-right">
                                {tx.soldPrice ? (
                                  <>
                                    <p className="font-medium">${tx.soldPrice.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(tx.soldDate!).toLocaleDateString()}
                                    </p>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="p-2 text-right">
                                {tx.estProfit !== null ? (
                                  <span className={cn(
                                    "font-semibold",
                                    tx.estProfit > 0 ? "text-success" : "text-destructive"
                                  )}>
                                    {tx.estProfit > 0 ? "+" : ""}${tx.estProfit.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{tx.holdingDays}d</span>
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    tx.status === "sold"
                                      ? "border-success text-success bg-success/10"
                                      : tx.status === "renovating"
                                      ? "border-amber-500 text-amber-600 bg-amber-500/10"
                                      : "border-blue-500 text-blue-600 bg-blue-500/10"
                                  )}
                                >
                                  {tx.status === "sold" ? "Sold" : tx.status === "renovating" ? "Renovating" : "Holding"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {buyer.transactions.length > 10 && (
                        <div className="p-2 bg-muted/50 text-center text-sm text-muted-foreground">
                          + {buyer.transactions.length - 10} more transactions
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" className="gap-2">
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <DollarSign className="h-4 w-4" />
                      Send Deal
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}

          {filteredBuyers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No buyers found matching your criteria</p>
              <p className="text-sm">Try expanding the radius or timeframe</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
