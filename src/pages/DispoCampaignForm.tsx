import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Save,
  Eye,
  Users,
  Mail,
  Home,
  CheckCircle,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { useDispoDeals } from '@/hooks/useDispoDeals';
import { useCashBuyers, CashBuyer } from '@/hooks/useCashBuyers';
import {
  useDispoCampaign,
  useCreateDispoCampaign,
  useUpdateDispoCampaign,
  useSendDispoCampaign,
} from '@/hooks/useDispoCampaigns';
import { toast } from 'sonner';

const templateOptions = [
  { value: 'deal_announcement', label: 'Deal Announcement', description: 'Promote a new deal to your list' },
  { value: 'price_reduction', label: 'Price Reduction', description: 'Announce a price drop' },
  { value: 'coming_soon', label: 'Coming Soon', description: 'Tease an upcoming deal' },
  { value: 'last_chance', label: 'Last Chance', description: 'Create urgency for a deal' },
  { value: 'custom', label: 'Custom', description: 'Start from scratch' },
];

const getDefaultTemplate = (deal: any, templateType: string) => {
  const address = deal ? `${deal.address}, ${deal.city}, ${deal.state}` : '[Property Address]';
  const price = deal?.asking_price ? `$${deal.asking_price.toLocaleString()}` : '$XXX,XXX';
  const arv = deal?.arv ? `$${deal.arv.toLocaleString()}` : '$XXX,XXX';
  const equity = deal?.asking_price && deal?.arv 
    ? `$${(deal.arv - deal.asking_price - (deal.repair_estimate || 0)).toLocaleString()}`
    : '$XX,XXX';

  switch (templateType) {
    case 'deal_announcement':
      return {
        subject: `🔥 New Deal: ${deal?.title || 'Investor Special'} - ${equity} Equity!`,
        preview: `Don't miss this investment opportunity in ${deal?.city || 'your area'}...`,
        body: `
<h2>New Investment Opportunity!</h2>

<p><strong>${address}</strong></p>

<p>I just locked up this property and wanted to give you first look!</p>

<h3>Deal Highlights:</h3>
<ul>
  <li><strong>Asking Price:</strong> ${price}</li>
  <li><strong>ARV:</strong> ${arv}</li>
  <li><strong>Potential Equity:</strong> ${equity}</li>
  <li><strong>Strategy:</strong> Perfect for flip or rental</li>
</ul>

<p>This won't last long. Reply to this email or call me if you're interested!</p>

<p><a href="{{deal_url}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Details</a></p>

<p>Best,<br>{{your_name}}</p>
        `.trim(),
      };
    case 'price_reduction':
      return {
        subject: `📉 Price Drop! ${address} now ${price}`,
        preview: `We just reduced the price on this deal...`,
        body: `
<h2>Price Reduction Alert!</h2>

<p>Great news - we've reduced the price on <strong>${address}</strong>!</p>

<p><strong>New Price: ${price}</strong></p>

<p>The seller is motivated and we need to move this fast. This is your chance to get an even better deal.</p>

<p><a href="{{deal_url}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Updated Details</a></p>
        `.trim(),
      };
    case 'coming_soon':
      return {
        subject: `👀 Coming Soon: Hot Deal in ${deal?.city || 'Your Area'}`,
        preview: `Be the first to know when this deal drops...`,
        body: `
<h2>Coming Soon!</h2>

<p>I'm about to lock up a great deal in <strong>${deal?.city || 'your target area'}</strong> and wanted to give you a heads up.</p>

<p>Estimated numbers:</p>
<ul>
  <li><strong>ARV:</strong> ${arv}</li>
  <li><strong>Equity Potential:</strong> ${equity}+</li>
</ul>

<p>Reply to this email if you want first dibs when it's ready!</p>
        `.trim(),
      };
    case 'last_chance':
      return {
        subject: `⏰ LAST CHANCE: ${address}`,
        preview: `This deal is going under contract soon...`,
        body: `
<h2>Last Chance!</h2>

<p>This is your final opportunity to grab <strong>${address}</strong>!</p>

<p>We have serious interest and need to make a decision by end of day.</p>

<p><strong>Price: ${price}</strong><br>
<strong>Potential Equity: ${equity}</strong></p>

<p>If you're interested, you need to act NOW.</p>

<p><a href="{{deal_url}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Deal & Make Offer</a></p>
        `.trim(),
      };
    default:
      return {
        subject: '',
        preview: '',
        body: '',
      };
  }
};

export default function DispoCampaignForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate');
  const dealIdParam = searchParams.get('dealId');
  
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(dealIdParam);
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'market' | 'verified' | 'vip' | 'custom'>('all');
  const [customFilter, setCustomFilter] = useState({
    markets: [] as string[],
    tags: [] as string[],
    minRating: '',
    verifiedOnly: false,
    priceMatch: false,
  });
  const [templateType, setTemplateType] = useState('deal_announcement');
  const [emailContent, setEmailContent] = useState({
    name: '',
    subject: '',
    preview: '',
    body: '',
  });
  const [saving, setSaving] = useState(false);

  const { data: deals } = useDispoDeals({ status: 'active' });
  const { data: allBuyers } = useCashBuyers();
  const { data: existingCampaign } = useDispoCampaign(id || duplicateId || undefined);

  const createCampaign = useCreateDispoCampaign();
  const updateCampaign = useUpdateDispoCampaign();
  const sendCampaign = useSendDispoCampaign();

  const selectedDeal = useMemo(() => {
    return deals?.find((d: any) => d.id === selectedDealId);
  }, [deals, selectedDealId]);

  // Load existing campaign or template
  useEffect(() => {
    if (existingCampaign) {
      setSelectedDealId(existingCampaign.deal_id);
      setTemplateType(existingCampaign.template_type || 'deal_announcement');
      setEmailContent({
        name: duplicateId ? `Copy of ${existingCampaign.name}` : existingCampaign.name,
        subject: existingCampaign.subject,
        preview: existingCampaign.preview_text || '',
        body: existingCampaign.body_html,
      });
      if (existingCampaign.recipient_filter) {
        const filter = existingCampaign.recipient_filter as any;
        if (filter.type) {
          setRecipientFilter(filter.type);
          if (filter.type === 'custom') {
            setCustomFilter(filter.custom || {});
          }
        }
      }
    }
  }, [existingCampaign, duplicateId]);

  // Update template when deal or type changes
  useEffect(() => {
    if (!existingCampaign && templateType !== 'custom') {
      const template = getDefaultTemplate(selectedDeal, templateType);
      setEmailContent((prev) => ({
        ...prev,
        subject: template.subject,
        preview: template.preview,
        body: template.body,
      }));
    }
  }, [selectedDeal, templateType, existingCampaign]);

  // Calculate matching buyers
  const matchingBuyers = useMemo(() => {
    if (!allBuyers) return [];

    let filtered = allBuyers.filter((b) => b.status === 'active' && b.email_opt_in !== false);

    switch (recipientFilter) {
      case 'market':
        if (selectedDeal?.city) {
          filtered = filtered.filter((b) =>
            b.markets?.some((m) => m.toLowerCase().includes(selectedDeal.city.toLowerCase()))
          );
        }
        break;
      case 'verified':
        filtered = filtered.filter((b) => b.is_verified);
        break;
      case 'vip':
        filtered = filtered.filter((b) => b.tags?.includes('vip'));
        break;
      case 'custom':
        if (customFilter.markets.length) {
          filtered = filtered.filter((b) =>
            customFilter.markets.some((m) => b.markets?.includes(m))
          );
        }
        if (customFilter.tags.length) {
          filtered = filtered.filter((b) =>
            customFilter.tags.some((t) => b.tags?.includes(t))
          );
        }
        if (customFilter.minRating) {
          filtered = filtered.filter((b) => (b.buyer_rating || 0) >= parseInt(customFilter.minRating));
        }
        if (customFilter.verifiedOnly) {
          filtered = filtered.filter((b) => b.is_verified);
        }
        if (customFilter.priceMatch && selectedDeal?.asking_price) {
          filtered = filtered.filter(
            (b) =>
              (!b.min_price || b.min_price <= selectedDeal.asking_price) &&
              (!b.max_price || b.max_price >= selectedDeal.asking_price)
          );
        }
        break;
    }

    return filtered;
  }, [allBuyers, recipientFilter, customFilter, selectedDeal]);

  const handleSave = async (send = false) => {
    if (!emailContent.subject) {
      toast.error('Please enter a subject line');
      return;
    }

    setSaving(true);

    try {
      const campaignData = {
        name: emailContent.name || emailContent.subject.slice(0, 50),
        subject: emailContent.subject,
        preview_text: emailContent.preview,
        body_html: emailContent.body,
        template_type: templateType,
        deal_id: selectedDealId,
        recipient_filter: {
          type: recipientFilter,
          custom: recipientFilter === 'custom' ? customFilter : undefined,
        },
        recipient_count: matchingBuyers.length,
        status: send ? 'sending' : 'draft',
      };

      let campaignId = id;

      if (isEditing && id) {
        await updateCampaign.mutateAsync({ id, updates: campaignData });
      } else {
        const result = await createCampaign.mutateAsync(campaignData);
        campaignId = result.id;
      }

      if (send && campaignId) {
        await sendCampaign.mutateAsync(campaignId);
      }

      navigate('/dispo/campaigns');
    } catch (error) {
      // Error handled by mutations
    } finally {
      setSaving(false);
    }
  };

  const allMarkets = useMemo(() => {
    const markets = new Set<string>();
    allBuyers?.forEach((b) => b.markets?.forEach((m) => markets.add(m)));
    return Array.from(markets).sort();
  }, [allBuyers]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allBuyers?.forEach((b) => b.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [allBuyers]);

  return (
    <PageLayout
      title={isEditing ? 'Edit Campaign' : 'New Email Campaign'}
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dispo/campaigns')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          {step === 3 && (
            <Button onClick={() => handleSave(true)} disabled={saving || matchingBuyers.length === 0}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              Send Campaign
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 max-w-4xl">
        {/* Step Indicator */}
        <div className="flex items-center gap-4">
          {[
            { num: 1, label: 'Select Deal', icon: Home },
            { num: 2, label: 'Recipients', icon: Users },
            { num: 3, label: 'Compose', icon: Mail },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  step === s.num
                    ? 'bg-primary text-primary-foreground'
                    : step > s.num
                    ? 'bg-green-500/10 text-green-600'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s.num ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
                <span className="font-medium">{s.label}</span>
              </button>
              {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Select Deal */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Deal to Promote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={selectedDealId || 'none'}
                onValueChange={(v) => setSelectedDealId(v === 'none' ? null : v)}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="none" id="no-deal" />
                  <Label htmlFor="no-deal" className="flex-1 cursor-pointer">
                    <span className="font-medium">General Announcement</span>
                    <p className="text-sm text-muted-foreground">
                      Create campaign without specific deal
                    </p>
                  </Label>
                </div>

                {deals?.map((deal: any) => (
                  <div
                    key={deal.id}
                    className="flex items-center space-x-2 p-3 border rounded-lg"
                  >
                    <RadioGroupItem value={deal.id} id={deal.id} />
                    <Label htmlFor={deal.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        {deal.primary_photo_url && (
                          <img
                            src={deal.primary_photo_url}
                            alt=""
                            className="h-12 w-16 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{deal.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {deal.city}, {deal.state} · ${deal.asking_price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Recipients */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Who should receive this email?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={recipientFilter}
                onValueChange={(v: any) => setRecipientFilter(v)}
              >
                <div className="grid gap-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex-1 cursor-pointer">
                      <span className="font-medium">All active buyers</span>
                      <span className="text-muted-foreground ml-2">
                        ({allBuyers?.filter((b) => b.status === 'active').length || 0})
                      </span>
                    </Label>
                  </div>

                  {selectedDeal?.city && (
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="market" id="market" />
                      <Label htmlFor="market" className="flex-1 cursor-pointer">
                        <span className="font-medium">Buyers in {selectedDeal.city} market</span>
                        <span className="text-muted-foreground ml-2">
                          ({matchingBuyers.length})
                        </span>
                      </Label>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="verified" id="verified" />
                    <Label htmlFor="verified" className="flex-1 cursor-pointer">
                      <span className="font-medium">Verified buyers only</span>
                      <span className="text-muted-foreground ml-2">
                        ({allBuyers?.filter((b) => b.is_verified).length || 0})
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="vip" id="vip" />
                    <Label htmlFor="vip" className="flex-1 cursor-pointer">
                      <span className="font-medium">VIP buyers only</span>
                      <span className="text-muted-foreground ml-2">
                        ({allBuyers?.filter((b) => b.tags?.includes('vip')).length || 0})
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="cursor-pointer">
                      <span className="font-medium">Custom filter</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {recipientFilter === 'custom' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Markets</Label>
                      <Select
                        value=""
                        onValueChange={(v) => {
                          if (!customFilter.markets.includes(v)) {
                            setCustomFilter((prev) => ({
                              ...prev,
                              markets: [...prev.markets, v],
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add market..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allMarkets.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {customFilter.markets.map((m) => (
                          <Badge key={m} variant="secondary" className="gap-1">
                            {m}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                setCustomFilter((prev) => ({
                                  ...prev,
                                  markets: prev.markets.filter((x) => x !== m),
                                }))
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <Select
                        value=""
                        onValueChange={(v) => {
                          if (!customFilter.tags.includes(v)) {
                            setCustomFilter((prev) => ({
                              ...prev,
                              tags: [...prev.tags, v],
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add tag..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allTags.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {customFilter.tags.map((t) => (
                          <Badge key={t} variant="outline" className="gap-1">
                            {t}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                setCustomFilter((prev) => ({
                                  ...prev,
                                  tags: prev.tags.filter((x) => x !== t),
                                }))
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Min Rating</Label>
                      <Select
                        value={customFilter.minRating}
                        onValueChange={(v) =>
                          setCustomFilter((prev) => ({ ...prev, minRating: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="5">5 stars</SelectItem>
                          <SelectItem value="4">4+ stars</SelectItem>
                          <SelectItem value="3">3+ stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={customFilter.verifiedOnly}
                        onCheckedChange={(c) =>
                          setCustomFilter((prev) => ({ ...prev, verifiedOnly: !!c }))
                        }
                      />
                      <span className="text-sm">Verified only</span>
                    </label>
                    {selectedDeal && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={customFilter.priceMatch}
                          onCheckedChange={(c) =>
                            setCustomFilter((prev) => ({ ...prev, priceMatch: !!c }))
                          }
                        />
                        <span className="text-sm">Match buyer price range</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-lg font-semibold">
                  {matchingBuyers.length} buyers match your criteria
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Compose Email */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {templateOptions.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTemplateType(t.value)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        templateType === t.value
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <p className="font-medium text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name (internal)</Label>
                  <Input
                    id="name"
                    value={emailContent.name}
                    onChange={(e) =>
                      setEmailContent((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Initial Blast - 123 Main St"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject Line *</Label>
                  <Input
                    id="subject"
                    value={emailContent.subject}
                    onChange={(e) =>
                      setEmailContent((prev) => ({ ...prev, subject: e.target.value }))
                    }
                    placeholder="🔥 New Deal: 3/2 in East Austin - $65K Equity!"
                  />
                </div>

                <div>
                  <Label htmlFor="preview">Preview Text</Label>
                  <Input
                    id="preview"
                    value={emailContent.preview}
                    onChange={(e) =>
                      setEmailContent((prev) => ({ ...prev, preview: e.target.value }))
                    }
                    placeholder="Don't miss this investor special..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Shown in inbox preview after subject line
                  </p>
                </div>

                <div>
                  <Label htmlFor="body">Email Body (HTML)</Label>
                  <Tabs defaultValue="edit" className="mt-2">
                    <TabsList>
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit">
                      <Textarea
                        id="body"
                        value={emailContent.body}
                        onChange={(e) =>
                          setEmailContent((prev) => ({ ...prev, body: e.target.value }))
                        }
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </TabsContent>
                    <TabsContent value="preview">
                      <div
                        className="p-4 border rounded-lg bg-white min-h-[300px] prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: emailContent.body }}
                      />
                    </TabsContent>
                  </Tabs>
                  <p className="text-xs text-muted-foreground mt-1">
                    Available merge fields: {'{{deal_url}}'}, {'{{your_name}}'}, {'{{buyer_name}}'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ready to send?</p>
                    <p className="text-sm text-muted-foreground">
                      This campaign will be sent to {matchingBuyers.length} buyers
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => handleSave(true)}
                      disabled={saving || matchingBuyers.length === 0}
                    >
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <Send className="h-4 w-4 mr-2" />
                      Send to {matchingBuyers.length} Buyers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
