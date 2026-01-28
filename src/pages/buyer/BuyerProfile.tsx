import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Upload,
  Building,
} from 'lucide-react';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
];

export default function BuyerProfile() {
  const navigate = useNavigate();
  const { buyer, refreshBuyer, isAuthenticated } = useBuyerAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone: '',
    markets: [] as string[],
    property_types: [] as string[],
    min_price: '',
    max_price: '',
    buying_strategy: [] as string[],
    funding_type: 'cash',
    can_close_days: '14',
    email_opt_in: true,
    sms_opt_in: false,
  });

  const [newMarket, setNewMarket] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/buyer/login');
      return;
    }

    if (buyer) {
      setFormData({
        first_name: buyer.first_name || '',
        last_name: buyer.last_name || '',
        company_name: buyer.company_name || '',
        email: buyer.email || '',
        phone: buyer.phone || '',
        markets: buyer.markets || [],
        property_types: buyer.property_types || [],
        min_price: buyer.min_price?.toString() || '',
        max_price: buyer.max_price?.toString() || '',
        buying_strategy: buyer.buying_strategy || [],
        funding_type: buyer.funding_type || 'cash',
        can_close_days: buyer.can_close_days?.toString() || '14',
        email_opt_in: buyer.email_opt_in ?? true,
        sms_opt_in: buyer.sms_opt_in || false,
      });
    }
  }, [buyer, isAuthenticated, navigate]);

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

  const toggleArrayField = (field: 'property_types' | 'buying_strategy', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSave = async () => {
    if (!buyer?.id) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('cash_buyers')
        .update({
          first_name: formData.first_name || null,
          last_name: formData.last_name || null,
          full_name: `${formData.first_name} ${formData.last_name}`.trim() || null,
          company_name: formData.company_name || null,
          phone: formData.phone || null,
          markets: formData.markets.length ? formData.markets : null,
          property_types: formData.property_types.length ? formData.property_types : null,
          min_price: formData.min_price ? parseFloat(formData.min_price) : null,
          max_price: formData.max_price ? parseFloat(formData.max_price) : null,
          buying_strategy: formData.buying_strategy.length ? formData.buying_strategy : null,
          funding_type: formData.funding_type,
          can_close_days: parseInt(formData.can_close_days),
          email_opt_in: formData.email_opt_in,
          sms_opt_in: formData.sms_opt_in,
          updated_at: new Date().toISOString(),
        })
        .eq('id', buyer.id);

      if (error) throw error;

      await refreshBuyer();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!buyer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/buyer/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Your Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
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
          </CardContent>
        </Card>

        {/* Buying Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Buying Criteria</CardTitle>
            <CardDescription>
              Update your criteria to get matched with relevant deals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Markets</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {formData.markets.map((market) => (
                  <Badge key={market} variant="secondary" className="gap-1">
                    {market}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeMarket(market)} />
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

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="can_close_days">Closing Speed</Label>
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
                    <SelectItem value="45">45+ days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proof of Funds */}
        <Card>
          <CardHeader>
            <CardTitle>Proof of Funds</CardTitle>
            <CardDescription>
              Verified buyers get access to all deal documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {buyer.is_verified ? (
                <>
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-green-600">Verified</p>
                    <p className="text-sm text-muted-foreground">
                      POF: ${buyer.proof_of_funds_amount?.toLocaleString() || 'N/A'}
                      {buyer.verified_at && (
                        <> • Verified {new Date(buyer.verified_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-muted rounded-full">
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Not Verified</p>
                    <p className="text-sm text-muted-foreground">
                      Upload proof of funds to access all deal documents
                    </p>
                  </div>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload POF
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <Checkbox
                checked={formData.email_opt_in}
                onCheckedChange={(c) => setFormData((prev) => ({ ...prev, email_opt_in: !!c }))}
              />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive new deals and announcements via email
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
              <Checkbox
                checked={formData.sms_opt_in}
                onCheckedChange={(c) => setFormData((prev) => ({ ...prev, sms_opt_in: !!c }))}
              />
              <div>
                <p className="font-medium">SMS Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get text alerts for hot deals
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/buyer/dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Profile
          </Button>
        </div>
      </main>
    </div>
  );
}
