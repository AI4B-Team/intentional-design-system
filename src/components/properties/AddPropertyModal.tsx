import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const propertySchema = z.object({
  address: z.string().min(1, "Address is required").max(255),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zip: z.string().max(20).optional(),
  property_type: z.string().optional(),
  beds: z.coerce.number().min(0).optional().or(z.literal("")),
  baths: z.coerce.number().min(0).optional().or(z.literal("")),
  sqft: z.coerce.number().min(0).optional().or(z.literal("")),
  year_built: z.coerce.number().min(1800).max(new Date().getFullYear()).optional().or(z.literal("")),
  owner_name: z.string().max(100).optional(),
  owner_phone: z.string().max(20).optional(),
  owner_email: z.string().email("Invalid email").optional().or(z.literal("")),
  source: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormDefaults {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type?: string;
  beds?: string | number;
  baths?: string | number;
  sqft?: string | number;
  year_built?: string | number;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  source?: string;
  notes?: string;
}

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues?: PropertyFormDefaults;
}

const propertyTypes = [
  { value: "sfh", label: "Single Family" },
  { value: "duplex", label: "Duplex" },
  { value: "triplex", label: "Triplex" },
  { value: "quadplex", label: "Quadplex" },
  { value: "multi", label: "Multi-Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

const sources = [
  { value: "d4d", label: "Driving for Dollars" },
  { value: "direct_mail", label: "Direct Mail" },
  { value: "cold_call", label: "Cold Call" },
  { value: "agent", label: "Agent" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "marketing", label: "Marketing" },
  { value: "referral", label: "Referral" },
  { value: "seller_calls_in", label: "Seller Calls In" },
  { value: "other", label: "Other" },
];

export function AddPropertyModal({ isOpen, onClose, initialValues }: AddPropertyModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [saveAndAddAnother, setSaveAndAddAnother] = React.useState(false);

  const defaultValues = React.useMemo((): PropertyFormData => ({
    address: initialValues?.address || "",
    city: initialValues?.city || "",
    state: initialValues?.state || "",
    zip: initialValues?.zip || "",
    property_type: initialValues?.property_type || "",
    beds: initialValues?.beds ? Number(initialValues.beds) : "",
    baths: initialValues?.baths ? Number(initialValues.baths) : "",
    sqft: initialValues?.sqft ? Number(initialValues.sqft) : "",
    year_built: initialValues?.year_built ? Number(initialValues.year_built) : "",
    owner_name: initialValues?.owner_name || "",
    owner_phone: initialValues?.owner_phone || "",
    owner_email: initialValues?.owner_email || "",
    source: initialValues?.source || "",
    notes: initialValues?.notes || "",
  }), [initialValues]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });

  // Reset form when initialValues change
  React.useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, defaultValues, reset]);

  const onSubmit = async (data: PropertyFormData, addAnother: boolean = false) => {
    setIsSubmitting(true);
    setSaveAndAddAnother(addAnother);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const propertyData = {
        user_id: userData.user.id,
        address: data.address,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        property_type: data.property_type || null,
        beds: data.beds ? Number(data.beds) : null,
        baths: data.baths ? Number(data.baths) : null,
        sqft: data.sqft ? Number(data.sqft) : null,
        year_built: data.year_built ? Number(data.year_built) : null,
        owner_name: data.owner_name || null,
        owner_phone: data.owner_phone || null,
        owner_email: data.owner_email || null,
        source: data.source || null,
        notes: data.notes || null,
        status: "new",
        motivation_score: 0,
      };

      const { error } = await supabase.from("properties").insert(propertyData);

      if (error) throw error;

      toast.success("Property added successfully");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      
      if (addAnother) {
        reset();
      } else {
        onClose();
        reset();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Property"
      description="Enter property details to add to your pipeline"
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={isSubmitting}
          >
            {isSubmitting && saveAndAddAnother ? <Spinner size="sm" className="mr-2" /> : null}
            Save & Add Another
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={isSubmitting}
          >
            {isSubmitting && !saveAndAddAnother ? <Spinner size="sm" className="mr-2" /> : null}
            Save Property
          </Button>
        </div>
      }
    >
      <form className="space-y-4">
        {/* Address Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="123 Main Street"
              error={errors.address?.message}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} placeholder="City" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} placeholder="TX" />
            </div>
            <div>
              <Label htmlFor="zip">Zip</Label>
              <Input id="zip" {...register("zip")} placeholder="75001" />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="property_type">Property Type</Label>
            <Select
              value={watch("property_type") || ""}
              onValueChange={(value) => setValue("property_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Select
              value={watch("source") || ""}
              onValueChange={(value) => setValue("source", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label htmlFor="beds">Beds</Label>
            <Input
              id="beds"
              type="number"
              {...register("beds")}
              placeholder="3"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="baths">Baths</Label>
            <Input
              id="baths"
              type="number"
              step="0.5"
              {...register("baths")}
              placeholder="2"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="sqft">Sq Ft</Label>
            <Input
              id="sqft"
              type="number"
              {...register("sqft")}
              placeholder="1500"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="year_built">Year Built</Label>
            <Input
              id="year_built"
              type="number"
              {...register("year_built")}
              placeholder="1990"
              min="1800"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        {/* Owner Info */}
        <div className="pt-2 border-t border-border-subtle">
          <h4 className="text-small font-medium text-muted-foreground mb-3">Owner Information</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="owner_name">Name</Label>
              <Input id="owner_name" {...register("owner_name")} placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="owner_phone">Phone</Label>
              <Input id="owner_phone" {...register("owner_phone")} placeholder="(555) 123-4567" />
            </div>
            <div>
              <Label htmlFor="owner_email">Email</Label>
              <Input
                id="owner_email"
                type="email"
                {...register("owner_email")}
                placeholder="owner@email.com"
                error={errors.owner_email?.message}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Add any notes about this property..."
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
