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
import { X, Plus } from "lucide-react";
import { useCreateContractor } from "@/hooks/useContractors";

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

interface AddContractorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddContractorModal({ open, onOpenChange }: AddContractorModalProps) {
  const createContractor = useCreateContractor();
  
  const [name, setName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [selectedSpecialties, setSelectedSpecialties] = React.useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = React.useState<string[]>([]);
  const [areaInput, setAreaInput] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const handleReset = () => {
    setName("");
    setCompany("");
    setPhone("");
    setEmail("");
    setSelectedSpecialties([]);
    setServiceAreas([]);
    setAreaInput("");
    setLicenseNumber("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createContractor.mutateAsync({
      name,
      company: company || null,
      phone: phone || null,
      email: email || null,
      specialties: selectedSpecialties,
      service_areas: serviceAreas,
      license_number: licenseNumber || null,
      notes: notes || null,
    });

    handleReset();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Contractor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="space-y-4 overflow-y-auto px-6 pb-4 flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ABC Contracting"
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
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
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

          <div className="space-y-2">
            <Label htmlFor="license">License Number</Label>
            <Input
              id="license"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="License #"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this contractor..."
              rows={3}
            />
          </div>

          </div>
          <div className="flex justify-end gap-3 pt-4 px-6 pb-4 border-t border-border-subtle flex-shrink-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!name.trim() || createContractor.isPending}
            >
              {createContractor.isPending ? "Adding..." : "Add Contractor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
