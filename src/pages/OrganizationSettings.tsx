import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useUpdateOrganization, useTransferOwnership, useDeleteOrganization } from "@/hooks/useOrganizationManagement";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { 
  Building2, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Save,
  AlertTriangle,
  Upload,
  Trash2,
  UserCog
} from "lucide-react";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
];

export default function OrganizationSettings() {
  const navigate = useNavigate();
  const { organization, membership, members, canManageSettings, canManageBilling } = useOrganization();
  const { hasRole } = usePermissions();
  const updateOrganization = useUpdateOrganization();
  const transferOwnership = useTransferOwnership();
  const deleteOrganization = useDeleteOrganization();
  
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
  
  // Danger zone states
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false);
  const [transferTargetId, setTransferTargetId] = React.useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("");

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

  // Redirect if no permission
  React.useEffect(() => {
    if (!canManageSettings && membership) {
      navigate("/dashboard");
    }
  }, [canManageSettings, membership, navigate]);

  if (!organization || !canManageSettings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateOrganization.mutateAsync(formData);
    setHasChanges(false);
  };

  const handleTransferOwnership = async () => {
    if (!transferTargetId) return;
    await transferOwnership.mutateAsync(transferTargetId);
    setTransferDialogOpen(false);
    setTransferTargetId("");
  };

  const handleDeleteOrganization = async () => {
    if (deleteConfirmation !== organization.name) return;
    await deleteOrganization.mutateAsync();
    navigate("/onboarding");
  };

  const isOwner = membership?.role === "owner";
  const admins = members.filter((m) => m.role === "admin" && m.status === "active");

  return (
    <DashboardLayout>
      <div className="space-y-lg max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-h1 font-semibold text-content">Organization Settings</h1>
          <p className="text-body text-content-secondary mt-1">
            Manage your organization profile and preferences
          </p>
        </div>

        {/* Organization Profile */}
        <Card variant="default" padding="lg">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>
                  Update your company details and branding
                </CardDescription>
              </div>
              <Badge variant={organization.subscription_tier === "free" ? "secondary" : "default"}>
                {organization.subscription_tier.charAt(0).toUpperCase() + organization.subscription_tier.slice(1)} Plan
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="px-0 pb-0 space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-surface-secondary border-2 border-dashed border-border flex items-center justify-center">
                  {organization.logo_url ? (
                    <img 
                      src={organization.logo_url} 
                      alt="" 
                      className="h-full w-full object-cover rounded-xl"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-content-tertiary" />
                  )}
                </div>
                <Button variant="outline" size="sm" icon={<Upload className="h-4 w-4" />}>
                  Upload Logo
                </Button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Organization Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="pl-10"
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
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                />
              </div>

              {/* ZIP */}
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleChange("zip", e.target.value)}
                />
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={(v) => handleChange("timezone", v)}
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

            {hasChanges && (
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={updateOrganization.isPending}
                  icon={updateOrganization.isPending ? undefined : <Save className="h-4 w-4" />}
                >
                  {updateOrganization.isPending ? <Spinner size="sm" className="mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone - Owner Only */}
        {isOwner && (
          <Card variant="default" padding="lg" className="border-destructive/50">
            <CardHeader className="px-0 pt-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-0 pb-0 space-y-4">
              {/* Transfer Ownership */}
              <div className="flex items-center justify-between p-4 rounded-medium border border-border">
                <div>
                  <p className="text-small font-medium text-content">Transfer Ownership</p>
                  <p className="text-tiny text-content-secondary">
                    Transfer ownership to another admin member
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setTransferDialogOpen(true)}
                  disabled={admins.length === 0}
                >
                  <UserCog className="h-4 w-4 mr-2" />
                  Transfer
                </Button>
              </div>

              {/* Delete Organization */}
              <div className="flex items-center justify-between p-4 rounded-medium border border-destructive/50 bg-destructive/5">
                <div>
                  <p className="text-small font-medium text-content">Delete Organization</p>
                  <p className="text-tiny text-content-secondary">
                    Permanently delete this organization and all data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transfer Ownership Dialog */}
      <AlertDialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Ownership</AlertDialogTitle>
            <AlertDialogDescription>
              Select an admin to become the new owner. You will become an admin after transfer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={transferTargetId} onValueChange={setTransferTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an admin..." />
              </SelectTrigger>
              <SelectContent>
                {admins.map((admin) => (
                  <SelectItem key={admin.id} value={admin.user_id}>
                    {admin.user?.email || admin.user_id.slice(0, 12)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleTransferOwnership}
              disabled={!transferTargetId || transferOwnership.isPending}
            >
              {transferOwnership.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Transfer Ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Organization Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Organization
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data including properties, buyers, and team members will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <Label>Type <strong>{organization.name}</strong> to confirm:</Label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={organization.name}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrganization}
              disabled={deleteConfirmation !== organization.name || deleteOrganization.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteOrganization.isPending ? <Spinner size="sm" className="mr-2" /> : null}
              Delete Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
