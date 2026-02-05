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
import { Save } from "lucide-react";

interface AddRentCompModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  onSave: (data: {
    property_id: string;
    comp_address: string;
    rent_amount: number | null;
    beds: number | null;
    baths: number | null;
    sqft: number | null;
    distance_miles: number | null;
    source: string;
    status: string;
  }) => void;
  isLoading?: boolean;
}

const SOURCES = [
  { value: "manual", label: "Manual Entry" },
  { value: "mls", label: "Active Listing" },
  { value: "rented", label: "Recently Rented" },
  { value: "user_portfolio", label: "My Portfolio" },
];

export function AddRentCompModal({
  open,
  onOpenChange,
  propertyId,
  onSave,
  isLoading,
}: AddRentCompModalProps) {
  const [formData, setFormData] = React.useState({
    comp_address: "",
    rent_amount: "",
    beds: "",
    baths: "",
    sqft: "",
    distance_miles: "",
    source: "manual",
    status: "active",
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
        comp_address: "",
        rent_amount: "",
        beds: "",
        baths: "",
        sqft: "",
        distance_miles: "",
        source: "manual",
        status: "active",
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      property_id: propertyId,
      comp_address: formData.comp_address,
      rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
      beds: formData.beds ? parseInt(formData.beds) : null,
      baths: formData.baths ? parseFloat(formData.baths) : null,
      sqft: formData.sqft ? parseInt(formData.sqft) : null,
      distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
      source: formData.source,
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Rent Comp</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input
              placeholder="123 Main St, City, ST"
              value={formData.comp_address}
              onChange={(v) => setFormData((p) => ({ ...p, comp_address: v }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly Rent *</Label>
              <Input
                type="number"
                placeholder="1500"
                value={formData.rent_amount}
                onChange={(v) => setFormData((p) => ({ ...p, rent_amount: v }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Distance (miles)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0.5"
                value={formData.distance_miles}
                onChange={(v) => setFormData((p) => ({ ...p, distance_miles: v }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Beds</Label>
              <Input
                type="number"
                placeholder="3"
                value={formData.beds}
                onChange={(v) => setFormData((p) => ({ ...p, beds: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Baths</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="2"
                value={formData.baths}
                onChange={(v) => setFormData((p) => ({ ...p, baths: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sq Ft</Label>
              <Input
                type="number"
                placeholder="1500"
                value={formData.sqft}
                onChange={(v) => setFormData((p) => ({ ...p, sqft: v }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={formData.source}
                onValueChange={(v) => setFormData((p) => ({ ...p, source: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Listing</SelectItem>
                  <SelectItem value="rented">Recently Rented</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={<Save />} disabled={isLoading}>
              Add Comp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
