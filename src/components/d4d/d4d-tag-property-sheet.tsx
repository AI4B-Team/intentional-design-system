import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Camera, 
  Mic, 
  Check, 
  Loader2,
  AlertTriangle,
  Home,
  Eye,
  Flame,
  Star
} from "lucide-react";
import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizationContext } from "@/hooks/useOrganizationId";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface D4DTagPropertySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  sessionId: string;
  onSave: () => void;
}

const conditionOptions = [
  { id: 'distressed', label: 'Distressed', icon: AlertTriangle, color: 'text-orange-500' },
  { id: 'vacant', label: 'Vacant', icon: Home, color: 'text-purple-500' },
  { id: 'check-later', label: 'Check Later', icon: Eye, color: 'text-blue-500' },
  { id: 'hot-lead', label: 'Hot Lead', icon: Flame, color: 'text-red-500' },
];

const observationOptions = [
  { id: 'has_overgrown_lawn', label: 'Overgrown Lawn' },
  { id: 'has_mail_pileup', label: 'Mail Pileup' },
  { id: 'has_boarded_windows', label: 'Boarded' },
  { id: 'has_roof_damage', label: 'Roof Damage' },
  { id: 'has_peeling_paint', label: 'Peeling Paint' },
  { id: 'has_for_sale_sign', label: 'For Sale Sign' },
  { id: 'has_notice_on_door', label: 'Notice on Door' },
  { id: 'has_broken_windows', label: 'Broken Windows' },
];

export function D4DTagPropertySheet({
  open,
  onOpenChange,
  currentLocation,
  sessionId,
  onSave
}: D4DTagPropertySheetProps) {
  const { user } = useAuth();
  const { organizationId } = useOrganizationContext();
  const { reverseGeocode, loading: geocodeLoading } = useReverseGeocode();

  const [address, setAddress] = useState<string | null>(null);
  const [addressComponents, setAddressComponents] = useState<{
    streetNumber: string;
    streetName: string;
    city: string;
    state: string;
    zip: string;
    county: string;
  } | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [priority, setPriority] = useState(3);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Get address when sheet opens
  useEffect(() => {
    if (open && currentLocation.latitude && currentLocation.longitude) {
      reverseGeocode(currentLocation.latitude, currentLocation.longitude).then((result) => {
        if (result) {
          setAddress(result.formattedAddress);
          setAddressComponents({
            streetNumber: result.streetNumber,
            streetName: result.streetName,
            city: result.city,
            state: result.state,
            zip: result.zip,
            county: result.county,
          });
        }
      });
    }
  }, [open, currentLocation.latitude, currentLocation.longitude, reverseGeocode]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setSelectedCondition(null);
      setSelectedObservations([]);
      setPriority(3);
      setNotes("");
      setAddress(null);
      setAddressComponents(null);
    }
  }, [open]);

  const toggleObservation = useCallback((id: string) => {
    setSelectedObservations(prev => 
      prev.includes(id) 
        ? prev.filter(o => o !== id)
        : [...prev, id]
    );
  }, []);

  const handleSave = async () => {
    if (!user || !currentLocation.latitude || !currentLocation.longitude) {
      toast.error("Unable to save - missing location data");
      return;
    }

    setSaving(true);

    try {
      // Build observation flags
      const observations: Record<string, boolean> = {};
      observationOptions.forEach(opt => {
        observations[opt.id] = selectedObservations.includes(opt.id);
      });

      // Map condition to DB value
      const conditionMap: Record<string, string> = {
        'distressed': 'distressed',
        'vacant': 'vacant',
        'check-later': 'fair',
        'hot-lead': 'poor'
      };

      const propertyData = {
        user_id: user.id,
        organization_id: organizationId,
        session_id: sessionId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: addressComponents ? `${addressComponents.streetNumber} ${addressComponents.streetName}` : null,
        street_number: addressComponents?.streetNumber || null,
        street_name: addressComponents?.streetName || null,
        city: addressComponents?.city || null,
        state: addressComponents?.state || null,
        zip: addressComponents?.zip || null,
        county: addressComponents?.county || null,
        formatted_address: address,
        condition: selectedCondition ? conditionMap[selectedCondition] || null : null,
        priority,
        written_notes: notes || null,
        ...observations,
        tagged_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('d4d_properties')
        .insert(propertyData);

      if (error) throw error;

      toast.success("Property tagged!");
      onSave();
    } catch (error) {
      console.error("Failed to save property:", error);
      toast.error("Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl px-4 pb-safe">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left">Tag Property</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(85vh-180px)] pb-4">
          {/* Address */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {geocodeLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Getting address...</span>
                </div>
              ) : address ? (
                <p className="text-sm font-medium">{address}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {currentLocation.latitude?.toFixed(6)}, {currentLocation.longitude?.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Quick Condition */}
          <div>
            <p className="text-sm font-medium mb-3">Condition</p>
            <div className="grid grid-cols-2 gap-2">
              {conditionOptions.map((option) => (
                <button
                  key={option.id}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    "active:scale-[0.98]",
                    selectedCondition === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                  onClick={() => setSelectedCondition(
                    selectedCondition === option.id ? null : option.id
                  )}
                >
                  <option.icon className={cn("h-5 w-5", option.color)} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div>
            <p className="text-sm font-medium mb-3">Observations</p>
            <div className="flex flex-wrap gap-2">
              {observationOptions.map((option) => (
                <Badge
                  key={option.id}
                  variant={selectedObservations.includes(option.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all py-1.5 px-3",
                    "active:scale-[0.98]",
                    selectedObservations.includes(option.id) && "bg-primary"
                  )}
                  onClick={() => toggleObservation(option.id)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-sm font-medium mb-3">Priority</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="p-1"
                  onClick={() => setPriority(star)}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= priority
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {priority === 1 ? "Hot Lead" : 
               priority === 2 ? "High Priority" :
               priority === 3 ? "Medium" :
               priority === 4 ? "Low Priority" : "Check Later"}
            </p>
          </div>

          {/* Quick Notes */}
          <div>
            <p className="text-sm font-medium mb-3">Notes (optional)</p>
            <Textarea
              placeholder="Quick notes about this property..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2">
              <Camera className="h-4 w-4" />
              Add Photo
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Mic className="h-4 w-4" />
              Voice Note
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe bg-background border-t">
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Save & Continue
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
