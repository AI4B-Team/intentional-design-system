import { useState } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ManualTabProps {
  onSuccess: () => void;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export function ManualTab({ onSuccess }: ManualTabProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    ownerName: "",
    phone: "",
    email: "",
    notes: "",
  });

  const { data: lists = [] } = useQuery({
    queryKey: ["lists-for-manual", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lists")
        .select("id, name")
        .eq("list_type", "manual")
        .neq("status", "archived")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!formData.state) {
      toast.error("State is required");
      return;
    }
    if (!formData.zip.trim()) {
      toast.error("ZIP code is required");
      return;
    }

    if (!selectedListId && !newListName.trim()) {
      toast.error("Please select an existing list or enter a name for a new list");
      return;
    }

    setIsSubmitting(true);

    try {
      let listId = selectedListId;

      // Create new list if needed
      if (selectedListId === "new" && newListName.trim()) {
        const { data: newList, error: listError } = await supabase
          .from("lists")
          .insert({
            name: newListName.trim(),
            list_type: "manual",
            status: "active",
            user_id: user?.id,
          })
          .select()
          .single();

        if (listError) throw listError;
        listId = newList.id;
      }

      // Normalize address for hash
      const normalizedAddress = `${formData.address} ${formData.city} ${formData.state} ${formData.zip}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Simple hash
      let hash = 0;
      for (let i = 0; i < normalizedAddress.length; i++) {
        const char = normalizedAddress.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const addressHash = Math.abs(hash).toString(16);

      // Create the record
      const { error: recordError } = await supabase.from("list_records").insert({
        list_id: listId,
        user_id: user?.id,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        owner_name: formData.ownerName || null,
        phone: formData.phone || null,
        email: formData.email || null,
        normalized_address: normalizedAddress,
        address_hash: addressHash,
        raw_data: { notes: formData.notes },
        status: "active",
        is_valid: true,
      });

      if (recordError) throw recordError;

      // Update list record count
      const { count } = await supabase
        .from("list_records")
        .select("*", { count: "exact", head: true })
        .eq("list_id", listId);

      await supabase
        .from("lists")
        .update({
          total_records: count || 1,
          unique_records: count || 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", listId);

      toast.success("Record added successfully!");

      // Reset form
      setFormData({
        address: "",
        city: "",
        state: "",
        zip: "",
        ownerName: "",
        phone: "",
        email: "",
        notes: "",
      });

      if (selectedListId === "new") {
        setSelectedListId("");
        setNewListName("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="address">
            Property Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="123 Main Street"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            placeholder="City"
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.state}
              onValueChange={(value) => handleInputChange("state", value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zip">
              ZIP <span className="text-destructive">*</span>
            </Label>
            <Input
              id="zip"
              value={formData.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              placeholder="12345"
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input
            id="ownerName"
            value={formData.ownerName}
            onChange={(e) => handleInputChange("ownerName", e.target.value)}
            placeholder="John Doe"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="(555) 123-4567"
            className="mt-1.5"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="owner@example.com"
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Any additional notes about this property..."
          className="mt-1.5"
          rows={3}
        />
      </div>

      {/* Add to List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Add to List</Label>
          <Select value={selectedListId} onValueChange={setSelectedListId}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select or create list" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New List
                </div>
              </SelectItem>
              {lists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedListId === "new" && (
          <div>
            <Label htmlFor="newListName">New List Name</Label>
            <Input
              id="newListName"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="My Manual List"
              className="mt-1.5"
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
