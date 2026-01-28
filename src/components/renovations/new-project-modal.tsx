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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";
import { Loader2, Search } from "lucide-react";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    property_id: string | null;
    description: string | null;
  }) => void;
  isSubmitting?: boolean;
}

export function NewProjectModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const organizationId = useCurrentOrganizationId();

  const { data: properties = [] } = useQuery({
    queryKey: ["properties-for-renovation", organizationId, searchQuery],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from("properties")
        .select("id, address")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (searchQuery) {
        query = query.ilike("address", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId && open,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      property_id: propertyId,
      description: description.trim() || null,
    });

    // Reset form
    setName("");
    setPropertyId(null);
    setDescription("");
    setSearchQuery("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setPropertyId(null);
      setDescription("");
      setSearchQuery("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Renovation Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Project Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="123 Main St Renovation or Flip #42 Staging"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property">Link to Property (optional)</Label>
            <Select
              value={propertyId || "none"}
              onValueChange={(value) =>
                setPropertyId(value === "none" ? null : value)
              }
            >
              <SelectTrigger id="property">
                <SelectValue placeholder="Don't link to a property" />
              </SelectTrigger>
              <SelectContent>
                <div className="flex items-center gap-2 px-2 pb-2 sticky top-0 bg-popover">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <SelectItem value="none">Don't link to a property</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Staging for marketing photos..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
