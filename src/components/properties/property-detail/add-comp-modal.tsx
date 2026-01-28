import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Trash2 } from "lucide-react";
import { useAddComp } from "@/hooks/usePropertyComps";
import { useAuth } from "@/contexts/AuthContext";

interface Adjustment {
  type: string;
  amount: number;
  reason: string;
}

interface AddCompModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

const adjustmentTypes = [
  "Location",
  "Size",
  "Condition",
  "Age",
  "Features",
  "Pool",
  "Garage",
  "Lot Size",
  "Other",
];

const ratingOptions = [
  { value: "strong", label: "Strong" },
  { value: "moderate", label: "Moderate" },
  { value: "weak", label: "Weak" },
];

export function AddCompModal({ open, onOpenChange, propertyId }: AddCompModalProps) {
  const { user } = useAuth();
  const addComp = useAddComp();
  
  const [formData, setFormData] = React.useState({
    address: "",
    salePrice: "",
    saleDate: "",
    beds: "",
    baths: "",
    sqft: "",
    distance: "",
    rating: "moderate",
  });
  
  const [adjustments, setAdjustments] = React.useState<Adjustment[]>([]);

  const resetForm = () => {
    setFormData({
      address: "",
      salePrice: "",
      saleDate: "",
      beds: "",
      baths: "",
      sqft: "",
      distance: "",
      rating: "moderate",
    });
    setAdjustments([]);
  };

  const handleAddAdjustment = () => {
    setAdjustments([...adjustments, { type: "Location", amount: 0, reason: "" }]);
  };

  const handleRemoveAdjustment = (index: number) => {
    setAdjustments(adjustments.filter((_, i) => i !== index));
  };

  const handleAdjustmentChange = (index: number, field: keyof Adjustment, value: string | number) => {
    setAdjustments(adjustments.map((adj, i) => 
      i === index ? { ...adj, [field]: value } : adj
    ));
  };

  const calculateAdjustedValue = () => {
    const basePrice = parseFloat(formData.salePrice) || 0;
    const totalAdjustments = adjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0);
    return basePrice + totalAdjustments;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address || !formData.salePrice) {
      return;
    }

    await addComp.mutateAsync({
      user_id: user!.id,
      subject_property_id: propertyId,
      address: formData.address,
      sale_price: parseFloat(formData.salePrice),
      sale_date: formData.saleDate || null,
      beds: formData.beds ? parseInt(formData.beds) : null,
      baths: formData.baths ? parseFloat(formData.baths) : null,
      sqft: formData.sqft ? parseInt(formData.sqft) : null,
      distance_miles: formData.distance ? parseFloat(formData.distance) : null,
      condition: formData.rating,
      adjustments: adjustments.length > 0 ? JSON.parse(JSON.stringify(adjustments)) : null,
      adjusted_price: calculateAdjustedValue(),
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Comparable Sale</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address */}
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street"
              required
            />
          </div>

          {/* Sale Price & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salePrice">Sale Price *</Label>
              <Input
                id="salePrice"
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                placeholder="425000"
                required
              />
            </div>
            <div>
              <Label htmlFor="saleDate">Sale Date</Label>
              <Input
                id="saleDate"
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
              />
            </div>
          </div>

          {/* Beds, Baths, SqFt */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="beds">Beds</Label>
              <Input
                id="beds"
                type="number"
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                placeholder="3"
              />
            </div>
            <div>
              <Label htmlFor="baths">Baths</Label>
              <Input
                id="baths"
                type="number"
                step="0.5"
                value={formData.baths}
                onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                placeholder="2"
              />
            </div>
            <div>
              <Label htmlFor="sqft">SqFt</Label>
              <Input
                id="sqft"
                type="number"
                value={formData.sqft}
                onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                placeholder="1850"
              />
            </div>
          </div>

          {/* Distance & Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distance">Distance (miles)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                placeholder="0.5"
              />
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={formData.rating}
                onValueChange={(v) => setFormData({ ...formData, rating: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ratingOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Adjustments Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-medium">Adjustments</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus />}
                onClick={handleAddAdjustment}
              >
                Add
              </Button>
            </div>

            {adjustments.length === 0 ? (
              <p className="text-small text-muted-foreground">
                No adjustments added. Click "Add" to include price adjustments.
              </p>
            ) : (
              <div className="space-y-3">
                {adjustments.map((adj, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-background-secondary rounded-medium">
                    <Select
                      value={adj.type}
                      onValueChange={(v) => handleAdjustmentChange(index, "type", v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {adjustmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      value={adj.amount}
                      onChange={(e) => handleAdjustmentChange(index, "amount", parseFloat(e.target.value) || 0)}
                      placeholder="+/- Amount"
                      className="w-28"
                    />

                    <Input
                      value={adj.reason}
                      onChange={(e) => handleAdjustmentChange(index, "reason", e.target.value)}
                      placeholder="Reason"
                      className="flex-1"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAdjustment(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                {/* Adjusted Value Preview */}
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-medium">
                  <span className="text-small font-medium">Adjusted Value</span>
                  <span className="text-body font-semibold tabular-nums">
                    ${calculateAdjustedValue().toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={addComp.isPending}>
              {addComp.isPending ? "Adding..." : "Add Comp"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
