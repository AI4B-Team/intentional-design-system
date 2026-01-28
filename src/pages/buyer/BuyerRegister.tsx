import React, { useState } from 'react';
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
import { Plus, X, Loader2, CheckCircle, Building } from 'lucide-react';
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

export default function BuyerRegister() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone: '',
    markets: [] as string[],
    property_types: ['sfh'] as string[],
    min_price: '',
    max_price: '',
    buying_strategy: ['flip'] as string[],
    funding_type: 'cash',
    can_close_days: '14',
    email_opt_in: true,
    sms_opt_in: false,
  });

  const [newMarket, setNewMarket] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('cash_buyers')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .single();

      if (existing) {
        toast.error('An account with this email already exists. Please login instead.');
        setIsSubmitting(false);
        return;
      }

      // Create buyer record (we need to associate with a wholesaler - for now use a placeholder)
      // In a real implementation, this would be scoped to a specific wholesaler via URL param
      const { error } = await supabase
        .from('cash_buyers')
        .insert({
          // Note: In production, user_id should come from the wholesaler's context
          // For now, we'll need the buyer to be "claimed" by a wholesaler or use a system account
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder - should be wholesaler ID
          first_name: formData.first_name,
          last_name: formData.last_name || null,
          full_name: `${formData.first_name} ${formData.last_name}`.trim(),
          company_name: formData.company_name || null,
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          markets: formData.markets.length ? formData.markets : null,
          property_types: formData.property_types.length ? formData.property_types : null,
          min_price: formData.min_price ? parseFloat(formData.min_price) : null,
          max_price: formData.max_price ? parseFloat(formData.max_price) : null,
          buying_strategy: formData.buying_strategy.length ? formData.buying_strategy : null,
          funding_type: formData.funding_type,
          can_close_days: parseInt(formData.can_close_days),
          email_opt_in: formData.email_opt_in,
          sms_opt_in: formData.sms_opt_in,
          status: 'active',
          source: 'website',
        });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Registration successful!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Our Buyer List!</h2>
            <p className="text-muted-foreground mb-6">
              You're now registered to receive exclusive deal alerts. Check your email for a welcome message.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/buyer/login')} className="w-full">
                Login to Your Account
              </Button>
              <Button variant="outline" onClick={() => navigate('/deals')} className="w-full">
                Browse Available Deals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join Our Buyer List</h1>
          <p className="text-muted-foreground">
            Get exclusive access to off-market deals matching your criteria
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registration</CardTitle>
            <CardDescription>
              Fill out your buying criteria to receive matching deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                      required
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
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      required
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
                  <Label>Markets You Buy In</Label>
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
                        placeholder="0"
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
                        placeholder="No limit"
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
                    <Label htmlFor="can_close_days">How Fast Can You Close?</Label>
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
              </div>

              {/* Communication */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Communication Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.email_opt_in}
                      onCheckedChange={(c) => setFormData((prev) => ({ ...prev, email_opt_in: !!c }))}
                    />
                    <span className="text-sm">I agree to receive deal alerts via email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.sms_opt_in}
                      onCheckedChange={(c) => setFormData((prev) => ({ ...prev, sms_opt_in: !!c }))}
                    />
                    <span className="text-sm">I agree to receive SMS alerts</span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Register
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/buyer/login')}>
                  Login here
                </Button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
