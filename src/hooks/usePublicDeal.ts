import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface DispoPhoto {
  url: string;
  caption?: string;
  is_primary?: boolean;
  order?: number;
}

export interface DispoDocument {
  name: string;
  url: string;
  type: string;
  requires_verification?: boolean;
}

export interface CompData {
  address: string;
  sale_price: number;
  sale_date: string;
  sqft?: number;
  beds?: number;
  baths?: number;
  distance_miles?: number;
}

export interface DispoDeal {
  id: string;
  user_id: string;
  property_id: string | null;
  title: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  county: string | null;
  neighborhood: string | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_sqft: number | null;
  year_built: number | null;
  stories: number | null;
  garage: string | null;
  pool: boolean | null;
  asking_price: number;
  arv: number | null;
  repair_estimate: number | null;
  equity_amount: number | null;
  equity_percentage: number | null;
  price_per_sqft: number | null;
  assignment_fee: number | null;
  show_assignment_fee: boolean | null;
  contract_price: number | null;
  description: string | null;
  investment_highlights: string[] | null;
  repair_details: string | null;
  comps_summary: string | null;
  comps_data: CompData[];
  photos: DispoPhoto[];
  video_url: string | null;
  virtual_tour_url: string | null;
  documents: DispoDocument[];
  earnest_money_required: number | null;
  closing_timeline: string | null;
  financing_allowed: string[] | null;
  assignment_or_double: boolean | null;
  status: string | null;
  visibility: string | null;
  password_protected: boolean | null;
  published_at: string | null;
  expires_at: string | null;
  under_contract_at: string | null;
  sold_at: string | null;
  view_count: number | null;
  unique_views: number | null;
  interest_count: number | null;
  inquiry_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DispoSettings {
  id: string;
  user_id: string;
  company_name: string | null;
  company_logo_url: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  default_theme: string | null;
  primary_color: string | null;
  accent_color: string | null;
  default_earnest_money: number | null;
  default_closing_timeline: string | null;
  default_financing_allowed: string[] | null;
  require_registration: boolean | null;
  require_proof_of_funds: boolean | null;
  disclaimer_text: string | null;
}

export function usePublicDeal(slug: string | undefined) {
  const [deal, setDeal] = useState<DispoDeal | null>(null);
  const [settings, setSettings] = useState<DispoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function fetchDeal() {
      setLoading(true);
      setError(null);

      try {
        // Fetch deal by slug
        const { data: dealData, error: dealError } = await supabase
          .from('dispo_deals')
          .select('*')
          .eq('slug', slug)
          .single();

        if (dealError) {
          if (dealError.code === 'PGRST116') {
            setError('Deal not found');
          } else {
            setError('Failed to load deal');
          }
          setLoading(false);
          return;
        }

        // Check if deal is accessible
        if (dealData.status !== 'active' && dealData.status !== 'under_contract' && dealData.status !== 'sold') {
          setError('This deal is not currently available');
          setLoading(false);
          return;
        }

        // Parse JSON fields
        const parsedDeal: DispoDeal = {
          ...dealData,
          photos: parseJsonArray<DispoPhoto>(dealData.photos),
          documents: parseJsonArray<DispoDocument>(dealData.documents),
          comps_data: parseJsonArray<CompData>(dealData.comps_data),
        };

        setDeal(parsedDeal);

        // Fetch seller's dispo settings
        const { data: settingsData } = await supabase
          .from('dispo_settings')
          .select('*')
          .eq('user_id', dealData.user_id)
          .single();

        if (settingsData) {
          setSettings(settingsData as DispoSettings);
        }

        // Track view (don't await - fire and forget)
        trackView(dealData.id);

        // Increment view count
        supabase
          .from('dispo_deals')
          .update({ view_count: (dealData.view_count || 0) + 1 })
          .eq('id', dealData.id)
          .then();

      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDeal();
  }, [slug]);

  return { deal, settings, loading, error };
}

function parseJsonArray<T>(json: Json | null): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  return [];
}

async function trackView(dealId: string) {
  const visitorId = getOrCreateVisitorId();
  
  await supabase.from('deal_views').insert({
    deal_id: dealId,
    visitor_id: visitorId,
    referrer: document.referrer || null,
    utm_source: getUrlParam('utm_source'),
    utm_medium: getUrlParam('utm_medium'),
    utm_campaign: getUrlParam('utm_campaign'),
    user_agent: navigator.userAgent,
  });
}

function getOrCreateVisitorId(): string {
  const key = 'dispo_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function getUrlParam(name: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export function useSubmitInterest() {
  const [submitting, setSubmitting] = useState(false);

  const submitInterest = useCallback(async (data: {
    dealId: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    interestType: string;
    message?: string;
    canProvidePof?: boolean;
    canCloseQuickly?: boolean;
    offerAmount?: number;
  }) => {
    setSubmitting(true);

    try {
      const { error } = await supabase.from('deal_interests').insert({
        deal_id: data.dealId,
        user_id: data.userId,
        guest_name: data.name,
        guest_email: data.email,
        guest_phone: data.phone || null,
        interest_type: data.interestType,
        message: data.message || null,
        offer_amount: data.offerAmount || null,
        source: 'direct',
      });

      if (error) throw error;

      // Update deal interest count
      const { data: dealData } = await supabase
        .from('dispo_deals')
        .select('interest_count')
        .eq('id', data.dealId)
        .single();

      if (dealData) {
        await supabase
          .from('dispo_deals')
          .update({ interest_count: (dealData.interest_count || 0) + 1 })
          .eq('id', data.dealId);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit interest' };
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitInterest, submitting };
}
