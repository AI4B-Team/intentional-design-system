import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { PipelineStageConfig } from "./pipeline-config";

interface AddDealDialogProps {
  stage: PipelineStageConfig | null;
  open: boolean;
  onClose: () => void;
  onCreateDeal: (form: AddDealFormData) => void;
}

export interface AddDealFormData {
  address: string;
  city: string;
  state: string;
  zip: string;
  asking_price: string;
  arv: string;
  contact_name: string;
  beds: string;
  baths: string;
  sqft: string;
}

const INITIAL_FORM: AddDealFormData = {
  address: "", city: "", state: "", zip: "",
  asking_price: "", arv: "", contact_name: "",
  beds: "3", baths: "2", sqft: "1500",
};

export function AddDealDialog({ stage, open, onClose, onCreateDeal }: AddDealDialogProps) {
  const [form, setForm] = React.useState<AddDealFormData>(INITIAL_FORM);

  React.useEffect(() => {
    if (open) setForm(INITIAL_FORM);
  }, [open]);

  const update = (field: keyof AddDealFormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-brand" />
            Add New Deal
          </DialogTitle>
          <DialogDescription>
            Adding to: {stage?.label || "Pipeline"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Property Address *</label>
            <Input placeholder="123 Main Street" value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-sm font-medium">City</label><Input placeholder="Austin" value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
            <div><label className="text-sm font-medium">State</label><Input placeholder="TX" value={form.state} onChange={(e) => update("state", e.target.value)} /></div>
            <div><label className="text-sm font-medium">ZIP</label><Input placeholder="78701" value={form.zip} onChange={(e) => update("zip", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Asking Price</label><Input type="number" placeholder="250000" value={form.asking_price} onChange={(e) => update("asking_price", e.target.value)} /></div>
            <div><label className="text-sm font-medium">ARV</label><Input type="number" placeholder="300000" value={form.arv} onChange={(e) => update("arv", e.target.value)} /></div>
          </div>
          <div><label className="text-sm font-medium">Contact Name</label><Input placeholder="John Smith" value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-sm font-medium">Beds</label><Input type="number" value={form.beds} onChange={(e) => update("beds", e.target.value)} /></div>
            <div><label className="text-sm font-medium">Baths</label><Input type="number" value={form.baths} onChange={(e) => update("baths", e.target.value)} /></div>
            <div><label className="text-sm font-medium">Sqft</label><Input type="number" value={form.sqft} onChange={(e) => update("sqft", e.target.value)} /></div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onCreateDeal(form)} disabled={!form.address}>Add Deal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
