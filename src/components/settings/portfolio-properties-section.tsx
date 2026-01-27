import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Pencil, Trash2, Home, Save } from "lucide-react";
import {
  usePortfolioProperties,
  useCreatePortfolioProperty,
  useUpdatePortfolioProperty,
  useDeletePortfolioProperty,
  type PortfolioProperty,
} from "@/hooks/useRentComps";

const PROPERTY_TYPES = [
  "Single Family",
  "Duplex",
  "Triplex",
  "Quadplex",
  "Multi-Family 5+",
  "Condo",
  "Townhouse",
];

interface PortfolioPropertyFormData {
  address: string;
  city: string;
  state: string;
  zip: string;
  monthly_rent: string;
  beds: string;
  baths: string;
  sqft: string;
  property_type: string;
  notes: string;
}

const emptyForm: PortfolioPropertyFormData = {
  address: "",
  city: "",
  state: "",
  zip: "",
  monthly_rent: "",
  beds: "",
  baths: "",
  sqft: "",
  property_type: "",
  notes: "",
};

export function PortfolioPropertiesSection() {
  const [showModal, setShowModal] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState<PortfolioProperty | null>(null);
  const [formData, setFormData] = React.useState<PortfolioPropertyFormData>(emptyForm);

  const { data: properties = [], isLoading } = usePortfolioProperties();
  const createProperty = useCreatePortfolioProperty();
  const updateProperty = useUpdatePortfolioProperty();
  const deleteProperty = useDeletePortfolioProperty();

  const handleOpenModal = (property?: PortfolioProperty) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        address: property.address,
        city: property.city || "",
        state: property.state || "",
        zip: property.zip || "",
        monthly_rent: property.monthly_rent?.toString() || "",
        beds: property.beds?.toString() || "",
        baths: property.baths?.toString() || "",
        sqft: property.sqft?.toString() || "",
        property_type: property.property_type || "",
        notes: property.notes || "",
      });
    } else {
      setEditingProperty(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      address: formData.address,
      city: formData.city || null,
      state: formData.state || null,
      zip: formData.zip || null,
      monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent) : null,
      beds: formData.beds ? parseInt(formData.beds) : null,
      baths: formData.baths ? parseFloat(formData.baths) : null,
      sqft: formData.sqft ? parseInt(formData.sqft) : null,
      property_type: formData.property_type || null,
      notes: formData.notes || null,
    };

    if (editingProperty) {
      updateProperty.mutate({ id: editingProperty.id, ...data }, {
        onSuccess: () => setShowModal(false),
      });
    } else {
      createProperty.mutate(data, {
        onSuccess: () => setShowModal(false),
      });
    }
  };

  const totalRent = properties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0);

  return (
    <>
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-h3 font-semibold flex items-center gap-2">
              <Home className="h-5 w-5 text-brand-accent" />
              Portfolio Properties
            </h3>
            <p className="text-small text-muted-foreground">
              Add properties you own to use as rent comps for new deals
            </p>
          </div>
          <Button variant="primary" icon={<Plus />} onClick={() => handleOpenModal()}>
            Add Property
          </Button>
        </div>

        {/* Summary Stats */}
        {properties.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold">{properties.length}</div>
              <div className="text-tiny text-muted-foreground">Properties</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-success">
                ${totalRent.toLocaleString()}
              </div>
              <div className="text-tiny text-muted-foreground">Monthly Rent</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold">
                ${properties.length ? Math.round(totalRent / properties.length).toLocaleString() : 0}
              </div>
              <div className="text-tiny text-muted-foreground">Avg Rent</div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon={<Home className="h-8 w-8" />}
            title="No portfolio properties"
            description="Add properties you own to use their rent data as comps"
            action={{
              label: "Add Property",
              onClick: () => handleOpenModal(),
              icon: Plus,
            }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead className="text-center">Beds/Baths</TableHead>
                <TableHead className="text-right">SqFt</TableHead>
                <TableHead>Type</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div className="font-medium">{property.address}</div>
                    <div className="text-small text-muted-foreground">
                      {property.city}, {property.state} {property.zip}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    ${property.monthly_rent?.toLocaleString() || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {property.beds || "-"}/{property.baths || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {property.sqft?.toLocaleString() || "-"}
                  </TableCell>
                  <TableCell>
                    {property.property_type && (
                      <Badge variant="outline" size="sm">
                        {property.property_type}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(property)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteProperty.mutate(property.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? "Edit Portfolio Property" : "Add Portfolio Property"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                placeholder="123 Main St"
                value={formData.address}
                onChange={(v) => setFormData((p) => ({ ...p, address: v }))}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={(v) => setFormData((p) => ({ ...p, city: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  placeholder="ST"
                  value={formData.state}
                  onChange={(v) => setFormData((p) => ({ ...p, state: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Zip</Label>
                <Input
                  placeholder="12345"
                  value={formData.zip}
                  onChange={(v) => setFormData((p) => ({ ...p, zip: v }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Rent *</Label>
                <Input
                  type="number"
                  placeholder="1500"
                  value={formData.monthly_rent}
                  onChange={(v) => setFormData((p) => ({ ...p, monthly_rent: v }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(v) => setFormData((p) => ({ ...p, property_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Beds</Label>
                <Input
                  type="number"
                  placeholder="3"
                  value={formData.beds}
                  onChange={(v) => setFormData((p) => ({ ...p, beds: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Baths</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="2"
                  value={formData.baths}
                  onChange={(v) => setFormData((p) => ({ ...p, baths: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Sq Ft</Label>
                <Input
                  type="number"
                  placeholder="1500"
                  value={formData.sqft}
                  onChange={(v) => setFormData((p) => ({ ...p, sqft: v }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Save />}
                disabled={createProperty.isPending || updateProperty.isPending}
              >
                {editingProperty ? "Update" : "Add Property"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
