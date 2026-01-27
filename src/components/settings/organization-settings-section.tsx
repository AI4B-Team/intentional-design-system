import * as React from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useUpdateOrganization } from "@/hooks/useOrganizationManagement";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Building2, Globe, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
];

export function OrganizationSettingsSection() {
  const { organization, canManageBilling, membership } = useOrganization();
  const updateOrganization = useUpdateOrganization();
  
  const [formData, setFormData] = React.useState({
    name: "",
    website: "",
    phone: "",
    billing_email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    timezone: "America/New_York",
  });
  const [hasChanges, setHasChanges] = React.useState(false);

  React.useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        website: organization.website || "",
        phone: organization.phone || "",
        billing_email: organization.billing_email || "",
        address: organization.address || "",
        city: organization.city || "",
        state: organization.state || "",
        zip: organization.zip || "",
        timezone: organization.timezone || "America/New_York",
      });
    }
  }, [organization]);

  if (!organization) {
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateOrganization.mutateAsync(formData);
    setHasChanges(false);
  };

  const isOwnerOrAdmin = membership?.role === "owner" || membership?.role === "admin";

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-h2 font-semibold text-content">Organization Settings</h2>
          <p className="text-small text-content-secondary">
            Manage your company details and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={organization.subscription_tier === "free" ? "secondary" : "default"}>
            {organization.subscription_tier.charAt(0).toUpperCase() + organization.subscription_tier.slice(1)} Plan
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Company Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="pl-10"
              disabled={!isOwnerOrAdmin}
            />
          </div>
        </div>

        {/* Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://yourcompany.com"
              className="pl-10"
              disabled={!isOwnerOrAdmin}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className="pl-10"
              disabled={!isOwnerOrAdmin}
            />
          </div>
        </div>

        {/* Billing Email */}
        <div className="space-y-2">
          <Label htmlFor="billing_email">Billing Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <Input
              id="billing_email"
              type="email"
              value={formData.billing_email}
              onChange={(e) => handleChange("billing_email", e.target.value)}
              className="pl-10"
              disabled={!canManageBilling}
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Main St"
              className="pl-10"
              disabled={!isOwnerOrAdmin}
            />
          </div>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            disabled={!isOwnerOrAdmin}
          />
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            disabled={!isOwnerOrAdmin}
          />
        </div>

        {/* ZIP */}
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            value={formData.zip}
            onChange={(e) => handleChange("zip", e.target.value)}
            disabled={!isOwnerOrAdmin}
          />
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select 
            value={formData.timezone} 
            onValueChange={(v) => handleChange("timezone", v)}
            disabled={!isOwnerOrAdmin}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-content-tertiary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isOwnerOrAdmin && hasChanges && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={updateOrganization.isPending}
          >
            {updateOrganization.isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      )}

      {/* Usage Stats */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-h4 font-medium text-content mb-4">Plan Usage</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-medium bg-surface-secondary">
            <p className="text-tiny text-content-tertiary uppercase tracking-wide">Team Members</p>
            <p className="text-h2 font-semibold text-content">
              {organization.max_users} <span className="text-small font-normal text-content-secondary">max</span>
            </p>
          </div>
          <div className="p-4 rounded-medium bg-surface-secondary">
            <p className="text-tiny text-content-tertiary uppercase tracking-wide">Properties</p>
            <p className="text-h2 font-semibold text-content">
              {organization.max_properties} <span className="text-small font-normal text-content-secondary">max</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
