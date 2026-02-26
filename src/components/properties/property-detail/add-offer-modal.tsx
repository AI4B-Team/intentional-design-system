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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddOffer } from "@/hooks/usePropertyMutations";
import { useProperty } from "@/hooks/useProperty";
import { format } from "date-fns";

interface AddOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

const offerTypes = [
  { value: "opening", label: "Opening Offer" },
  { value: "counter", label: "Counter Offer" },
  { value: "final", label: "Final Offer" },
];

const sendViaOptions = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "mail", label: "Mail" },
  { value: "in_person", label: "In Person" },
  { value: "phone", label: "Phone" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
}

export function AddOfferModal({ open, onOpenChange, propertyId }: AddOfferModalProps) {
  const addOffer = useAddOffer();
  const { data: property } = useProperty(propertyId);

  const [formData, setFormData] = React.useState({
    offerAmount: "",
    offerType: "opening",
    sentVia: "email",
    sentDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    generateLetter: false,
  });

  const resetForm = () => {
    setFormData({
      offerAmount: "",
      offerType: "opening",
      sentVia: "email",
      sentDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
      generateLetter: false,
    });
  };

  const handleQuickAmount = (amount: number) => {
    setFormData({ ...formData, offerAmount: amount.toString() });
  };

  const handleSubmit = async (e: React.FormEvent, markAsSent: boolean) => {
    e.preventDefault();

    if (!formData.offerAmount) return;

    await addOffer.mutateAsync({
      property_id: propertyId,
      offer_amount: parseFloat(formData.offerAmount),
      offer_type: formData.offerType,
      sent_via: formData.sentVia,
      sent_date: markAsSent ? new Date(formData.sentDate).toISOString() : null,
      notes: formData.notes || null,
      response: "pending",
    });

    resetForm();
    onOpenChange(false);
  };

  const maoAggressive = property?.mao_aggressive ? Number(property.mao_aggressive) : null;
  const maoStandard = property?.mao_standard ? Number(property.mao_standard) : null;
  const maoConservative = property?.mao_conservative ? Number(property.mao_conservative) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>New Offer</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => handleSubmit(e, true)} className="px-6 py-4 space-y-4">
          {/* Offer Amount */}
          <div>
            <Label htmlFor="offerAmount">Offer Amount *</Label>
            <Input
              id="offerAmount"
              type="number"
              value={formData.offerAmount}
              onChange={(e) => setFormData({ ...formData, offerAmount: e.target.value })}
              placeholder="285000"
              required
              className="text-lg font-semibold"
            />
            
            {/* Quick MAO Buttons */}
            {(maoAggressive || maoStandard || maoConservative) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {maoAggressive && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(maoAggressive)}
                    className="text-xs"
                  >
                    Aggressive: {formatCurrency(maoAggressive)}
                  </Button>
                )}
                {maoStandard && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(maoStandard)}
                    className="text-xs"
                  >
                    Standard: {formatCurrency(maoStandard)}
                  </Button>
                )}
                {maoConservative && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount(maoConservative)}
                    className="text-xs"
                  >
                    Conservative: {formatCurrency(maoConservative)}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Offer Type & Send Via */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Offer Type</Label>
              <Select
                value={formData.offerType}
                onValueChange={(v) => setFormData({ ...formData, offerType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {offerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Send Via</Label>
              <Select
                value={formData.sentVia}
                onValueChange={(v) => setFormData({ ...formData, sentVia: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {sendViaOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sent Date */}
          <div>
            <Label htmlFor="sentDate">Sent Date</Label>
            <Input
              id="sentDate"
              type="date"
              value={formData.sentDate}
              onChange={(e) => setFormData({ ...formData, sentDate: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Terms, conditions, contingencies..."
              rows={3}
            />
          </div>

          {/* Generate Letter Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="generateLetter"
              checked={formData.generateLetter}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, generateLetter: checked === true })
              }
            />
            <Label htmlFor="generateLetter" className="text-small font-normal cursor-pointer">
              Generate Offer Letter
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleSubmit(e, false)}
              disabled={addOffer.isPending}
            >
              Save as Draft
            </Button>
            <Button type="submit" variant="primary" disabled={addOffer.isPending}>
              {addOffer.isPending ? "Saving..." : "Save & Mark Sent"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
