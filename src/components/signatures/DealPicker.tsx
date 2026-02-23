import * as React from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, DollarSign, User, CheckCircle, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export interface DealData {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  estimatedValue: number | null;
  askingPrice: number | null;
  arv: number | null;
  repairEstimate: number | null;
  earnestMoney: number | null;
  status: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  yearBuilt: number | null;
  propertyType: string | null;
}

interface DealPickerProps {
  onSelect: (deal: DealData) => void;
  selectedDealId?: string;
}

export function DealPicker({ onSelect, selectedDealId }: DealPickerProps) {
  const [query, setQuery] = React.useState("");
  const [deals, setDeals] = React.useState<DealData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  const searchDeals = React.useCallback(async (searchText: string) => {
    if (!searchText.trim()) {
      setDeals([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, zip, owner_name, owner_email, owner_phone, estimated_value, arv, repair_estimate, status, beds, baths, sqft, year_built, property_type, asking_price, earnest_money")
        .or(`address.ilike.%${searchText}%,city.ilike.%${searchText}%,owner_name.ilike.%${searchText}%`)
        .limit(10);

      if (error) throw error;

      setDeals(
        (data || []).map((p: any) => ({
          id: p.id,
          address: p.address || "",
          city: p.city || "",
          state: p.state || "",
          zip: p.zip || "",
          ownerName: p.owner_name || "",
          ownerEmail: p.owner_email || "",
          ownerPhone: p.owner_phone || "",
          estimatedValue: p.estimated_value,
          askingPrice: p.asking_price,
          arv: p.arv,
          repairEstimate: p.repair_estimate,
          earnestMoney: p.earnest_money,
          status: p.status || "new",
          beds: p.beds,
          baths: p.baths,
          sqft: p.sqft,
          yearBuilt: p.year_built,
          propertyType: p.property_type,
        }))
      );
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => searchDeals(query), 300);
    return () => clearTimeout(timeout);
  }, [query, searchDeals]);

  const formatCurrency = (val: number | null) =>
    val ? `$${val.toLocaleString()}` : "—";

  const statusColors: Record<string, string> = {
    new: "bg-muted text-muted-foreground",
    contacted: "bg-blue-100 text-blue-700",
    follow_up: "bg-amber-100 text-amber-700",
    negotiating: "bg-purple-100 text-purple-700",
    offer_made: "bg-brand/10 text-brand",
    under_contract: "bg-success/10 text-success",
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by address, city, or owner name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && deals.length > 0 && (
        <div className="space-y-2 max-h-[360px] overflow-y-auto">
          {deals.map((deal) => (
            <Card
              key={deal.id}
              padding="md"
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedDealId === deal.id && "ring-2 ring-brand"
              )}
              onClick={() => onSelect(deal)}
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{deal.address}</p>
                    {selectedDealId === deal.id && (
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {deal.city}, {deal.state} {deal.zip}
                    </span>
                    {deal.ownerName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {deal.ownerName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(deal.estimatedValue || deal.arv)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className={cn("text-[10px] h-5 capitalize", statusColors[deal.status] || "")}>
                      {deal.status?.replace(/_/g, " ")}
                    </Badge>
                    {deal.propertyType && (
                      <Badge variant="outline" className="text-[10px] h-5 capitalize">
                        {deal.propertyType}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && hasSearched && deals.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
          No properties found matching "{query}"
        </div>
      )}

      {!loading && !hasSearched && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Search your pipeline to auto-fill deal data
        </div>
      )}
    </div>
  );
}

/** Map a DealData to template variable values */
export function dealToVariables(deal: DealData): Record<string, string> {
  return {
    property_address: [deal.address, deal.city, deal.state, deal.zip].filter(Boolean).join(", "),
    seller_name: deal.ownerName,
    seller_email: deal.ownerEmail,
    seller_phone: deal.ownerPhone,
    purchase_price: deal.askingPrice ? `$${deal.askingPrice.toLocaleString()}` : "",
    arv: deal.arv ? `$${deal.arv.toLocaleString()}` : "",
    repair_estimate: deal.repairEstimate ? `$${deal.repairEstimate.toLocaleString()}` : "",
    earnest_money: deal.earnestMoney ? `$${deal.earnestMoney.toLocaleString()}` : "",
    year_built: deal.yearBuilt?.toString() || "",
    beds: deal.beds?.toString() || "",
    baths: deal.baths?.toString() || "",
    sqft: deal.sqft?.toString() || "",
    property_type: deal.propertyType || "",
    closing_date: "",
  };
}
