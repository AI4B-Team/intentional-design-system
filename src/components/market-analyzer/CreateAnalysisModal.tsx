import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Building2, Home, RefreshCcw, Repeat } from "lucide-react";

interface CreateAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const analysisTypes = [
  {
    value: "flip",
    label: "Flip",
    description: "Buy, renovate, sell for profit",
    icon: Home,
  },
  {
    value: "wholesale",
    label: "Wholesale",
    description: "Assign contract to end buyer",
    icon: ArrowRight,
  },
  {
    value: "brrrr",
    label: "BRRRR",
    description: "Buy, Rehab, Rent, Refinance, Repeat",
    icon: RefreshCcw,
  },
  {
    value: "buy_hold",
    label: "Buy & Hold",
    description: "Long-term rental",
    icon: Repeat,
  },
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export function CreateAnalysisModal({ open, onOpenChange }: CreateAnalysisModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [analysisType, setAnalysisType] = React.useState("flip");
  const [propertySource, setPropertySource] = React.useState<"existing" | "new">("new");
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string>("");

  const [formData, setFormData] = React.useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    beds: "",
    baths: "",
    sqft: "",
    yearBuilt: "",
    askingPrice: "",
  });

  // Fetch user's properties
  const { data: properties } = useQuery({
    queryKey: ["properties-simple", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("id, address, city, state, zip, beds, baths, sqft, year_built, estimated_value, arv")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  // Create mutation
  const createAnalysis = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      let name = formData.address;
      let property: any = null;

      if (propertySource === "existing" && selectedPropertyId) {
        property = properties?.find((p: any) => p.id === selectedPropertyId);
        if (property) {
          name = property.address;
        }
      }

      const askingPrice = formData.askingPrice ? parseFloat(formData.askingPrice.replace(/[^0-9.]/g, "")) : null;
      const propertyPrice = property?.estimated_value ?? property?.arv ?? askingPrice;

      const { data, error } = await supabase
        .from("deal_analyses")
        .insert({
          user_id: user.id,
          analysis_type: analysisType,
          name: name || "New Analysis",
          property_id: propertySource === "existing" ? selectedPropertyId : null,
          address: property?.address || formData.address,
          city: property?.city || formData.city || null,
          state: property?.state || formData.state || null,
          zip: property?.zip || formData.zip || null,
          beds: property?.beds ?? (formData.beds ? parseInt(formData.beds) : null),
          baths: property?.baths ?? (formData.baths ? parseFloat(formData.baths) : null),
          sqft: property?.sqft ?? (formData.sqft ? parseInt(formData.sqft) : null),
          year_built: property?.year_built ?? (formData.yearBuilt ? parseInt(formData.yearBuilt) : null),
          asking_price: propertyPrice,
          purchase_price: propertyPrice ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deal-analyses"] });
      toast.success("Analysis created!");
      onOpenChange(false);
      navigate(`/tools/market-analyzer/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create analysis");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (propertySource === "existing" && !selectedPropertyId) {
      toast.error("Please select a property");
      return;
    }
    if (propertySource === "new" && !formData.address) {
      toast.error("Please enter an address");
      return;
    }

    createAnalysis.mutate();
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    const property = properties?.find((p: any) => p.id === propertyId);
    if (property) {
      const price = property.estimated_value ?? property.arv ?? "";
      setFormData({
        address: property.address,
        city: property.city || "",
        state: property.state || "",
        zip: property.zip || "",
        beds: property.beds?.toString() || "",
        baths: property.baths?.toString() || "",
        sqft: property.sqft?.toString() || "",
        yearBuilt: property.year_built?.toString() || "",
        askingPrice: price?.toString() || "",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Analysis</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Analysis Type */}
          <div className="space-y-3">
            <Label>Analysis Type</Label>
            <RadioGroup value={analysisType} onValueChange={setAnalysisType} className="grid grid-cols-2 gap-3">
              {analysisTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    analysisType === type.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <RadioGroupItem value={type.value} className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-small">{type.label}</span>
                    </div>
                    <p className="text-tiny text-muted-foreground mt-0.5">{type.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Property Source */}
          <div className="space-y-3">
            <Label>Property Source</Label>
            <RadioGroup value={propertySource} onValueChange={(v) => setPropertySource(v as "existing" | "new")} className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="existing" />
                <span className="text-small">Select from my properties</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="new" />
                <span className="text-small">Enter new address</span>
              </label>
            </RadioGroup>
          </div>

          {/* Property Selector */}
          {propertySource === "existing" && (
            <div className="space-y-2">
              <Label>Select Property</Label>
              <Select value={selectedPropertyId} onValueChange={handlePropertySelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property..." />
                </SelectTrigger>
              <SelectContent>
                  {properties?.map((property: any) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address}, {property.city}, {property.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* New Address Form */}
          {propertySource === "new" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Austin"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.state} onValueChange={(v) => setFormData((prev) => ({ ...prev, state: v }))}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="TX" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zip">Zip</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value }))}
                    placeholder="78701"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Specs (Optional) */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Quick Specs (optional)</Label>
            <div className="grid grid-cols-5 gap-2">
              <div>
                <Input
                  placeholder="Beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData((prev) => ({ ...prev, beds: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  placeholder="Baths"
                  type="number"
                  step="0.5"
                  value={formData.baths}
                  onChange={(e) => setFormData((prev) => ({ ...prev, baths: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  placeholder="SqFt"
                  type="number"
                  value={formData.sqft}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sqft: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  placeholder="Year"
                  type="number"
                  value={formData.yearBuilt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, yearBuilt: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  placeholder="$Asking"
                  value={formData.askingPrice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, askingPrice: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createAnalysis.isPending}>
            {createAnalysis.isPending ? "Creating..." : "Create & Open Analysis"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
