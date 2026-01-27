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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Star } from "lucide-react";
import { useUpdateContractor, type Contractor } from "@/hooks/useContractors";
import { cn } from "@/lib/utils";

const specialtyOptions = [
  "general",
  "kitchen",
  "bath",
  "roofing",
  "hvac",
  "electrical",
  "plumbing",
  "flooring",
  "paint",
];

interface EditContractorModalProps {
  contractor: Contractor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RatingInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-tiny">{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                i <= value ? "fill-warning text-warning" : "text-muted-foreground/30 hover:text-warning/50"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function EditContractorModal({ contractor, open, onOpenChange }: EditContractorModalProps) {
  const updateContractor = useUpdateContractor();
  
  const [name, setName] = React.useState(contractor.name);
  const [company, setCompany] = React.useState(contractor.company || "");
  const [phone, setPhone] = React.useState(contractor.phone || "");
  const [email, setEmail] = React.useState(contractor.email || "");
  const [selectedSpecialties, setSelectedSpecialties] = React.useState<string[]>(contractor.specialties || []);
  const [serviceAreas, setServiceAreas] = React.useState<string[]>(contractor.service_areas || []);
  const [areaInput, setAreaInput] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState(contractor.license_number || "");
  const [licenseVerified, setLicenseVerified] = React.useState(contractor.license_verified);
  const [insuranceVerified, setInsuranceVerified] = React.useState(contractor.insurance_verified);
  const [notes, setNotes] = React.useState(contractor.notes || "");
  const [status, setStatus] = React.useState(contractor.status);
  const [qualityRating, setQualityRating] = React.useState(Number(contractor.quality_rating) || 0);
  const [reliabilityRating, setReliabilityRating] = React.useState(Number(contractor.reliability_rating) || 0);
  const [communicationRating, setCommunicationRating] = React.useState(Number(contractor.communication_rating) || 0);

  React.useEffect(() => {
    setName(contractor.name);
    setCompany(contractor.company || "");
    setPhone(contractor.phone || "");
    setEmail(contractor.email || "");
    setSelectedSpecialties(contractor.specialties || []);
    setServiceAreas(contractor.service_areas || []);
    setLicenseNumber(contractor.license_number || "");
    setLicenseVerified(contractor.license_verified);
    setInsuranceVerified(contractor.insurance_verified);
    setNotes(contractor.notes || "");
    setStatus(contractor.status);
    setQualityRating(Number(contractor.quality_rating) || 0);
    setReliabilityRating(Number(contractor.reliability_rating) || 0);
    setCommunicationRating(Number(contractor.communication_rating) || 0);
  }, [contractor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const overallRating = (qualityRating + reliabilityRating + communicationRating) / 3;
    
    await updateContractor.mutateAsync({
      id: contractor.id,
      updates: {
        name,
        company: company || null,
        phone: phone || null,
        email: email || null,
        specialties: selectedSpecialties,
        service_areas: serviceAreas,
        license_number: licenseNumber || null,
        license_verified: licenseVerified,
        insurance_verified: insuranceVerified,
        notes: notes || null,
        status,
        quality_rating: qualityRating,
        reliability_rating: reliabilityRating,
        communication_rating: communicationRating,
        overall_rating: Math.round(overallRating * 10) / 10,
      },
    });

    onOpenChange(false);
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const addServiceArea = () => {
    if (areaInput.trim() && !serviceAreas.includes(areaInput.trim())) {
      setServiceAreas(prev => [...prev, areaInput.trim()]);
      setAreaInput("");
    }
  };

  const removeServiceArea = (area: string) => {
    setServiceAreas(prev => prev.filter(a => a !== area));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Edit Contractor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label>Ratings</Label>
            <div className="grid grid-cols-3 gap-4 p-3 bg-background-secondary rounded-medium">
              <RatingInput value={qualityRating} onChange={setQualityRating} label="Quality" />
              <RatingInput value={reliabilityRating} onChange={setReliabilityRating} label="Reliability" />
              <RatingInput value={communicationRating} onChange={setCommunicationRating} label="Communication" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Specialties</Label>
            <div className="grid grid-cols-3 gap-2">
              {specialtyOptions.map((specialty) => (
                <label
                  key={specialty}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSpecialties.includes(specialty)}
                    onCheckedChange={() => toggleSpecialty(specialty)}
                  />
                  <span className="text-small capitalize">{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Service Areas</Label>
            <div className="flex gap-2">
              <Input
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                placeholder="Enter zip code or city"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addServiceArea();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addServiceArea}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {serviceAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {serviceAreas.map((area) => (
                  <Badge key={area} variant="secondary" size="sm" className="gap-1">
                    {area}
                    <button
                      type="button"
                      onClick={() => removeServiceArea(area)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <Input
                id="license"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={licenseVerified} onCheckedChange={setLicenseVerified} />
              <span className="text-small">License Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch checked={insuranceVerified} onCheckedChange={setInsuranceVerified} />
              <span className="text-small">Insurance Verified</span>
            </label>
          </div>

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
              disabled={!name.trim() || updateContractor.isPending}
            >
              {updateContractor.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
