import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Copy,
  Check,
  Palette,
  FileText,
  UserPlus,
  Mail,
  Bell,
  ExternalLink,
  Settings,
} from 'lucide-react';
import { useDispoSettings, useUpdateDispoSettings, useCreateDispoSettings } from '@/hooks/useDispoSettings';
import { toast } from 'sonner';

const themes = [
  { value: 'modern', label: 'Modern', description: 'Clean, minimal design' },
  { value: 'classic', label: 'Classic', description: 'Traditional layout' },
  { value: 'bold', label: 'Bold', description: 'High contrast, urgent feel' },
];

const financingOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'hard_money', label: 'Hard Money' },
  { value: 'conventional', label: 'Conventional' },
];

const registrationFieldOptions = [
  { value: 'company_name', label: 'Company Name (optional)' },
  { value: 'markets', label: 'Markets' },
  { value: 'property_types', label: 'Property Types' },
  { value: 'price_range', label: 'Price Range' },
  { value: 'proof_of_funds', label: 'Proof of Funds upload' },
];

export default function DispoSettings() {
  const { data: settings, isLoading } = useDispoSettings();
  const updateSettings = useUpdateDispoSettings();
  const createSettings = useCreateDispoSettings();
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    // Branding
    company_name: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    default_theme: 'modern',
    primary_color: '#2563eb',
    accent_color: '#10b981',
    // Deal Defaults
    default_earnest_money: '5000',
    default_closing_timeline: '7-14 days',
    default_financing_allowed: ['cash', 'hard_money'] as string[],
    default_visibility: 'public',
    // Buyer Registration
    buyer_slug: '',
    require_email_verification: false,
    require_proof_of_funds: false,
    auto_approve_buyers: true,
    registration_fields: ['company_name', 'markets', 'property_types', 'price_range'] as string[],
    // Email Settings
    email_from_name: '',
    email_reply_to: '',
    email_signature: '',
    email_footer_text: "You're receiving this because you signed up for our buyer list...",
    email_unsubscribe_text: 'Click here to unsubscribe',
    // Notifications
    notify_new_buyer: true,
    notify_deal_view: false,
    notify_interest: true,
    notify_offer: true,
    notification_email: '',
    notification_phone: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
        company_website: settings.company_website || '',
        default_theme: settings.default_theme || 'modern',
        primary_color: settings.primary_color || '#2563eb',
        accent_color: settings.accent_color || '#10b981',
        default_earnest_money: settings.default_earnest_money?.toString() || '5000',
        default_closing_timeline: settings.default_closing_timeline || '7-14 days',
        default_financing_allowed: settings.default_financing_allowed || ['cash', 'hard_money'],
        default_visibility: settings.default_visibility || 'public',
        buyer_slug: settings.buyer_slug || '',
        require_email_verification: settings.require_email_verification || false,
        require_proof_of_funds: settings.require_proof_of_funds || false,
        auto_approve_buyers: settings.auto_approve_buyers ?? true,
        registration_fields: settings.registration_fields || ['company_name', 'markets', 'property_types', 'price_range'],
        email_from_name: settings.email_from_name || '',
        email_reply_to: settings.email_reply_to || '',
        email_signature: settings.email_signature || '',
        email_footer_text: settings.email_footer_text || "You're receiving this because you signed up for our buyer list...",
        email_unsubscribe_text: settings.email_unsubscribe_text || 'Click here to unsubscribe',
        notify_new_buyer: settings.notify_new_buyer ?? true,
        notify_deal_view: settings.notify_deal_view || false,
        notify_interest: settings.notify_interest ?? true,
        notify_offer: settings.notify_offer ?? true,
        notification_email: settings.notification_email || '',
        notification_phone: settings.notification_phone || '',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const payload = {
      company_name: formData.company_name || null,
      company_phone: formData.company_phone || null,
      company_email: formData.company_email || null,
      company_website: formData.company_website || null,
      default_theme: formData.default_theme,
      primary_color: formData.primary_color,
      accent_color: formData.accent_color,
      default_earnest_money: formData.default_earnest_money ? parseFloat(formData.default_earnest_money) : null,
      default_closing_timeline: formData.default_closing_timeline,
      default_financing_allowed: formData.default_financing_allowed,
      default_visibility: formData.default_visibility,
      buyer_slug: formData.buyer_slug || null,
      require_email_verification: formData.require_email_verification,
      require_proof_of_funds: formData.require_proof_of_funds,
      auto_approve_buyers: formData.auto_approve_buyers,
      registration_fields: formData.registration_fields,
      email_from_name: formData.email_from_name || null,
      email_reply_to: formData.email_reply_to || null,
      email_signature: formData.email_signature || null,
      email_footer_text: formData.email_footer_text || null,
      email_unsubscribe_text: formData.email_unsubscribe_text || null,
      notify_new_buyer: formData.notify_new_buyer,
      notify_deal_view: formData.notify_deal_view,
      notify_interest: formData.notify_interest,
      notify_offer: formData.notify_offer,
      notification_email: formData.notification_email || null,
      notification_phone: formData.notification_phone || null,
    };

    if (settings) {
      updateSettings.mutate(payload);
    } else {
      createSettings.mutate(payload);
    }
  };

  const toggleFinancing = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      default_financing_allowed: prev.default_financing_allowed.includes(value)
        ? prev.default_financing_allowed.filter((v) => v !== value)
        : [...prev.default_financing_allowed, value],
    }));
  };

  const toggleRegistrationField = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      registration_fields: prev.registration_fields.includes(value)
        ? prev.registration_fields.filter((v) => v !== value)
        : [...prev.registration_fields, value],
    }));
  };

  const registrationUrl = `${window.location.origin}/register/buyer${formData.buyer_slug ? `/${formData.buyer_slug}` : ''}`;

  const copyRegistrationUrl = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <AppLayout fullWidth>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout fullWidth>
      <div className="min-h-full bg-background">
        {/* Header Bar */}
        <div className="border-b border-border bg-background sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <h1 className="text-lg font-semibold">Dispo Settings</h1>
                <p className="text-sm text-muted-foreground">Configure your deal marketing preferences</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending || createSettings.isPending}
            >
              {(updateSettings.isPending || createSettings.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Settings
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
          <Tabs defaultValue="branding" className="w-full">
            {/* Horizontal Tab Navigation */}
            <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg mb-6">
              <TabsTrigger value="branding" className="gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Palette className="h-4 w-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="defaults" className="gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                Deal Defaults
              </TabsTrigger>
              <TabsTrigger value="registration" className="gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <UserPlus className="h-4 w-4" />
                Buyer Registration
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Mail className="h-4 w-4" />
                Email Settings
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding" className="mt-0">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Company Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-4">Company Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData((p) => ({ ...p, company_name: e.target.value }))}
                          placeholder="ABC Wholesale Deals"
                          className="mt-1.5"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Displayed on deal pages and emails
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="company_phone">Phone</Label>
                          <Input
                            id="company_phone"
                            value={formData.company_phone}
                            onChange={(e) => setFormData((p) => ({ ...p, company_phone: e.target.value }))}
                            placeholder="(555) 123-4567"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company_email">Email</Label>
                          <Input
                            id="company_email"
                            type="email"
                            value={formData.company_email}
                            onChange={(e) => setFormData((p) => ({ ...p, company_email: e.target.value }))}
                            placeholder="deals@company.com"
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="company_website">Website</Label>
                        <Input
                          id="company_website"
                          value={formData.company_website}
                          onChange={(e) => setFormData((p) => ({ ...p, company_website: e.target.value }))}
                          placeholder="https://company.com"
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h3 className="text-base font-medium mb-4">Brand Colors</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="primary_color">Primary Color</Label>
                        <div className="flex gap-2 mt-1.5">
                          <input
                            type="color"
                            id="primary_color"
                            value={formData.primary_color}
                            onChange={(e) => setFormData((p) => ({ ...p, primary_color: e.target.value }))}
                            className="h-10 w-14 rounded-md border border-input cursor-pointer"
                          />
                          <Input
                            value={formData.primary_color}
                            onChange={(e) => setFormData((p) => ({ ...p, primary_color: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="accent_color">Accent Color</Label>
                        <div className="flex gap-2 mt-1.5">
                          <input
                            type="color"
                            id="accent_color"
                            value={formData.accent_color}
                            onChange={(e) => setFormData((p) => ({ ...p, accent_color: e.target.value }))}
                            className="h-10 w-14 rounded-md border border-input cursor-pointer"
                          />
                          <Input
                            value={formData.accent_color}
                            onChange={(e) => setFormData((p) => ({ ...p, accent_color: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <h3 className="text-base font-medium mb-4">Deal Page Theme</h3>
                  <div className="space-y-3">
                    {themes.map((theme) => (
                      <label
                        key={theme.value}
                        className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all border ${
                          formData.default_theme === theme.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={theme.value}
                          checked={formData.default_theme === theme.value}
                          onChange={() => setFormData((p) => ({ ...p, default_theme: theme.value }))}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <span className="font-medium">{theme.label}</span>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                        {formData.default_theme === theme.value && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Defaults Tab */}
            <TabsContent value="defaults" className="mt-0">
              <div className="max-w-2xl space-y-6">
                <h3 className="text-base font-medium">Default Settings for New Deals</h3>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="default_earnest_money">Earnest Money</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="default_earnest_money"
                        type="number"
                        value={formData.default_earnest_money}
                        onChange={(e) => setFormData((p) => ({ ...p, default_earnest_money: e.target.value }))}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="default_closing_timeline">Closing Timeline</Label>
                    <Select
                      value={formData.default_closing_timeline}
                      onValueChange={(v) => setFormData((p) => ({ ...p, default_closing_timeline: v }))}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7-14 days">7-14 days</SelectItem>
                        <SelectItem value="14-21 days">14-21 days</SelectItem>
                        <SelectItem value="21-30 days">21-30 days</SelectItem>
                        <SelectItem value="30+ days">30+ days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Financing Allowed</Label>
                  <div className="flex flex-wrap gap-6 mt-3">
                    {financingOptions.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.default_financing_allowed.includes(opt.value)}
                          onCheckedChange={() => toggleFinancing(opt.value)}
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="default_visibility">Default Visibility</Label>
                  <Select
                    value={formData.default_visibility}
                    onValueChange={(v) => setFormData((p) => ({ ...p, default_visibility: v }))}
                  >
                    <SelectTrigger className="mt-1.5 w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private (link only)</SelectItem>
                      <SelectItem value="password">Password Protected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Buyer Registration Tab */}
            <TabsContent value="registration" className="mt-0">
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-4">Registration URL</h3>
                    <div className="flex gap-2">
                      <Input value={registrationUrl} readOnly className="flex-1 bg-muted/50" />
                      <Button variant="outline" onClick={copyRegistrationUrl}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={registrationUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="buyer_slug">Custom URL Slug</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-muted-foreground text-sm whitespace-nowrap">/register/buyer/</span>
                      <Input
                        id="buyer_slug"
                        value={formData.buyer_slug}
                        onChange={(e) => setFormData((p) => ({ ...p, buyer_slug: e.target.value }))}
                        placeholder="your-company"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-medium mb-4">Registration Form Fields</h3>
                    <div className="space-y-2">
                      {registrationFieldOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={formData.registration_fields.includes(opt.value)}
                            onCheckedChange={() => toggleRegistrationField(opt.value)}
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium mb-4">Registration Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 rounded-lg cursor-pointer hover:bg-muted/50 border border-border">
                      <Checkbox
                        checked={formData.require_email_verification}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, require_email_verification: !!c }))}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-sm">Require email verification</p>
                        <p className="text-sm text-muted-foreground">
                          Buyers must verify their email before accessing deals
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-4 rounded-lg cursor-pointer hover:bg-muted/50 border border-border">
                      <Checkbox
                        checked={formData.require_proof_of_funds}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, require_proof_of_funds: !!c }))}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-sm">Require proof of funds to register</p>
                        <p className="text-sm text-muted-foreground">
                          Buyers must upload POF to complete registration
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-4 rounded-lg cursor-pointer hover:bg-muted/50 border border-border">
                      <Checkbox
                        checked={formData.auto_approve_buyers}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, auto_approve_buyers: !!c }))}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-sm">Auto-approve new buyers</p>
                        <p className="text-sm text-muted-foreground">
                          If unchecked, manual approval is needed
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Email Settings Tab */}
            <TabsContent value="email" className="mt-0">
              <div className="max-w-2xl space-y-6">
                <h3 className="text-base font-medium">Email Configuration</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email_from_name">From Name</Label>
                    <Input
                      id="email_from_name"
                      value={formData.email_from_name}
                      onChange={(e) => setFormData((p) => ({ ...p, email_from_name: e.target.value }))}
                      placeholder="ABC Wholesale Deals"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email_reply_to">Reply-To Email</Label>
                    <Input
                      id="email_reply_to"
                      type="email"
                      value={formData.email_reply_to}
                      onChange={(e) => setFormData((p) => ({ ...p, email_reply_to: e.target.value }))}
                      placeholder="deals@abcwholesale.com"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email_signature">Email Signature</Label>
                  <Textarea
                    id="email_signature"
                    value={formData.email_signature}
                    onChange={(e) => setFormData((p) => ({ ...p, email_signature: e.target.value }))}
                    placeholder={"John Smith\nABC Wholesale\n(555) 123-4567"}
                    rows={4}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="email_footer_text">Footer Text</Label>
                  <Textarea
                    id="email_footer_text"
                    value={formData.email_footer_text}
                    onChange={(e) => setFormData((p) => ({ ...p, email_footer_text: e.target.value }))}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="email_unsubscribe_text">Unsubscribe Text</Label>
                  <Input
                    id="email_unsubscribe_text"
                    value={formData.email_unsubscribe_text}
                    onChange={(e) => setFormData((p) => ({ ...p, email_unsubscribe_text: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <div className="max-w-2xl space-y-6">
                <div>
                  <h3 className="text-base font-medium mb-4">Notify me when:</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.notify_new_buyer}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, notify_new_buyer: !!c }))}
                      />
                      <span>New buyer registers</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.notify_deal_view}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, notify_deal_view: !!c }))}
                      />
                      <span>Someone views a deal</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.notify_interest}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, notify_interest: !!c }))}
                      />
                      <span>Someone expresses interest</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={formData.notify_offer}
                        onCheckedChange={(c) => setFormData((p) => ({ ...p, notify_offer: !!c }))}
                      />
                      <span>Someone makes an offer</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium mb-4">Notification Delivery</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="notification_email">Email</Label>
                      <Input
                        id="notification_email"
                        type="email"
                        value={formData.notification_email}
                        onChange={(e) => setFormData((p) => ({ ...p, notification_email: e.target.value }))}
                        placeholder="you@company.com"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notification_phone">Phone (SMS)</Label>
                      <Input
                        id="notification_phone"
                        value={formData.notification_phone}
                        onChange={(e) => setFormData((p) => ({ ...p, notification_phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
