import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  MapPin, 
  Home, 
  DollarSign, 
  User, 
  AlertCircle, 
  CheckCircle, 
  Camera,
  X,
  Sparkles
} from 'lucide-react';
import { PropertyLead, BuyBox } from '@/types/property-scout';

interface LeadSubmissionFormProps {
  scoutId: string;
  availableBuyBoxes: BuyBox[];
  onSubmit: (lead: Partial<PropertyLead>) => Promise<void>;
  onSaveDraft?: (lead: Partial<PropertyLead>) => void;
  draftLead?: Partial<PropertyLead>;
}

const US_STATES = ['FL', 'TX', 'CA', 'NY', 'GA', 'NC', 'AZ', 'TN', 'OH', 'PA', 'IL', 'MI', 'NJ', 'VA', 'WA'];

export const LeadSubmissionForm: React.FC<LeadSubmissionFormProps> = ({
  scoutId,
  availableBuyBoxes,
  onSubmit,
  onSaveDraft,
  draftLead
}) => {
  const [lead, setLead] = useState<Partial<PropertyLead>>(draftLead || {
    scoutId,
    address: { street: '', city: '', state: '', zipCode: '' },
    photos: [],
    source: 'manual_entry'
  });

  const [selectedBuyBox, setSelectedBuyBox] = useState<BuyBox | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [buyBoxMatch, setBuyBoxMatch] = useState<{ matches: boolean; score: number; issues: string[] }>({
    matches: true,
    score: 100,
    issues: []
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (onSaveDraft && Object.keys(lead).length > 2) {
        onSaveDraft(lead);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [lead, onSaveDraft]);

  // Real-time buy box validation
  useEffect(() => {
    if (selectedBuyBox && lead.address?.zipCode && lead.estimatedValue) {
      const validation = validateAgainstBuyBox(lead, selectedBuyBox);
      setBuyBoxMatch(validation);
    }
  }, [lead, selectedBuyBox]);

  // Calculate form completion
  useEffect(() => {
    if (selectedBuyBox) {
      const completion = calculateCompletionPercentage(lead, selectedBuyBox);
      setCompletionPercentage(completion);
    }
  }, [lead, selectedBuyBox, uploadedPhotos]);

  const validateAgainstBuyBox = (
    leadData: Partial<PropertyLead>,
    buyBox: BuyBox
  ): { matches: boolean; score: number; issues: string[] } => {
    const issues: string[] = [];
    let score = 100;

    const { criteria } = buyBox;

    if (criteria.minPrice && leadData.estimatedValue && leadData.estimatedValue < criteria.minPrice) {
      issues.push(`Price $${leadData.estimatedValue.toLocaleString()} is below minimum $${criteria.minPrice.toLocaleString()}`);
      score -= 20;
    }
    if (criteria.maxPrice && leadData.estimatedValue && leadData.estimatedValue > criteria.maxPrice) {
      issues.push(`Price $${leadData.estimatedValue.toLocaleString()} exceeds maximum $${criteria.maxPrice.toLocaleString()}`);
      score -= 20;
    }

    if (criteria.states && criteria.states.length > 0 && leadData.address?.state) {
      if (!criteria.states.includes(leadData.address.state)) {
        issues.push(`State ${leadData.address.state} is not in target states`);
        score -= 15;
      }
    }

    if (criteria.propertyTypes && criteria.propertyTypes.length > 0 && leadData.propertyType) {
      if (!criteria.propertyTypes.includes(leadData.propertyType)) {
        issues.push(`Property type ${leadData.propertyType} is not in accepted types`);
        score -= 25;
      }
    }

    if (criteria.minBedrooms && leadData.propertyDetails?.bedrooms) {
      if (leadData.propertyDetails.bedrooms < criteria.minBedrooms) {
        issues.push(`Bedrooms ${leadData.propertyDetails.bedrooms} is below minimum ${criteria.minBedrooms}`);
        score -= 10;
      }
    }

    if (criteria.minSquareFeet && leadData.propertyDetails?.squareFeet) {
      if (leadData.propertyDetails.squareFeet < criteria.minSquareFeet) {
        issues.push(`Square feet ${leadData.propertyDetails.squareFeet} is below minimum ${criteria.minSquareFeet}`);
        score -= 10;
      }
    }

    const matches = score >= 70 && issues.length === 0;
    return { matches, score: Math.max(0, score), issues };
  };

  const calculateCompletionPercentage = (
    leadData: Partial<PropertyLead>,
    buyBox: BuyBox
  ): number => {
    const required = buyBox.requiredFields;
    let completed = 0;
    let total = 0;

    if (required.address) {
      total++;
      if (leadData.address?.street && leadData.address?.city && leadData.address?.state && leadData.address?.zipCode) {
        completed++;
      }
    }

    if (required.propertyType) {
      total++;
      if (leadData.propertyType) completed++;
    }

    if (required.estimatedValue) {
      total++;
      if (leadData.estimatedValue) completed++;
    }

    if (required.condition) {
      total++;
      if (leadData.condition) completed++;
    }

    if (required.photos.required) {
      total++;
      const minPhotos = required.photos.minimum || 1;
      if (uploadedPhotos.length >= minPhotos) completed++;
    }

    if (required.ownerInfo) {
      total++;
      if (leadData.ownerInfo?.name || leadData.ownerInfo?.phone) completed++;
    }

    if (required.motivationLevel) {
      total++;
      if (leadData.ownerInfo?.motivationLevel) completed++;
    }

    if (required.notes) {
      total++;
      if (leadData.scoutNotes) completed++;
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedBuyBox) {
      errors.buyBox = 'Please select a buy box';
    }

    if (selectedBuyBox) {
      const { requiredFields } = selectedBuyBox;

      if (requiredFields.address) {
        if (!lead.address?.street) errors.street = 'Street address is required';
        if (!lead.address?.city) errors.city = 'City is required';
        if (!lead.address?.state) errors.state = 'State is required';
        if (!lead.address?.zipCode) errors.zipCode = 'Zip code is required';
      }

      if (requiredFields.propertyType && !lead.propertyType) {
        errors.propertyType = 'Property type is required';
      }

      if (requiredFields.estimatedValue && !lead.estimatedValue) {
        errors.estimatedValue = 'Estimated value is required';
      }

      if (requiredFields.condition && !lead.condition) {
        errors.condition = 'Condition is required';
      }

      if (requiredFields.photos.required) {
        const minPhotos = requiredFields.photos.minimum || 1;
        if (uploadedPhotos.length < minPhotos) {
          errors.photos = `At least ${minPhotos} photo${minPhotos > 1 ? 's' : ''} required`;
        }
      }

      if (requiredFields.ownerInfo && !lead.ownerInfo?.name && !lead.ownerInfo?.phone) {
        errors.ownerInfo = 'Owner information is required';
      }

      if (requiredFields.motivationLevel && !lead.ownerInfo?.motivationLevel) {
        errors.motivationLevel = 'Motivation level is required';
      }

      if (requiredFields.notes && !lead.scoutNotes) {
        errors.notes = 'Notes are required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submissionData: Partial<PropertyLead> = {
        ...lead,
        buyBoxId: selectedBuyBox?.id,
        buyBoxMatches: buyBoxMatch.matches,
        matchScore: buyBoxMatch.score,
        status: 'pending_review',
        submittedAt: new Date().toISOString(),
        photos: uploadedPhotos.map((file, i) => ({
          url: URL.createObjectURL(file),
          caption: `Photo ${i + 1}`,
          uploadedAt: new Date().toISOString()
        }))
      };

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Buy Box Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Submit New Property Lead
          </CardTitle>
          <CardDescription>
            Complete all required fields to submit your lead
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Buy Box *</Label>
            <Select
              value={lead.buyBoxId}
              onValueChange={(value) => {
                const buyBox = availableBuyBoxes.find(bb => bb.id === value);
                setSelectedBuyBox(buyBox || null);
                setLead(prev => ({ ...prev, buyBoxId: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a buy box..." />
              </SelectTrigger>
              <SelectContent>
                {availableBuyBoxes.map(bb => (
                  <SelectItem key={bb.id} value={bb.id}>
                    {bb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.buyBox && (
              <p className="text-sm text-destructive">{validationErrors.buyBox}</p>
            )}
          </div>

          {selectedBuyBox && (
            <>
              {/* Completion Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Form Completion</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} />
              </div>

              {/* Buy Box Match Indicator */}
              {lead.estimatedValue && (
                <Alert variant={buyBoxMatch.matches ? 'default' : 'destructive'}>
                  <div className="flex items-start gap-3">
                    {buyBoxMatch.matches ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">Buy Box Match: {buyBoxMatch.score}%</p>
                      {buyBoxMatch.issues.length > 0 && (
                        <ul className="mt-1 text-sm space-y-1">
                          {buyBoxMatch.issues.map((issue, i) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      )}
                      {buyBoxMatch.matches && (
                        <p className="text-sm text-muted-foreground">
                          This property matches the buy box criteria!
                        </p>
                      )}
                    </div>
                  </div>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedBuyBox && (
        <>
          {/* Property Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Property Address
                {selectedBuyBox.requiredFields.address && (
                  <Badge variant="destructive" className="ml-2">Required</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address *</Label>
                <Input
                  placeholder="123 Main Street"
                  value={lead.address?.street || ''}
                  onChange={(e) => setLead(prev => ({
                    ...prev,
                    address: { ...prev.address!, street: e.target.value }
                  }))}
                />
                {validationErrors.street && (
                  <p className="text-sm text-destructive">{validationErrors.street}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input
                    placeholder="Miami"
                    value={lead.address?.city || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      address: { ...prev.address!, city: e.target.value }
                    }))}
                  />
                  {validationErrors.city && (
                    <p className="text-sm text-destructive">{validationErrors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select
                    value={lead.address?.state}
                    onValueChange={(value) => setLead(prev => ({
                      ...prev,
                      address: { ...prev.address!, state: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.state && (
                    <p className="text-sm text-destructive">{validationErrors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Zip Code *</Label>
                  <Input
                    placeholder="33101"
                    value={lead.address?.zipCode || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      address: { ...prev.address!, zipCode: e.target.value }
                    }))}
                  />
                  {validationErrors.zipCode && (
                    <p className="text-sm text-destructive">{validationErrors.zipCode}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Property Type
                    {selectedBuyBox.requiredFields.propertyType && <span className="text-destructive"> *</span>}
                  </Label>
                  <Select
                    value={lead.propertyType}
                    onValueChange={(value: any) => setLead(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_family">Single Family</SelectItem>
                      <SelectItem value="multi_family">Multi Family</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.propertyType && (
                    <p className="text-sm text-destructive">{validationErrors.propertyType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Condition
                    {selectedBuyBox.requiredFields.condition && <span className="text-destructive"> *</span>}
                  </Label>
                  <Select
                    value={lead.condition}
                    onValueChange={(value: any) => setLead(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="distressed">Distressed</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.condition && (
                    <p className="text-sm text-destructive">{validationErrors.condition}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={lead.propertyDetails?.bedrooms || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      propertyDetails: {
                        ...prev.propertyDetails,
                        bedrooms: parseInt(e.target.value) || undefined
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="2"
                    value={lead.propertyDetails?.bathrooms || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      propertyDetails: {
                        ...prev.propertyDetails,
                        bathrooms: parseFloat(e.target.value) || undefined
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Square Feet</Label>
                  <Input
                    type="number"
                    placeholder="1500"
                    value={lead.propertyDetails?.squareFeet || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      propertyDetails: {
                        ...prev.propertyDetails,
                        squareFeet: parseInt(e.target.value) || undefined
                      }
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Year Built</Label>
                  <Input
                    type="number"
                    placeholder="1990"
                    value={lead.propertyDetails?.yearBuilt || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      propertyDetails: {
                        ...prev.propertyDetails,
                        yearBuilt: parseInt(e.target.value) || undefined
                      }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lot Size (sq ft)</Label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={lead.propertyDetails?.lotSize || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      propertyDetails: {
                        ...prev.propertyDetails,
                        lotSize: parseInt(e.target.value) || undefined
                      }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valuation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Valuation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Estimated Value
                    {selectedBuyBox.requiredFields.estimatedValue && <span className="text-destructive"> *</span>}
                  </Label>
                  <Input
                    type="number"
                    placeholder="250000"
                    value={lead.estimatedValue || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      estimatedValue: parseInt(e.target.value) || undefined
                    }))}
                  />
                  {validationErrors.estimatedValue && (
                    <p className="text-sm text-destructive">{validationErrors.estimatedValue}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Estimated ARV</Label>
                  <Input
                    type="number"
                    placeholder="320000"
                    value={lead.estimatedARV || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      estimatedARV: parseInt(e.target.value) || undefined
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Estimated Repair Cost</Label>
                  <Input
                    type="number"
                    placeholder="40000"
                    value={lead.estimatedRepairCost || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      estimatedRepairCost: parseInt(e.target.value) || undefined
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estimated Equity</Label>
                  <Input
                    type="number"
                    placeholder="70000"
                    value={lead.estimatedEquity || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      estimatedEquity: parseInt(e.target.value) || undefined
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Owner Information
                {selectedBuyBox.requiredFields.ownerInfo && (
                  <Badge variant="destructive" className="ml-2">Required</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input
                    placeholder="John Smith"
                    value={lead.ownerInfo?.name || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      ownerInfo: { ...prev.ownerInfo, name: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Owner Phone</Label>
                  <Input
                    placeholder="(555) 123-4567"
                    value={lead.ownerInfo?.phone || ''}
                    onChange={(e) => setLead(prev => ({
                      ...prev,
                      ownerInfo: { ...prev.ownerInfo, phone: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Owner Email</Label>
                <Input
                  type="email"
                  placeholder="owner@email.com"
                  value={lead.ownerInfo?.email || ''}
                  onChange={(e) => setLead(prev => ({
                    ...prev,
                    ownerInfo: { ...prev.ownerInfo, email: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Motivation Level
                  {selectedBuyBox.requiredFields.motivationLevel && <span className="text-destructive"> *</span>}
                </Label>
                <Select
                  value={lead.ownerInfo?.motivationLevel}
                  onValueChange={(value: any) => setLead(prev => ({
                    ...prev,
                    ownerInfo: { ...prev.ownerInfo, motivationLevel: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select motivation level..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Very motivated to sell</SelectItem>
                    <SelectItem value="medium">Medium - Considering offers</SelectItem>
                    <SelectItem value="low">Low - Just exploring options</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.motivationLevel && (
                  <p className="text-sm text-destructive">{validationErrors.motivationLevel}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Motivation Reason</Label>
                <Textarea
                  placeholder="Why is the owner motivated to sell?"
                  value={lead.ownerInfo?.motivationReason || ''}
                  onChange={(e) => setLead(prev => ({
                    ...prev,
                    ownerInfo: { ...prev.ownerInfo, motivationReason: e.target.value }
                  }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4 text-primary" />
                Property Photos
                {selectedBuyBox.requiredFields.photos.required && (
                  <Badge variant="destructive" className="ml-2">
                    Required ({selectedBuyBox.requiredFields.photos.minimum || 1}+ photos)
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/30"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB each</p>
                  </div>
                  <Input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </Label>
                {validationErrors.photos && (
                  <p className="text-sm text-destructive mt-2">{validationErrors.photos}</p>
                )}
              </div>

              {uploadedPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedPhotos.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Additional Notes
                {selectedBuyBox.requiredFields.notes && (
                  <Badge variant="destructive" className="ml-2">Required</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any additional notes about this property, neighborhood, or deal..."
                value={lead.scoutNotes || ''}
                onChange={(e) => setLead(prev => ({ ...prev, scoutNotes: e.target.value }))}
                rows={5}
              />
              {validationErrors.notes && (
                <p className="text-sm text-destructive mt-2">{validationErrors.notes}</p>
              )}
            </CardContent>
          </Card>

          {/* Submit Actions */}
          <div className="flex justify-between items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSaveDraft && onSaveDraft(lead)}
            >
              Save Draft
            </Button>

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting || completionPercentage < 100}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Submit Lead
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
