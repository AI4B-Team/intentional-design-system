import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Home,
  DollarSign,
  ArrowRight,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickARVModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFullAnalysis?: (address: string, arv: number) => void;
}

interface CompResult {
  address: string;
  salePrice: number;
  saleDate: string;
  beds: number;
  baths: number;
  sqft: number;
  distance: number;
  pricePerSqft: number;
}

interface ARVResult {
  arvLow: number;
  arvMid: number;
  arvHigh: number;
  avgPricePerSqft: number;
  comps: CompResult[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function QuickARVModal({ open, onOpenChange, onCreateFullAnalysis }: QuickARVModalProps) {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = React.useState(false);
  const [result, setResult] = React.useState<ARVResult | null>(null);

  const [formData, setFormData] = React.useState({
    address: "",
    beds: "",
    baths: "",
    sqft: "",
  });

  const handleSearch = async () => {
    if (!formData.address) return;

    setIsSearching(true);
    setResult(null);

    // Simulate API call - in production this would call a real comps API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock data for demonstration
    const mockComps: CompResult[] = [
      {
        address: "125 Oak Lane",
        salePrice: 285000,
        saleDate: "2024-01-15",
        beds: 3,
        baths: 2,
        sqft: 1850,
        distance: 0.3,
        pricePerSqft: 154,
      },
      {
        address: "89 Maple Drive",
        salePrice: 275000,
        saleDate: "2024-01-08",
        beds: 3,
        baths: 2,
        sqft: 1780,
        distance: 0.5,
        pricePerSqft: 155,
      },
      {
        address: "342 Elm Street",
        salePrice: 295000,
        saleDate: "2023-12-20",
        beds: 4,
        baths: 2,
        sqft: 2000,
        distance: 0.7,
        pricePerSqft: 148,
      },
      {
        address: "201 Pine Court",
        salePrice: 265000,
        saleDate: "2023-12-05",
        beds: 3,
        baths: 2,
        sqft: 1720,
        distance: 0.8,
        pricePerSqft: 154,
      },
      {
        address: "567 Cedar Ave",
        salePrice: 280000,
        saleDate: "2023-11-28",
        beds: 3,
        baths: 2.5,
        sqft: 1880,
        distance: 1.1,
        pricePerSqft: 149,
      },
    ];

    const avgPrice = mockComps.reduce((sum, c) => sum + c.salePrice, 0) / mockComps.length;
    const avgPricePerSqft = mockComps.reduce((sum, c) => sum + c.pricePerSqft, 0) / mockComps.length;

    setResult({
      arvLow: Math.round(avgPrice * 0.95),
      arvMid: Math.round(avgPrice),
      arvHigh: Math.round(avgPrice * 1.05),
      avgPricePerSqft: Math.round(avgPricePerSqft),
      comps: mockComps,
    });

    setIsSearching(false);
  };

  const handleCreateAnalysis = () => {
    if (result && onCreateFullAnalysis) {
      onCreateFullAnalysis(formData.address, result.arvMid);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick ARV Lookup
          </DialogTitle>
        </DialogHeader>

        <p className="text-small text-muted-foreground mb-4">
          Get a fast comp-based value estimate for any property.
        </p>

        {/* Search Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="arv-address">Address</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="arv-address"
                className="pl-9"
                placeholder="Enter property address..."
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="arv-beds">Beds</Label>
              <Input
                id="arv-beds"
                type="number"
                value={formData.beds}
                onChange={(e) => setFormData((prev) => ({ ...prev, beds: e.target.value }))}
                placeholder="3"
              />
            </div>
            <div>
              <Label htmlFor="arv-baths">Baths</Label>
              <Input
                id="arv-baths"
                type="number"
                step="0.5"
                value={formData.baths}
                onChange={(e) => setFormData((prev) => ({ ...prev, baths: e.target.value }))}
                placeholder="2"
              />
            </div>
            <div>
              <Label htmlFor="arv-sqft">SqFt</Label>
              <Input
                id="arv-sqft"
                type="number"
                value={formData.sqft}
                onChange={(e) => setFormData((prev) => ({ ...prev, sqft: e.target.value }))}
                placeholder="1800"
              />
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!formData.address || isSearching}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding Comps...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Comps
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* ARV Range */}
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="text-center">
                <div className="text-small text-muted-foreground mb-2">Estimated ARV Range</div>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-small text-muted-foreground">
                    {formatCurrency(result.arvLow)}
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(result.arvMid)}
                  </div>
                  <div className="text-small text-muted-foreground">
                    {formatCurrency(result.arvHigh)}
                  </div>
                </div>
                <div className="text-tiny text-muted-foreground mt-2">
                  Avg ${result.avgPricePerSqft}/sqft based on {result.comps.length} comps
                </div>
              </div>
            </Card>

            {/* Comps List */}
            <div>
              <h4 className="text-small font-medium mb-3">Comparable Sales</h4>
              <div className="space-y-2">
                {result.comps.map((comp, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-surface-secondary flex items-center justify-center text-small font-medium">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-small font-medium">{comp.address}</div>
                          <div className="text-tiny text-muted-foreground">
                            {comp.beds}bd/{comp.baths}ba · {comp.sqft.toLocaleString()} sqft · {comp.distance} mi away
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-small font-semibold text-primary">
                          {formatCurrency(comp.salePrice)}
                        </div>
                        <div className="text-tiny text-muted-foreground">
                          ${comp.pricePerSqft}/sqft
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Create Analysis Button */}
            <Button onClick={handleCreateAnalysis} variant="secondary" className="w-full">
              Create Full Analysis
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
