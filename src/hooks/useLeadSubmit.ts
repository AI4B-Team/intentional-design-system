import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LeadFormData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  propertyAddress: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyCondition?: string;
  sellTimeline?: string;
  reasonSelling?: string;
  notes?: string;
}

interface LeadSubmitResult {
  success: boolean;
  leadId?: string;
  message?: string;
  companyPhone?: string;
}

export function useLeadSubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LeadSubmitResult | null>(null);

  const submitLead = async (websiteId: string, formData: LeadFormData): Promise<LeadSubmitResult> => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Get UTM parameters from URL
      const params = new URLSearchParams(window.location.search);
      
      const { data, error: invokeError } = await supabase.functions.invoke('submit-seller-lead', {
        body: {
          websiteId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          fullName: formData.fullName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
          email: formData.email,
          phone: formData.phone,
          propertyAddress: formData.propertyAddress,
          propertyCity: formData.propertyCity,
          propertyState: formData.propertyState,
          propertyZip: formData.propertyZip,
          propertyCondition: formData.propertyCondition,
          sellTimeline: formData.sellTimeline,
          reasonSelling: formData.reasonSelling,
          notes: formData.notes,
          sourceUrl: window.location.href,
          utmSource: params.get('utm_source') || undefined,
          utmMedium: params.get('utm_medium') || undefined,
          utmCampaign: params.get('utm_campaign') || undefined,
          utmContent: params.get('utm_content') || undefined
        }
      });
      
      if (invokeError) {
        throw new Error(invokeError.message || 'Failed to submit lead');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      setSuccess(true);
      setResult(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit. Please try again or call us directly.';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitting(false);
    setSuccess(false);
    setError(null);
    setResult(null);
  };

  return { 
    submitLead, 
    submitting, 
    success, 
    error, 
    result,
    reset 
  };
}
