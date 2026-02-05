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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddRepairModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (repair: { category: string; description: string; cost: number }) => void;
  editingRepair?: { category: string; description: string; cost: number; index: number } | null;
}

const repairCategories = [
  "Kitchen",
  "Bathrooms",
  "Flooring",
  "Paint",
  "Roof",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Foundation",
  "Exterior",
  "Landscaping",
  "Windows",
  "Doors",
  "Drywall",
  "Other",
];

export function AddRepairModal({ open, onOpenChange, onAdd, editingRepair }: AddRepairModalProps) {
  const [formData, setFormData] = React.useState({
    category: "Kitchen",
    description: "",
    cost: "",
  });

  React.useEffect(() => {
    if (editingRepair) {
      setFormData({
        category: editingRepair.category,
        description: editingRepair.description,
        cost: editingRepair.cost.toString(),
      });
    } else {
      setFormData({
        category: "Kitchen",
        description: "",
        cost: "",
      });
    }
  }, [editingRepair, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.cost) {
      return;
    }

    onAdd({
      category: formData.category,
      description: formData.description,
      cost: parseFloat(formData.cost) || 0,
    });

    setFormData({ category: "Kitchen", description: "", cost: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white">
        <DialogHeader>
          <DialogTitle>{editingRepair ? "Edit Repair Item" : "Add Repair Item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                {repairCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Replace countertops, cabinets, and appliances..."
              rows={3}
            />
          </div>

          {/* Cost */}
          <div>
            <Label htmlFor="cost">Estimated Cost *</Label>
            <Input
              id="cost"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="12000"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingRepair ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
