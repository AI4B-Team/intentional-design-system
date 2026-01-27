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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, DollarSign } from "lucide-react";
import { useUpdateBuyer, type Buyer, type BuyBox } from "@/hooks/useBuyers";

const propertyTypes = ["SFH", "Duplex", "Triplex", "Quad", "Multi 5+", "Land", "Commercial"];
const conditionPreferences = ["Turnkey", "Light Rehab", "Heavy Rehab", "Gut Job"];
const closingTimelines = [
  { value: "1_week", label: "1 Week" },
  { value: "2_weeks", label: "2 Weeks" },
  { value: "30_days", label: "30 Days" },
  { value: "flexible", label: "Flexible" },
];

interface EditBuyerModalProps {
  buyer: Buyer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBuyerModal({ buyer, open, onOpenChange }: EditBuyerModalProps) {
  const updateBuyer = useUpdateBuyer();

  const [name, setName] = React.useState(buyer.name);
  const [company, setCompany] = React.useState(buyer.company || "");
  const [phone, setPhone] = React.useState(buyer.phone || "");
  const [email, setEmail] = React.useState(buyer.email || "");
  const [preferredContact, setPreferredContact] = React.useState(buyer.preferred_contact || "email");
  const [selectedPropertyTypes, setSelectedPropertyTypes] = React.useState<string[]>(
    buyer.buy_box.property_types || []
  );
  const [priceMin, setPriceMin] = React.useState(buyer.buy_box.price_min?.toString() || "");
  const [priceMax, setPriceMax] = React.useState(buyer.buy_box.price_max?.toString() || "");
  const [targetAreas, setTargetAreas] = React.useState<string[]>(buyer.buy_box.target_areas || []);
  const [areaInput, setAreaInput] = React.useState("");
  const [selectedConditions, setSelectedConditions] = React.useState<string[]>(
    buyer.buy_box.condition_preferences || []
  );
  const [minRoi, setMinRoi] = React.useState(buyer.buy_box.min_roi?.toString() || "");
  const [closingTimeline, setClosingTimeline] = React.useState(
    buyer.buy_box.closing_timeline || "flexible"
  );
  const [pofVerified, setPofVerified] = React.useState(buyer.pof_verified);
  const [notes, setNotes] = React.useState(buyer.notes || "");

  React.useEffect(() => {
    setName(buyer.name);
    setCompany(buyer.company || "");
    setPhone(buyer.phone || "");
    setEmail(buyer.email || "");
    setPreferredContact(buyer.preferred_contact || "email");
    setSelectedPropertyTypes(buyer.buy_box.property_types || []);
    setPriceMin(buyer.buy_box.price_min?.toString() || "");
    setPriceMax(buyer.buy_box.price_max?.toString() || "");
    setTargetAreas(buyer.buy_box.target_areas || []);
    setSelectedConditions(buyer.buy_box.condition_preferences || []);
    setMinRoi(buyer.buy_box.min_roi?.toString() || "");
    setClosingTimeline(buyer.buy_box.closing_timeline || "flexible");
    setPofVerified(buyer.pof_verified);
    setNotes(buyer.notes || "");
  }, [buyer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const buyBox: BuyBox = {
      property_types: selectedPropertyTypes,
      price_min: priceMin ? parseFloat(priceMin) : undefined,
      price_max: priceMax ? parseFloat(priceMax) : undefined,
      target_areas: targetAreas,
      condition_preferences: selectedConditions,
      min_roi: minRoi ? parseFloat(minRoi) : undefined,
      closing_timeline: closingTimeline,
    };

    await updateBuyer.mutateAsync({
      id: buyer.id,
      updates: {
        name,
        company: company || null,
        phone: phone || null,
        email: email || null,
        preferred_contact: preferredContact,
        buy_box: buyBox,
        pof_verified: pofVerified,
        notes: notes || null,
      },
    });

    onOpenChange(false);
  };

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const addTargetArea = () => {
    if (areaInput.trim() && !targetAreas.includes(areaInput.trim())) {
      setTargetAreas((prev) => [...prev, areaInput.trim()]);
      setAreaInput("");
    }
  };

  const removeTargetArea = (area: string) => {
    setTargetAreas((prev) => prev.filter((a) => a !== area));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Edit Buyer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred Contact Method</Label>
              <Select value={preferredContact} onValueChange={setPreferredContact}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="call">Phone Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Buy Box */}
          <div className="space-y-4">
            <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
              Buy Box Criteria
            </h3>

            <div className="space-y-2">
              <Label>Property Types</Label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedPropertyTypes.includes(type)}
                      onCheckedChange={() => togglePropertyType(type)}
                    />
                    <span className="text-small">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Areas</Label>
              <div className="flex gap-2">
                <Input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  placeholder="Enter zip code or city"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTargetArea();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={addTargetArea}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {targetAreas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {targetAreas.map((area) => (
                    <Badge key={area} variant="secondary" size="sm" className="gap-1">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeTargetArea(area)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Condition Preference</Label>
              <div className="flex flex-wrap gap-2">
                {conditionPreferences.map((condition) => (
                  <label key={condition} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedConditions.includes(condition)}
                      onCheckedChange={() => toggleCondition(condition)}
                    />
                    <span className="text-small">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum ROI Required (%)</Label>
                <Input
                  type="number"
                  value={minRoi}
                  onChange={(e) => setMinRoi(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Closing Timeline</Label>
                <Select value={closingTimeline} onValueChange={setClosingTimeline}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {closingTimelines.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="space-y-4">
            <h3 className="text-small font-semibold text-muted-foreground uppercase tracking-wide">
              Verification
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={pofVerified} onCheckedChange={(c) => setPofVerified(!!c)} />
              <span className="text-small">Proof of Funds Verified</span>
            </label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!name.trim() || updateBuyer.isPending}
            >
              {updateBuyer.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
