import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check,
  MapPin, 
  DollarSign, 
  Home, 
  Target,
  Bell,
  Mail,
  MessageSquare,
  Bed,
  Bath,
  Ruler,
  Calendar
} from 'lucide-react';
import { BuyBox } from '@/types/property-scout';
import { cn } from '@/lib/utils';

interface BuyBoxWizardProps {
  onSave: (buyBox: Partial<BuyBox>) => void;
  onCancel?: () => void;
  existingBuyBox?: BuyBox;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const PROPERTY_TYPES = [
  { value: 'any', label: 'Any' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhome', label: 'Townhome' },
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' }
];

export const BuyBoxWizard: React.FC<BuyBoxWizardProps> = ({
  onSave,
  onCancel,
  existingBuyBox
}) => {
  const [step, setStep] = useState(1);
  const [buyBoxName, setBuyBoxName] = useState(existingBuyBox?.name || '');
  const [description, setDescription] = useState(existingBuyBox?.description || '');
  const [isActive, setIsActive] = useState(existingBuyBox?.isActive ?? true);
  
  // Market/Location
  const [searchAddress, setSearchAddress] = useState('');
  const [searchRadius, setSearchRadius] = useState([200]);
  const [selectedStates, setSelectedStates] = useState<string[]>(existingBuyBox?.criteria?.states || []);
  
  // Price Range
  const [priceRange, setPriceRange] = useState({
    min: existingBuyBox?.criteria?.minPrice || 0,
    max: existingBuyBox?.criteria?.maxPrice || 1000000
  });
  
  // Property Details
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    existingBuyBox?.criteria?.propertyTypes || ['any']
  );
  const [bedrooms, setBedrooms] = useState<string>('any');
  const [bathrooms, setBathrooms] = useState<string>('any');
  const [sqftRange, setSqftRange] = useState({ min: 0, max: 0 });
  const [yearBuiltRange, setYearBuiltRange] = useState({ min: 0, max: 0 });
  
  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState<'none' | 'daily' | 'weekly'>('daily');

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = () => {
    onSave({
      name: buyBoxName || `${selectedStates[0] || 'New'} - BuyBox`,
      description,
      isActive,
      criteria: {
        states: selectedStates,
        propertyTypes: selectedPropertyTypes.filter(t => t !== 'any') as any,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        minBedrooms: bedrooms !== 'any' ? parseInt(bedrooms) : undefined,
        minBathrooms: bathrooms !== 'any' ? parseFloat(bathrooms) : undefined,
        minSquareFeet: sqftRange.min || undefined,
        maxSquareFeet: sqftRange.max || undefined,
        minYearBuilt: yearBuiltRange.min || undefined,
      },
      requiredFields: {
        address: true,
        propertyType: true,
        estimatedValue: true,
        condition: true,
        photos: { required: true, minimum: 3 },
        ownerInfo: true,
        motivationLevel: true,
        notes: false
      }
    });
  };

  const isStep1Valid = buyBoxName.trim().length > 0;
  const isStep2Valid = true; // Market settings are optional

  const canProceed = step === 1 ? isStep1Valid : isStep2Valid;

  const togglePropertyType = (type: string) => {
    if (type === 'any') {
      setSelectedPropertyTypes(['any']);
    } else {
      setSelectedPropertyTypes(prev => {
        const filtered = prev.filter(t => t !== 'any');
        if (filtered.includes(type)) {
          const result = filtered.filter(t => t !== type);
          return result.length === 0 ? ['any'] : result;
        } else {
          return [...filtered, type];
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Progress value={(step / 2) * 100} className="h-2" />
        </div>
        <span className="text-sm text-content-secondary">Step {step} of 2</span>
      </div>

      {/* Step 1: Name Your BuyBox */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Name Your BuyBox
            </CardTitle>
            <CardDescription>
              Give your buy box a descriptive name to help you identify it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="buybox-name">BuyBox Name *</Label>
              <Input
                id="buybox-name"
                placeholder="e.g., Florida Single Family Deals"
                value={buyBoxName}
                onChange={(e) => setBuyBoxName(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Name is automatically generated from selected city if left blank
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe the types of deals you're looking for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div>
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when deals match this BuyBox
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Set Buying Goals by Market */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Location/Market */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-primary" />
                City or Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter city or address"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Search Radius</Label>
                  <span className="text-primary font-semibold">{searchRadius[0]} miles</span>
                </div>
                <Slider
                  min={25}
                  max={500}
                  step={25}
                  value={searchRadius}
                  onValueChange={setSearchRadius}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>25 mi</span>
                  <span>500 mi</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-primary" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={priceRange.min || ''}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Max Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="text"
                      placeholder="Any"
                      value={priceRange.max || ''}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Home className="h-4 w-4 text-primary" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Types Grid */}
              <div className="grid grid-cols-4 gap-2">
                {PROPERTY_TYPES.map(type => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={selectedPropertyTypes.includes(type.value) ? "default" : "outline"}
                    className="h-auto py-3"
                    onClick={() => togglePropertyType(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Bedrooms
                </Label>
                <div className="flex gap-2">
                  {['any', '0', '1+', '2+', '3+', '4+', '5+'].map(val => (
                    <Button
                      key={val}
                      type="button"
                      variant={bedrooms === val ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setBedrooms(val)}
                    >
                      {val === 'any' ? 'Any' : val}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bath className="h-4 w-4" />
                  Bathrooms
                </Label>
                <div className="flex gap-2">
                  {['any', '1+', '1.5+', '2+', '2.5+', '3+', '3.5+'].map(val => (
                    <Button
                      key={val}
                      type="button"
                      variant={bathrooms === val ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setBathrooms(val)}
                    >
                      {val === 'any' ? 'Any' : val}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Square Feet */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Square Feet (Min)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={sqftRange.min || ''}
                    onChange={(e) => setSqftRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Square Feet (Max)</Label>
                  <Input
                    type="text"
                    placeholder="Any"
                    value={sqftRange.max || ''}
                    onChange={(e) => setSqftRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Year Built */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Year Built (Min)
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={yearBuiltRange.min || ''}
                    onChange={(e) => setYearBuiltRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year Built (Max)</Label>
                  <Input
                    type="text"
                    placeholder="Any"
                    value={yearBuiltRange.max || ''}
                    onChange={(e) => setYearBuiltRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Receive Emails about new deals that fit my Buy Box</span>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Receive Texts about new deals that fit my Buy Box</span>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Digest Frequency</Label>
                <div className="flex gap-2">
                  {(['none', 'daily', 'weekly'] as const).map(freq => (
                    <Button
                      key={freq}
                      type="button"
                      variant={emailDigest === freq ? "default" : "outline"}
                      className="flex-1 capitalize"
                      onClick={() => setEmailDigest(freq)}
                    >
                      {freq === 'none' ? 'None' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={step === 1 ? onCancel : handleBack}
          className="gap-2"
        >
          {step === 1 ? (
            'Cancel'
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              Back
            </>
          )}
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="gap-2"
        >
          {step === 2 ? (
            <>
              <Check className="h-4 w-4" />
              Create BuyBox
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
