import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useSubmitInterest } from '@/hooks/usePublicDeal';
import { toast } from 'sonner';
import { z } from 'zod';

interface DealInterestFormProps {
  dealId: string;
  userId: string;
}

const formSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().max(20).optional(),
  interestType: z.enum(['viewed', 'interested', 'very_interested', 'made_offer']),
  message: z.string().trim().max(1000).optional(),
  offerAmount: z.number().positive().optional(),
  canProvidePof: z.boolean().optional(),
  canCloseQuickly: z.boolean().optional(),
});

export function DealInterestForm({ dealId, userId }: DealInterestFormProps) {
  const { submitInterest, submitting } = useSubmitInterest();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestType: 'interested',
    message: '',
    offerAmount: '',
    canProvidePof: false,
    canCloseQuickly: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validated = formSchema.parse({
        ...formData,
        offerAmount: formData.offerAmount ? parseFloat(formData.offerAmount) : undefined,
      });

      const result = await submitInterest({
        dealId,
        userId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        interestType: validated.interestType,
        message: validated.message,
        offerAmount: validated.offerAmount,
        canProvidePof: validated.canProvidePof,
        canCloseQuickly: validated.canCloseQuickly,
      });

      if (result.success) {
        setSubmitted(true);
        toast.success('Interest submitted successfully!');
      } else {
        toast.error(result.error || 'Failed to submit interest');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  if (submitted) {
    return (
      <Card id="interest-form">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Thank You for Your Interest!
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We've received your inquiry and will be in touch shortly. 
              Keep an eye on your email for updates on this deal.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="interest-form">
      <CardHeader>
        <CardTitle>Interested in This Deal?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Smith"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Interest Level</Label>
            <RadioGroup
              value={formData.interestType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, interestType: value }))}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                <RadioGroupItem value="viewed" id="viewed" />
                <span className="text-sm">Just browsing</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                <RadioGroupItem value="interested" id="interested" />
                <span className="text-sm">Interested - send me details</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                <RadioGroupItem value="very_interested" id="very_interested" />
                <span className="text-sm">Very interested - let's talk today</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-surface-secondary/50 transition-colors">
                <RadioGroupItem value="made_offer" id="made_offer" />
                <span className="text-sm">Ready to make an offer</span>
              </label>
            </RadioGroup>
          </div>

          {formData.interestType === 'made_offer' && (
            <div className="space-y-2">
              <Label htmlFor="offerAmount">Offer Amount</Label>
              <Input
                id="offerAmount"
                type="number"
                value={formData.offerAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, offerAmount: e.target.value }))}
                placeholder="175000"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Any questions or offer details..."
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={formData.canProvidePof}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, canProvidePof: checked as boolean }))
                }
              />
              <span className="text-sm text-muted-foreground">I can provide proof of funds</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={formData.canCloseQuickly}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, canCloseQuickly: checked as boolean }))
                }
              />
              <span className="text-sm text-muted-foreground">I can close within 14 days</span>
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? 'Submitting...' : 'Submit Interest'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
