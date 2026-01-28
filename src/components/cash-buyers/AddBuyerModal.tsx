import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Loader2 } from 'lucide-react';
import { useCreateCashBuyer, useUpdateCashBuyer, CashBuyer } from '@/hooks/useCashBuyers';

interface AddBuyerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editBuyer?: CashBuyer | null;
}

const propertyTypeOptions = [
  { value: 'sfh', label: 'Single Family' },
  { value: 'multi', label: 'Multi-Family' },
  { value: 'condo', label: 'Condo/Townhouse' },
  { value: 'land', label: 'Land' },
];

const strategyOptions = [
  { value: 'flip', label: 'Flip' },
  { value: 'rental', label: 'Rental' },
  { value: 'brrrr', label: 'BRRRR' },
  { value: 'wholesale', label: 'Wholesale (daisy chain)' },
];

const conditionOptions = [
  { value: 'turnkey', label: 'Turnkey' },
  { value: 'light_rehab', label: 'Light Rehab' },
  { value: 'heavy_rehab', label: 'Heavy Rehab' },
  { value: 'gut', label: 'Gut/Tear Down' },
];

const sourceOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'networking', label: 'Networking' },
];

export function AddBuyerModal({ open, onOpenChange, editBuyer }: AddBuyerModalProps) {
  const createBuyer = useCreateCashBuyer();
  const updateBuyer = useUpdateCashBuyer();
  const isEditing = !!editBuyer;

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone: '',
    markets: [] as string[],
    zip_codes: '',
    property_types: [] as string[],
    min_price: '',
    max_price: '',
    buying_strategy: [] as string[],
    condition_preference: [] as string[],
    can_close_days: '14',
    funding_type: 'cash',
    is_verified: false,
    proof_of_funds_amount: '',
    email_opt_in: true,
    sms_opt_in: false,
    tags: [] as string[],
    notes: '',
    source: 'manual',
  });

  const [newMarket, setNewMarket] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (editBuyer) {
      setFormData({
        first_name: editBuyer.first_name || '',
        last_name: editBuyer.last_name || '',
        company_name: editBuyer.company_name || '',
        email: editBuyer.email || '',
        phone: editBuyer.phone || '',
        markets: editBuyer.markets || [],
        zip_codes: editBuyer.zip_codes?.join(', ') || '',
        property_types: editBuyer.property_types || [],
        min_price: editBuyer.min_price?.toString() || '',
        max_price: editBuyer.max_price?.toString() || '',
        buying_strategy: editBuyer.buying_strategy || [],
        condition_preference: editBuyer.condition_preference || [],
        can_close_days: editBuyer.can_close_days?.toString() || '14',
        funding_type: editBuyer.funding_type || 'cash',
        is_verified: editBuyer.is_verified || false,
        proof_of_funds_amount: editBuyer.proof_of_funds_amount?.toString() || '',
        email_opt_in: editBuyer.email_opt_in ?? true,
        sms_opt_in: editBuyer.sms_opt_in || false,
        tags: editBuyer.tags || [],
        notes: editBuyer.notes || '',
        source: editBuyer.source || 'manual',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        company_name: '',
        email: '',
        phone: '',
        markets: [],
        zip_codes: '',
        property_types: [],
        min_price: '',
        max_price: '',
        buying_strategy: [],
        condition_preference: [],
        can_close_days: '14',
        funding_type: 'cash',
        is_verified: false,
        proof_of_funds_amount: '',
        email_opt_in: true,
        sms_opt_in: false,
        tags: [],
        notes: '',
        source: 'manual',
      });
    }
  }, [editBuyer, open]);

  const toggleArrayField = (field: 'property_types' | 'buying_strategy' | 'condition_preference', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const addMarket = () => {
    if (newMarket.trim() && !formData.markets.includes(newMarket.trim())) {
      setFormData((prev) => ({
        ...prev,
        markets: [...prev.markets, newMarket.trim()],
      }));
      setNewMarket('');
    }
  };

  const removeMarket = (market: string) => {
    setFormData((prev) => ({
      ...prev,
      markets: prev.markets.filter((m) => m !== market),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      return;
    }

    const buyerData = {
      first_name: formData.first_name || null,
      last_name: formData.last_name || null,
      company_name: formData.company_name || null,
      email: formData.email,
      phone: formData.phone || null,
      markets: formData.markets.length ? formData.markets : null,
      zip_codes: formData.zip_codes
        ? formData.zip_codes.split(',').map((z) => z.trim()).filter(Boolean)
        : null,
      property_types: formData.property_types.length ? formData.property_types : null,
      min_price: formData.min_price ? parseFloat(formData.min_price) : null,
      max_price: formData.max_price ? parseFloat(formData.max_price) : null,
      buying_strategy: formData.buying_strategy.length ? formData.buying_strategy : null,
      condition_preference: formData.condition_preference.length ? formData.condition_preference : null,
      can_close_days: formData.can_close_days ? parseInt(formData.can_close_days) : null,
      funding_type: formData.funding_type,
      is_verified: formData.is_verified,
      proof_of_funds_amount: formData.proof_of_funds_amount
        ? parseFloat(formData.proof_of_funds_amount)
        : null,
      email_opt_in: formData.email_opt_in,
      sms_opt_in: formData.sms_opt_in,
      tags: formData.tags.length ? formData.tags : null,
      notes: formData.notes || null,
      source: formData.source,
    };

    try {
      if (isEditing) {
        await updateBuyer.mutateAsync({ id: editBuyer.id, updates: buyerData });
      } else {
        await createBuyer.mutateAsync(buyerData);
      }
      onOpenChange(false);
    } catch (error) {
      // Handled by mutation
    }
  };

  const isLoading = createBuyer.isPending || updateBuyer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Cash Buyer' : 'Add Cash Buyer'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Info
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company_name">Company</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Buying Criteria */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Buying Criteria
            </h3>

            <div>
              <Label>Markets</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {formData.markets.map((market) => (
                  <Badge key={market} variant="secondary" className="gap-1">
                    {market}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeMarket(market)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMarket}
                  onChange={(e) => setNewMarket(e.target.value)}
                  placeholder="Austin, TX"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMarket())}
                />
                <Button type="button" variant="outline" size="icon" onClick={addMarket}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="zip_codes">Zip Codes</Label>
              <Input
                id="zip_codes"
                value={formData.zip_codes}
                onChange={(e) => setFormData((prev) => ({ ...prev, zip_codes: e.target.value }))}
                placeholder="78701, 78702, 78703"
              />
            </div>

            <div>
              <Label>Property Types</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {propertyTypeOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.property_types.includes(opt.value)}
                      onCheckedChange={() => toggleArrayField('property_types', opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_price">Min Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="min_price"
                    type="number"
                    value={formData.min_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, min_price: e.target.value }))}
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="max_price">Max Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="max_price"
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, max_price: e.target.value }))}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Buying Strategy</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {strategyOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.buying_strategy.includes(opt.value)}
                      onCheckedChange={() => toggleArrayField('buying_strategy', opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Condition Preference</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {conditionOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.condition_preference.includes(opt.value)}
                      onCheckedChange={() => toggleArrayField('condition_preference', opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="can_close_days">Can Close In</Label>
                <Select
                  value={formData.can_close_days}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, can_close_days: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="21">21 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="45">45 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="funding_type">Funding Type</Label>
                <Select
                  value={formData.funding_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, funding_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="hard_money">Hard Money</SelectItem>
                    <SelectItem value="conventional">Conventional</SelectItem>
                    <SelectItem value="private">Private Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Verification
            </h3>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_verified"
                checked={formData.is_verified}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_verified: !!checked }))
                }
              />
              <Label htmlFor="is_verified">Verified Buyer</Label>
            </div>
            <div>
              <Label htmlFor="pof_amount">POF Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="pof_amount"
                  type="number"
                  value={formData.proof_of_funds_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, proof_of_funds_amount: e.target.value }))
                  }
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          {/* Communication */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Communication
            </h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.email_opt_in}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, email_opt_in: !!checked }))
                  }
                />
                <span className="text-sm">Email opt-in</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.sms_opt_in}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, sms_opt_in: !!checked }))
                  }
                />
                <span className="text-sm">SMS opt-in</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="vip, fast_closer..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes & Source */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, source: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !formData.email}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Save Buyer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
