import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useBuyerProfile, 
  useCreateBuyerProfile, 
  useUpdateBuyerProfile,
  BuyerProfile 
} from "@/hooks/useBuyerProfiles";
import { useActivePOFDocuments } from "@/hooks/usePOFDocuments";
import { Save, FileText, AlertCircle } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BuyerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
}

interface FormData {
  profile_name: string;
  buyer_name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  pof_id: string;
  is_default: boolean;
  is_active: boolean;
  notes: string;
}

const initialFormData: FormData = {
  profile_name: '',
  buyer_name: '',
  company_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  pof_id: '',
  is_default: false,
  is_active: true,
  notes: '',
};

export function BuyerProfileModal({ open, onOpenChange, editId }: BuyerProfileModalProps) {
  const { data: existingProfile, isLoading: loadingProfile } = useBuyerProfile(editId || undefined);
  const { data: pofDocuments, isLoading: loadingPOF } = useActivePOFDocuments();
  const createProfile = useCreateBuyerProfile();
  const updateProfile = useUpdateBuyerProfile();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const isEditing = !!editId;
  const isLoading = loadingProfile || loadingPOF;
  const isSaving = createProfile.isPending || updateProfile.isPending;

  useEffect(() => {
    if (existingProfile && isEditing) {
      setFormData({
        profile_name: existingProfile.profile_name || '',
        buyer_name: existingProfile.buyer_name || '',
        company_name: existingProfile.company_name || '',
        email: existingProfile.email || '',
        phone: existingProfile.phone || '',
        address: existingProfile.address || '',
        city: existingProfile.city || '',
        state: existingProfile.state || '',
        zip: existingProfile.zip || '',
        pof_id: existingProfile.pof_id || '',
        is_default: existingProfile.is_default || false,
        is_active: existingProfile.is_active ?? true,
        notes: existingProfile.notes || '',
      });
    } else if (!isEditing) {
      setFormData(initialFormData);
    }
  }, [existingProfile, isEditing, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData: Partial<BuyerProfile> = {
      profile_name: formData.profile_name,
      buyer_name: formData.buyer_name,
      company_name: formData.company_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      zip: formData.zip || null,
      pof_id: formData.pof_id || null,
      is_default: formData.is_default,
      is_active: formData.is_active,
      notes: formData.notes || null,
    };

    try {
      if (isEditing && editId) {
        await updateProfile.mutateAsync({ id: editId, ...profileData });
      } else {
        await createProfile.mutateAsync(profileData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{isEditing ? 'Edit Buyer Profile' : 'Create Buyer Profile'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the buyer profile details below.' 
              : 'Create a new buyer identity for sending offer campaigns.'}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[60vh] px-6">
              <div className="space-y-6 py-4">
                {/* Profile Identification */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-content">Profile Identity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile_name">Profile Name *</Label>
                      <Input
                        id="profile_name"
                        placeholder="e.g., Main LLC, Partner Entity"
                        value={formData.profile_name}
                        onChange={(e) => updateField('profile_name', e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Internal name for this profile</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyer_name">Legal Buyer Name *</Label>
                      <Input
                        id="buyer_name"
                        placeholder="e.g., ABC Investments LLC"
                        value={formData.buyer_name}
                        onChange={(e) => updateField('buyer_name', e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Name used on offers</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      placeholder="Optional company/DBA name"
                      value={formData.company_name}
                      onChange={(e) => updateField('company_name', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-content">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="buyer@example.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="TX"
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value.toUpperCase())}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP</Label>
                      <Input
                        id="zip"
                        placeholder="12345"
                        value={formData.zip}
                        onChange={(e) => updateField('zip', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Proof of Funds */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-content">Proof of Funds</h4>
                  <div className="space-y-2">
                    <Label htmlFor="pof_id">Linked POF Document</Label>
                    <Select
                      value={formData.pof_id || 'none'}
                      onValueChange={(v) => updateField('pof_id', v === 'none' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a POF document" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No POF linked</SelectItem>
                        {pofDocuments?.map((pof) => (
                          <SelectItem key={pof.id} value={pof.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{pof.file_name}</span>
                              <span className="text-muted-foreground">
                                ${pof.amount.toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                (exp: {format(parseISO(pof.expiration_date), 'MMM d, yyyy')})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!pofDocuments?.length && (
                      <div className="flex items-center gap-2 text-sm text-warning">
                        <AlertCircle className="h-4 w-4" />
                        <span>No active POF documents. Upload one in Offer Templates.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-content">Settings</h4>
                  <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Default Profile</p>
                      <p className="text-xs text-muted-foreground">Use this profile by default for new campaigns</p>
                    </div>
                    <Switch
                      checked={formData.is_default}
                      onCheckedChange={(c) => updateField('is_default', c)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-xs text-muted-foreground">Inactive profiles won't appear in campaign options</p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(c) => updateField('is_active', c)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Optional notes about this buyer profile..."
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter className="px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<Save />} disabled={isSaving}>
                {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Profile'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
