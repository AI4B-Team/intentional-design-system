import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Save, Eye, MapPin, DollarSign, Home, Wrench, Users } from 'lucide-react';
import { BuyBox } from '@/types/property-scout';

interface BuyBoxCreatorProps {
  onSave: (buyBox: Partial<BuyBox>) => void;
  onCancel?: () => void;
  existingBuyBox?: BuyBox;
  availableScouts?: { id: string; name: string; email: string }[];
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'multi_family', label: 'Multi Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' }
];

const CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'distressed', label: 'Distressed' }
];

export const BuyBoxCreator: React.FC<BuyBoxCreatorProps> = ({
  onSave,
  onCancel,
  existingBuyBox,
  availableScouts = []
}) => {
  const [buyBox, setBuyBox] = useState<Partial<BuyBox>>(existingBuyBox || {
    name: '',
    description: '',
    isActive: true,
    visibleToScouts: [],
    criteria: {},
    requiredFields: {
      address: true,
      propertyType: true,
      estimatedValue: false,
      condition: false,
      photos: { required: false, minimum: 0 },
      ownerInfo: false,
      motivationLevel: false,
      notes: false
    }
  });

  const [selectedStates, setSelectedStates] = useState<string[]>(buyBox.criteria?.states || []);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    buyBox.criteria?.propertyTypes || []
  );
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    buyBox.criteria?.conditions || []
  );
  const [priceRange, setPriceRange] = useState({
    min: buyBox.criteria?.minPrice || 0,
    max: buyBox.criteria?.maxPrice || 1000000
  });

  const updateCriteria = (field: string, value: any) => {
    setBuyBox(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        [field]: value
      }
    }));
  };

  const toggleScoutVisibility = (scoutId: string) => {
    setBuyBox(prev => ({
      ...prev,
      visibleToScouts: prev.visibleToScouts?.includes(scoutId)
        ? prev.visibleToScouts.filter(id => id !== scoutId)
        : [...(prev.visibleToScouts || []), scoutId]
    }));
  };

  const handleSave = () => {
    onSave({
      ...buyBox,
      criteria: {
        ...buyBox.criteria,
        states: selectedStates,
        propertyTypes: selectedPropertyTypes as any,
        conditions: selectedConditions as any,
        minPrice: priceRange.min,
        maxPrice: priceRange.max
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {existingBuyBox ? 'Edit Buy Box' : 'Create New Buy Box'}
          </CardTitle>
          <CardDescription>
            Define your investment criteria and required fields for property submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="buybox-name">Buy Box Name *</Label>
              <Input
                id="buybox-name"
                placeholder="e.g., Florida Single Family Deals"
                value={buyBox.name || ''}
                onChange={(e) => setBuyBox(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={buyBox.isActive}
                onCheckedChange={(checked) => setBuyBox(prev => ({ ...prev, isActive: checked }))}
              />
              <Badge variant={buyBox.isActive ? 'default' : 'secondary'}>
                {buyBox.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buybox-desc">Description</Label>
            <Textarea
              id="buybox-desc"
              placeholder="Describe this buy box..."
              value={buyBox.description || ''}
              onChange={(e) => setBuyBox(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="criteria" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="criteria">
            <MapPin className="h-4 w-4 mr-2" />
            Criteria
          </TabsTrigger>
          <TabsTrigger value="requirements">
            <Wrench className="h-4 w-4 mr-2" />
            Required Fields
          </TabsTrigger>
          <TabsTrigger value="scouts">
            <Users className="h-4 w-4 mr-2" />
            Scout Access
          </TabsTrigger>
        </TabsList>

        {/* Criteria Tab */}
        <TabsContent value="criteria" className="space-y-6 mt-6">
          {/* Location Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target States</Label>
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
                  {US_STATES.map(state => (
                    <Badge
                      key={state}
                      variant={selectedStates.includes(state) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedStates(prev =>
                          prev.includes(state)
                            ? prev.filter(s => s !== state)
                            : [...prev, state]
                        );
                      }}
                    >
                      {state}
                    </Badge>
                  ))}
                </div>
                {selectedStates.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedStates.length} state{selectedStates.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cities (comma-separated)</Label>
                  <Input
                    placeholder="Miami, Orlando, Tampa"
                    onChange={(e) => updateCriteria('cities', e.target.value.split(',').map(c => c.trim()).filter(Boolean))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zip Codes (comma-separated)</Label>
                  <Input
                    placeholder="33101, 33102, 33109"
                    onChange={(e) => updateCriteria('zipCodes', e.target.value.split(',').map(z => z.trim()).filter(Boolean))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                Property Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={selectedPropertyTypes.includes(type.value)}
                      onCheckedChange={(checked) => {
                        setSelectedPropertyTypes(prev =>
                          checked
                            ? [...prev, type.value]
                            : prev.filter(t => t !== type.value)
                        );
                      }}
                    />
                    <Label htmlFor={type.value} className="cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Price Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange.min.toLocaleString()}</span>
                  <span>${priceRange.max.toLocaleString()}</span>
                </div>
                <Slider
                  min={0}
                  max={2000000}
                  step={10000}
                  value={[priceRange.min, priceRange.max]}
                  onValueChange={([min, max]) => setPriceRange({ min, max })}
                  className="w-full"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Minimum Price</Label>
                  <Input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Price</Label>
                  <Input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Min Bedrooms</Label>
                <Input
                  type="number"
                  placeholder="3"
                  onChange={(e) => updateCriteria('minBedrooms', parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Bathrooms</Label>
                <Input
                  type="number"
                  placeholder="2"
                  onChange={(e) => updateCriteria('minBathrooms', parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Square Feet</Label>
                <Input
                  type="number"
                  placeholder="1500"
                  onChange={(e) => updateCriteria('minSquareFeet', parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Square Feet</Label>
                <Input
                  type="number"
                  placeholder="3000"
                  onChange={(e) => updateCriteria('maxSquareFeet', parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Year Built</Label>
                <Input
                  type="number"
                  placeholder="1990"
                  onChange={(e) => updateCriteria('minYearBuilt', parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Repair Cost</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  onChange={(e) => updateCriteria('maxRepairCost', parseInt(e.target.value) || undefined)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Condition */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acceptable Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {CONDITIONS.map(condition => (
                  <div key={condition.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`condition-${condition.value}`}
                      checked={selectedConditions.includes(condition.value)}
                      onCheckedChange={(checked) => {
                        setSelectedConditions(prev =>
                          checked
                            ? [...prev, condition.value]
                            : prev.filter(c => c !== condition.value)
                        );
                      }}
                    />
                    <Label htmlFor={`condition-${condition.value}`} className="cursor-pointer">
                      {condition.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Required Fields Tab */}
        <TabsContent value="requirements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Required Submission Fields</CardTitle>
              <CardDescription>
                Select which fields scouts MUST complete before they can submit a lead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(buyBox.requiredFields || {}).map(([field, value]) => {
                if (field === 'photos') {
                  const photoReq = value as { required: boolean; minimum?: number };
                  return (
                    <div key={field} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={photoReq.required}
                          onCheckedChange={(checked) => {
                            setBuyBox(prev => ({
                              ...prev,
                              requiredFields: {
                                ...prev.requiredFields!,
                                photos: { ...photoReq, required: checked }
                              }
                            }));
                          }}
                        />
                        <div>
                          <Label className="capitalize">Photos</Label>
                          {photoReq.required && (
                            <div className="mt-2 flex items-center gap-2">
                              <Label className="text-sm text-muted-foreground">Minimum:</Label>
                              <Input
                                type="number"
                                min="1"
                                value={photoReq.minimum || 1}
                                onChange={(e) => {
                                  setBuyBox(prev => ({
                                    ...prev,
                                    requiredFields: {
                                      ...prev.requiredFields!,
                                      photos: { ...photoReq, minimum: parseInt(e.target.value) || 1 }
                                    }
                                  }));
                                }}
                                className="w-20"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={photoReq.required ? 'default' : 'secondary'}>
                        {photoReq.required ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                  );
                }

                return (
                  <div key={field} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={value as boolean}
                        onCheckedChange={(checked) => {
                          setBuyBox(prev => ({
                            ...prev,
                            requiredFields: {
                              ...prev.requiredFields!,
                              [field]: checked
                            }
                          }));
                        }}
                      />
                      <Label className="capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                    <Badge variant={value ? 'default' : 'secondary'}>
                      {value ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scout Access Tab */}
        <TabsContent value="scouts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scout Visibility</CardTitle>
              <CardDescription>
                Select which scouts can see and use this buy box
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableScouts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No scouts available yet</p>
                  <p className="text-sm mt-1">Invite scouts to your organization first</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableScouts.map(scout => (
                    <div
                      key={scout.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={buyBox.visibleToScouts?.includes(scout.id)}
                          onCheckedChange={() => toggleScoutVisibility(scout.id)}
                        />
                        <div>
                          <p className="font-medium">{scout.name}</p>
                          <p className="text-sm text-muted-foreground">{scout.email}</p>
                        </div>
                      </div>
                      {buyBox.visibleToScouts?.includes(scout.id) && (
                        <Badge>
                          <Eye className="h-3 w-3 mr-1" />
                          Visible
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="outline" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleSave}
          disabled={!buyBox.name?.trim()}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Buy Box
        </Button>
      </div>
    </div>
  );
};
