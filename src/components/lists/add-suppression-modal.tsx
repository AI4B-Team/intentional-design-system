import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddSuppressionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export function AddSuppressionModal({ open, onOpenChange }: AddSuppressionModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [neverExpires, setNeverExpires] = useState(true);

  const resetForm = () => {
    setAddress("");
    setCity("");
    setState("");
    setZip("");
    setReason("");
    setNotes("");
    setExpiresAt(undefined);
    setNeverExpires(true);
  };

  const handleSubmit = async () => {
    if (!address || !city || !state || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create normalized address hash
      const normalizedAddress = `${address.toLowerCase().trim()}-${city.toLowerCase().trim()}-${state.toLowerCase().trim()}`;
      const addressHash = btoa(normalizedAddress).replace(/[^a-zA-Z0-9]/g, "").slice(0, 32);

      const { error } = await supabase.from("suppression_list").insert({
        user_id: user?.id,
        address,
        city,
        state,
        zip: zip || null,
        reason,
        notes: notes || null,
        source: "manual",
        address_hash: addressHash,
        normalized_address: normalizedAddress,
        expires_at: neverExpires ? null : expiresAt?.toISOString(),
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This address is already in your suppression list");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Address added to suppression list");
      queryClient.invalidateQueries({ queryKey: ["suppression-list"] });
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding suppression:", error);
      toast.error("Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Suppression List</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="zip">Zip Code</Label>
            <Input
              id="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="78701"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
                <SelectItem value="wrong_number">Wrong Number</SelectItem>
                <SelectItem value="hostile">Hostile</SelectItem>
                <SelectItem value="already_sold">Already Sold</SelectItem>
                <SelectItem value="not_interested">Not Interested</SelectItem>
                <SelectItem value="returned_mail">Returned Mail</SelectItem>
                <SelectItem value="duplicate">Duplicate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="mt-1.5"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="never-expires"
                checked={neverExpires}
                onCheckedChange={(c) => setNeverExpires(!!c)}
              />
              <label htmlFor="never-expires" className="text-sm cursor-pointer">
                Never expires
              </label>
            </div>

            {!neverExpires && (
              <div>
                <Label>Expires on</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1.5",
                        !expiresAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiresAt}
                      onSelect={setExpiresAt}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Suppression List"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
