import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Plus,
  X,
  Upload,
  GripVertical,
  Loader2,
  DollarSign,
  Home,
  FileText,
  Image,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useDispoDeal, useCreateDispoDeal, useUpdateDispoDeal, DispoPhoto, DispoDocument } from '@/hooks/useDispoDeals';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const propertyTypes = [
  { value: 'sfh', label: 'Single Family Home' },
  { value: 'multi', label: 'Multi-Family' },
  { value: 'condo', label: 'Condo/Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
];

const closingTimelineOptions = [
  { value: 'asap', label: 'ASAP' },
  { value: '7_days', label: '7 days' },
  { value: '7_14_days', label: '7-14 days' },
  { value: '14_21_days', label: '14-21 days' },
  { value: '21_30_days', label: '21-30 days' },
  { value: 'flexible', label: 'Flexible' },
];

const documentTypes = [
  { value: 'contract', label: 'Contract' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'title', label: 'Title Report' },
  { value: 'comps', label: 'Comp Analysis' },
  { value: 'repair_estimate', label: 'Scope of Work' },
  { value: 'other', label: 'Other' },
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

interface FormData {
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  neighborhood: string;
  property_type: string;
  beds: string;
  baths: string;
  sqft: string;
  lot_sqft: string;
  year_built: string;
  stories: string;
  garage: string;
  pool: boolean;
  asking_price: string;
  arv: string;
  repair_estimate: string;
  contract_price: string;
  show_assignment_fee: boolean;
  description: string;
  investment_highlights: string[];
  repair_details: string;
  photos: DispoPhoto[];
  video_url: string;
  virtual_tour_url: string;
  documents: DispoDocument[];
  earnest_money_required: string;
  closing_timeline: string;
  financing_allowed: string[];
  assignment_or_double: boolean;
  status: string;
  visibility: string;
  password_protected: boolean;
  access_password: string;
  has_expiration: boolean;
  expires_at: string;
  notify_on_view: boolean;
  notify_on_interest: boolean;
}

const initialFormData: FormData = {
  title: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  county: '',
  neighborhood: '',
  property_type: 'sfh',
  beds: '',
  baths: '',
  sqft: '',
  lot_sqft: '',
  year_built: '',
  stories: '',
  garage: '',
  pool: false,
  asking_price: '',
  arv: '',
  repair_estimate: '',
  contract_price: '',
  show_assignment_fee: false,
  description: '',
  investment_highlights: [''],
  repair_details: '',
  photos: [],
  video_url: '',
  virtual_tour_url: '',
  documents: [],
  earnest_money_required: '5000',
  closing_timeline: '7_14_days',
  financing_allowed: ['cash', 'hard_money'],
  assignment_or_double: true,
  status: 'draft',
  visibility: 'public',
  password_protected: false,
  access_password: '',
  has_expiration: false,
  expires_at: '',
  notify_on_view: false,
  notify_on_interest: true,
};

export default function DispoDealForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: existingDeal, isLoading: loadingDeal } = useDispoDeal(id);
  const createDeal = useCreateDispoDeal();
  const updateDeal = useUpdateDispoDeal();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<Map<string, number>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = useCallback(async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        toast.error(`${f.name}: Only JPG, PNG, WEBP allowed`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`Upload failed — check file size (max 10MB)`);
        return false;
      }
      return true;
    });
    if (!validFiles.length) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Please sign in to upload'); return; }

    const dealFolder = id || 'new';

    for (const file of validFiles) {
      const fileKey = `${Date.now()}-${file.name}`;
      const storagePath = `${user.id}/${dealFolder}/${fileKey}`;

      setUploadingPhotos(prev => new Map(prev).set(fileKey, 0));

      try {
        const { error } = await supabase.storage
          .from('dispo-photos')
          .upload(storagePath, file, { upsert: false });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('dispo-photos')
          .getPublicUrl(storagePath);

        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, { url: urlData.publicUrl, caption: '' }],
        }));
      } catch {
        toast.error(`Upload failed — check file size (max 10MB)`);
      } finally {
        setUploadingPhotos(prev => {
          const next = new Map(prev);
          next.delete(fileKey);
          return next;
        });
      }
    }
  }, [id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handlePhotoUpload(e.dataTransfer.files);
  }, [handlePhotoUpload]);

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  useEffect(() => {
    if (existingDeal) {
      setFormData({
        title: existingDeal.title || '',
        address: existingDeal.address || '',
        city: existingDeal.city || '',
        state: existingDeal.state || '',
        zip: existingDeal.zip || '',
        county: existingDeal.county || '',
        neighborhood: existingDeal.neighborhood || '',
        property_type: existingDeal.property_type || 'sfh',
        beds: existingDeal.beds?.toString() || '',
        baths: existingDeal.baths?.toString() || '',
        sqft: existingDeal.sqft?.toString() || '',
        lot_sqft: existingDeal.lot_sqft?.toString() || '',
        year_built: existingDeal.year_built?.toString() || '',
        stories: existingDeal.stories?.toString() || '',
        garage: existingDeal.garage || '',
        pool: existingDeal.pool || false,
        asking_price: existingDeal.asking_price?.toString() || '',
        arv: existingDeal.arv?.toString() || '',
        repair_estimate: existingDeal.repair_estimate?.toString() || '',
        contract_price: existingDeal.contract_price?.toString() || '',
        show_assignment_fee: existingDeal.show_assignment_fee || false,
        description: existingDeal.description || '',
        investment_highlights: existingDeal.investment_highlights?.length
          ? existingDeal.investment_highlights
          : [''],
        repair_details: existingDeal.repair_details || '',
        photos: existingDeal.photos || [],
        video_url: existingDeal.video_url || '',
        virtual_tour_url: existingDeal.virtual_tour_url || '',
        documents: existingDeal.documents || [],
        earnest_money_required: existingDeal.earnest_money_required?.toString() || '5000',
        closing_timeline: existingDeal.closing_timeline || '7_14_days',
        financing_allowed: existingDeal.financing_allowed || ['cash', 'hard_money'],
        assignment_or_double: existingDeal.assignment_or_double ?? true,
        status: existingDeal.status || 'draft',
        visibility: existingDeal.visibility || 'public',
        password_protected: existingDeal.password_protected || false,
        access_password: existingDeal.access_password || '',
        has_expiration: !!existingDeal.expires_at,
        expires_at: existingDeal.expires_at || '',
        notify_on_view: existingDeal.notify_on_view || false,
        notify_on_interest: existingDeal.notify_on_interest ?? true,
      });
    }
  }, [existingDeal]);

  const calculatedEquity = () => {
    const arv = parseFloat(formData.arv) || 0;
    const asking = parseFloat(formData.asking_price) || 0;
    const repairs = parseFloat(formData.repair_estimate) || 0;
    const equity = arv - asking - repairs;
    const percentage = arv > 0 ? (equity / arv) * 100 : 0;
    return { equity, percentage };
  };

  const calculatedAssignmentFee = () => {
    const asking = parseFloat(formData.asking_price) || 0;
    const contract = parseFloat(formData.contract_price) || 0;
    return contract > 0 ? asking - contract : 0;
  };

  const handleSave = async (publish: boolean = false) => {
    if (!formData.title || !formData.address || !formData.city || !formData.state || !formData.asking_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    const dealData = {
      title: formData.title,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip || null,
      county: formData.county || null,
      neighborhood: formData.neighborhood || null,
      property_type: formData.property_type,
      beds: formData.beds ? parseInt(formData.beds) : null,
      baths: formData.baths ? parseFloat(formData.baths) : null,
      sqft: formData.sqft ? parseInt(formData.sqft) : null,
      lot_sqft: formData.lot_sqft ? parseInt(formData.lot_sqft) : null,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      stories: formData.stories ? parseInt(formData.stories) : null,
      garage: formData.garage || null,
      pool: formData.pool,
      asking_price: parseFloat(formData.asking_price),
      arv: formData.arv ? parseFloat(formData.arv) : null,
      repair_estimate: formData.repair_estimate ? parseFloat(formData.repair_estimate) : null,
      contract_price: formData.contract_price ? parseFloat(formData.contract_price) : null,
      assignment_fee: calculatedAssignmentFee() > 0 ? calculatedAssignmentFee() : null,
      show_assignment_fee: formData.show_assignment_fee,
      description: formData.description || null,
      investment_highlights: formData.investment_highlights.filter(h => h.trim()),
      repair_details: formData.repair_details || null,
      photos: formData.photos,
      video_url: formData.video_url || null,
      virtual_tour_url: formData.virtual_tour_url || null,
      documents: formData.documents,
      earnest_money_required: formData.earnest_money_required ? parseFloat(formData.earnest_money_required) : null,
      closing_timeline: formData.closing_timeline,
      financing_allowed: formData.financing_allowed,
      assignment_or_double: formData.assignment_or_double,
      status: publish ? 'active' : formData.status,
      visibility: formData.visibility,
      password_protected: formData.password_protected,
      access_password: formData.password_protected ? formData.access_password : null,
      expires_at: formData.has_expiration ? formData.expires_at : null,
      notify_on_view: formData.notify_on_view,
      notify_on_interest: formData.notify_on_interest,
      published_at: publish ? new Date().toISOString() : undefined,
    };

    try {
      if (isEditing) {
        await updateDeal.mutateAsync({ id, updates: dealData });
      } else {
        await createDeal.mutateAsync(dealData);
      }
      navigate('/dispo/deals');
    } catch (error) {
      // Error handled by mutation
    } finally {
      setSaving(false);
    }
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      investment_highlights: [...prev.investment_highlights, ''],
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      investment_highlights: prev.investment_highlights.filter((_, i) => i !== index),
    }));
  };

  const updateHighlight = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      investment_highlights: prev.investment_highlights.map((h, i) => (i === index ? value : h)),
    }));
  };

  const toggleFinancing = (option: string) => {
    setFormData(prev => ({
      ...prev,
      financing_allowed: prev.financing_allowed.includes(option)
        ? prev.financing_allowed.filter(f => f !== option)
        : [...prev.financing_allowed, option],
    }));
  };

  if (isEditing && loadingDeal) {
    return (
      <PageLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  const { equity, percentage } = calculatedEquity();

  return (
    <PageLayout
      title={isEditing ? 'Edit Deal' : 'Create New Deal'}
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dispo/deals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title/Headline *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Investor Special - $50K Equity in East Austin!"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Catchy headline for email subjects and page title
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="1423 Elm Street"
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Austin"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zip">Zip</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                    placeholder="78701"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  value={formData.county}
                  onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                  placeholder="Travis"
                />
              </div>
              <div>
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                  placeholder="East Austin"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="beds">Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData(prev => ({ ...prev, beds: e.target.value }))}
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="baths">Baths</Label>
                <Input
                  id="baths"
                  type="number"
                  step="0.5"
                  value={formData.baths}
                  onChange={(e) => setFormData(prev => ({ ...prev, baths: e.target.value }))}
                  placeholder="2"
                />
              </div>
              <div>
                <Label htmlFor="sqft">SqFt</Label>
                <Input
                  id="sqft"
                  type="number"
                  value={formData.sqft}
                  onChange={(e) => setFormData(prev => ({ ...prev, sqft: e.target.value }))}
                  placeholder="1850"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="year_built">Year Built</Label>
                <Input
                  id="year_built"
                  type="number"
                  value={formData.year_built}
                  onChange={(e) => setFormData(prev => ({ ...prev, year_built: e.target.value }))}
                  placeholder="1985"
                />
              </div>
              <div>
                <Label htmlFor="lot_sqft">Lot Size (sqft)</Label>
                <Input
                  id="lot_sqft"
                  type="number"
                  value={formData.lot_sqft}
                  onChange={(e) => setFormData(prev => ({ ...prev, lot_sqft: e.target.value }))}
                  placeholder="7500"
                />
              </div>
              <div>
                <Label htmlFor="stories">Stories</Label>
                <Input
                  id="stories"
                  type="number"
                  value={formData.stories}
                  onChange={(e) => setFormData(prev => ({ ...prev, stories: e.target.value }))}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="garage">Garage</Label>
                <Input
                  id="garage"
                  value={formData.garage}
                  onChange={(e) => setFormData(prev => ({ ...prev, garage: e.target.value }))}
                  placeholder="2 car attached"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="pool"
                checked={formData.pool}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pool: !!checked }))}
              />
              <Label htmlFor="pool">Has Pool</Label>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="asking_price">Asking Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="asking_price"
                    type="number"
                    value={formData.asking_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, asking_price: e.target.value }))}
                    className="pl-7"
                    placeholder="175000"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Your wholesale price</p>
              </div>
              <div>
                <Label htmlFor="arv">ARV (After Repair Value)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="arv"
                    type="number"
                    value={formData.arv}
                    onChange={(e) => setFormData(prev => ({ ...prev, arv: e.target.value }))}
                    className="pl-7"
                    placeholder="285000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="repair_estimate">Repair Estimate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="repair_estimate"
                    type="number"
                    value={formData.repair_estimate}
                    onChange={(e) => setFormData(prev => ({ ...prev, repair_estimate: e.target.value }))}
                    className="pl-7"
                    placeholder="45000"
                  />
                </div>
              </div>
            </div>

            {/* Equity Display */}
            {formData.arv && formData.asking_price && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Potential Equity</span>
                  <span className={`text-xl font-bold ${equity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${equity.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium mb-3 text-muted-foreground">Contract Details (Internal)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract_price">Contract Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="contract_price"
                      type="number"
                      value={formData.contract_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, contract_price: e.target.value }))}
                      className="pl-7"
                      placeholder="155000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">What you have it under contract for</p>
                </div>
                <div>
                  <Label>Assignment Fee</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-semibold">
                      ${calculatedAssignmentFee().toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">(auto-calculated)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  id="show_assignment_fee"
                  checked={formData.show_assignment_fee}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_assignment_fee: !!checked }))}
                />
                <Label htmlFor="show_assignment_fee">Show assignment fee on deal page</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description & Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description & Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed property description..."
                rows={5}
              />
            </div>

            <div>
              <Label>Investment Highlights</Label>
              <div className="space-y-2 mt-2">
                {formData.investment_highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      placeholder="e.g., 30% below ARV"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHighlight(index)}
                      disabled={formData.investment_highlights.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addHighlight}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Highlight
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="repair_details">Repair Details</Label>
              <Textarea
                id="repair_details"
                value={formData.repair_details}
                onChange={(e) => setFormData(prev => ({ ...prev, repair_details: e.target.value }))}
                placeholder="Interior paint: $4,000&#10;LVP flooring: $7,500&#10;Kitchen refresh: $12,000"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                One item per line in format "Item: $Amount"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Photos</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
              />
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center mt-2 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop photos here, or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WEBP — max 10MB each
                </p>
              </div>

              {/* Upload progress */}
              {uploadingPhotos.size > 0 && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading {uploadingPhotos.size} photo{uploadingPhotos.size > 1 ? 's' : ''}…
                </div>
              )}

              {/* Photo thumbnails */}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Manual URL fallback */}
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground">Or add photo by URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="https://example.com/photo.jpg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setFormData(prev => ({
                            ...prev,
                            photos: [...prev.photos, { url: val, caption: '' }],
                          }));
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = (e.currentTarget as HTMLElement).previousElementSibling as HTMLInputElement;
                      const val = input?.value?.trim();
                      if (val) {
                        setFormData(prev => ({
                          ...prev,
                          photos: [...prev.photos, { url: val, caption: '' }],
                        }));
                        input.value = '';
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground mt-1">YouTube, Vimeo, or direct link</p>
              </div>
              <div>
                <Label htmlFor="virtual_tour_url">Virtual Tour URL</Label>
                <Input
                  id="virtual_tour_url"
                  value={formData.virtual_tour_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, virtual_tour_url: e.target.value }))}
                  placeholder="https://my.matterport.com/..."
                />
                <p className="text-xs text-muted-foreground mt-1">Matterport or similar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deal Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Deal Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="earnest_money">Earnest Money Required</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="earnest_money"
                    type="number"
                    value={formData.earnest_money_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, earnest_money_required: e.target.value }))}
                    className="pl-7"
                    placeholder="5000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="closing_timeline">Closing Timeline</Label>
                <Select
                  value={formData.closing_timeline}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, closing_timeline: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {closingTimelineOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Financing Allowed</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {['cash', 'hard_money', 'conventional', 'private'].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.financing_allowed.includes(option)}
                      onCheckedChange={() => toggleFinancing(option)}
                    />
                    <span className="text-sm capitalize">{option.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="assignment_or_double"
                checked={formData.assignment_or_double}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, assignment_or_double: !!checked }))}
              />
              <Label htmlFor="assignment_or_double">Assignment or double close available</Label>
            </div>
          </CardContent>
        </Card>

        {/* Visibility & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Visibility & Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (anyone)</SelectItem>
                    <SelectItem value="private">Private (direct link only)</SelectItem>
                    <SelectItem value="vip_only">VIP Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password Protection</Label>
                  <p className="text-xs text-muted-foreground">Require password to view deal</p>
                </div>
                <Switch
                  checked={formData.password_protected}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, password_protected: checked }))}
                />
              </div>
              {formData.password_protected && (
                <Input
                  value={formData.access_password}
                  onChange={(e) => setFormData(prev => ({ ...prev, access_password: e.target.value }))}
                  placeholder="Enter access password"
                  type="password"
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Set Expiration</Label>
                  <p className="text-xs text-muted-foreground">Automatically hide deal after date</p>
                </div>
                <Switch
                  checked={formData.has_expiration}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_expiration: checked }))}
                />
              </div>
              {formData.has_expiration && (
                <Input
                  type="date"
                  value={formData.expires_at?.split('T')[0] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              )}
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Notifications</p>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify_view">Notify me when someone views this deal</Label>
                <Switch
                  id="notify_view"
                  checked={formData.notify_on_view}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notify_on_view: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notify_interest">Notify me when someone expresses interest</Label>
                <Switch
                  id="notify_interest"
                  checked={formData.notify_on_interest}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notify_on_interest: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-4 sticky bottom-4 bg-background p-4 border border-border rounded-lg shadow-lg">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Save Changes' : 'Save Draft'}
          </Button>
          <Button variant="secondary" onClick={() => window.open(`/deals/preview`, '_blank')} disabled={saving}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Publish Deal
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
