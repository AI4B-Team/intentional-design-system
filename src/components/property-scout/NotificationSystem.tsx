import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Bell, Check, Clock, Loader2 } from 'lucide-react';
import { LeadStatus, PropertyLead } from '@/types/property-scout';

interface NotificationTemplate {
  id: string;
  name: string;
  trigger: LeadStatus;
  subject: string;
  body: string;
}

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'qualified',
    name: 'Lead Qualified',
    trigger: 'qualified',
    subject: 'Great News! Your Lead Has Been Qualified 🎉',
    body: `Hi {{scout_name}},

Excellent work! Your property submission at {{address}} has been qualified and is moving forward in our pipeline.

Property Details:
- Address: {{address}}
- Estimated Value: {{estimated_value}}
- Current Status: Qualified

We'll keep you updated as this deal progresses. Keep up the great work finding these gems!

Best regards,
{{investor_name}}`
  },
  {
    id: 'contacted_owner',
    name: 'Owner Contacted',
    trigger: 'contacted_owner',
    subject: 'Update: We\'ve Contacted the Property Owner 📞',
    body: `Hi {{scout_name}},

Quick update on your lead at {{address}} - we've successfully made contact with the property owner!

Next Steps:
- Gathering more information about their motivation
- Scheduling property walkthrough
- Preparing initial offer analysis

This is moving in the right direction. We'll keep you posted!

Best regards,
{{investor_name}}`
  },
  {
    id: 'offer_made',
    name: 'Offer Made',
    trigger: 'offer_made',
    subject: 'Exciting Update: Offer Submitted! 💰',
    body: `Hi {{scout_name}},

Fantastic news! We've submitted an offer on the property you found at {{address}}.

Offer Details:
- Offer Amount: {{offer_amount}}
- Terms: {{offer_terms}}
- Expected Response: Within 48 hours

Your efforts in finding this deal are greatly appreciated. Fingers crossed!

Best regards,
{{investor_name}}`
  },
  {
    id: 'under_contract',
    name: 'Under Contract',
    trigger: 'under_contract',
    subject: 'ACCEPTED! Property Under Contract 🏠',
    body: `Hi {{scout_name}},

AMAZING NEWS! The property at {{address}} is now under contract!

Contract Details:
- Purchase Price: {{purchase_price}}
- Closing Date: {{closing_date}}
- Your Commission: {{commission_amount}}

This wouldn't have happened without your sharp eye. Great job!

Best regards,
{{investor_name}}`
  },
  {
    id: 'closed',
    name: 'Deal Closed',
    trigger: 'closed',
    subject: 'WE CLOSED! Your Commission is Ready 💵',
    body: `Hi {{scout_name}},

Congratulations! The property at {{address}} has successfully closed!

Deal Summary:
- Final Purchase Price: {{purchase_price}}
- Your Commission: {{commission_amount}}
- Payment Method: {{payment_method}}
- Payment Date: {{payment_date}}

Thank you for bringing us this incredible deal. Let's find more!

Best regards,
{{investor_name}}`
  },
  {
    id: 'disqualified',
    name: 'Lead Disqualified',
    trigger: 'disqualified',
    subject: 'Update on Your Property Submission',
    body: `Hi {{scout_name}},

Thank you for submitting the property at {{address}}. After careful review, we've determined this one isn't the right fit for our current investment criteria.

Reason:
{{disqualification_reason}}

Don't be discouraged! Every submission helps you learn what we're looking for. Keep the leads coming!

Best regards,
{{investor_name}}`
  }
];

interface NotificationSystemProps {
  lead: PropertyLead;
  onSendNotification: (template: NotificationTemplate, customMessage?: string) => Promise<void>;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  lead,
  onSendNotification
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getCurrentStatusTemplates = () => {
    return DEFAULT_TEMPLATES.filter(t => t.trigger === lead.status);
  };

  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/{{scout_name}}/g, lead.scoutName)
      .replace(/{{address}}/g, `${lead.address.street}, ${lead.address.city}, ${lead.address.state}`)
      .replace(/{{estimated_value}}/g, lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : 'TBD')
      .replace(/{{investor_name}}/g, 'Your Investment Team')
      .replace(/{{offer_amount}}/g, '$XXX,XXX')
      .replace(/{{offer_terms}}/g, 'Cash offer, 21-day close')
      .replace(/{{purchase_price}}/g, lead.estimatedValue ? `$${lead.estimatedValue.toLocaleString()}` : 'TBD')
      .replace(/{{closing_date}}/g, new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString())
      .replace(/{{commission_amount}}/g, '$X,XXX')
      .replace(/{{payment_method}}/g, 'Direct Deposit')
      .replace(/{{payment_date}}/g, new Date().toLocaleDateString())
      .replace(/{{disqualification_reason}}/g, 'Property does not meet current buy box criteria');
  };

  const handleSend = async () => {
    if (!selectedTemplate && !customMessage) return;

    setIsSending(true);
    try {
      await onSendNotification(selectedTemplate!, customMessage || undefined);
      setCustomMessage('');
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to send notification:', error);
    } finally {
      setIsSending(false);
    }
  };

  const availableTemplates = getCurrentStatusTemplates();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notify Scout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scout Info */}
          <div className="p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{lead.scoutName}</p>
                <p className="text-sm text-muted-foreground">{lead.scoutEmail}</p>
              </div>
              <Badge variant="secondary">
                <Check className="w-3 h-3 mr-1" />
                Active Scout
              </Badge>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Notification Template
            </label>
            {availableTemplates.length > 0 ? (
              <Select
                value={selectedTemplate?.id || ''}
                onValueChange={(value) => {
                  const template = DEFAULT_TEMPLATES.find(t => t.id === value);
                  setSelectedTemplate(template || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  No automatic templates available for current status "{lead.status.replace(/_/g, ' ')}". 
                  You can still send a custom message below.
                </p>
              </div>
            )}
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Subject Line:</p>
                  <p className="font-medium">{replacePlaceholders(selectedTemplate.subject)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message Body:</p>
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {replacePlaceholders(selectedTemplate.body)}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Add Custom Message (Optional)
                </label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Add any personalized notes or additional information..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* No Template - Custom Message Only */}
          {!selectedTemplate && availableTemplates.length === 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Custom Message *
              </label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your message to the scout..."
                rows={6}
              />
            </div>
          )}

          {/* Send Button */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTemplate(null);
                setCustomMessage('');
              }}
            >
              Clear
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || (!selectedTemplate && !customMessage)}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {lead.lastScoutNotification ? (
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm">Last notified</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(lead.lastScoutNotification).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No notifications sent yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
