import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SellerWebsite = Database["public"]["Tables"]["seller_websites"]["Row"];

export async function getPublicWebsite(slug: string): Promise<SellerWebsite | null> {
  const { data, error } = await supabase
    .from('seller_websites')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  
  // Increment view count
  await supabase
    .from('seller_websites')
    .update({ total_views: (data.total_views || 0) + 1 })
    .eq('id', data.id);

  return data;
}

export async function trackWebsiteEvent(
  websiteId: string,
  eventType: string,
  pageUrl: string,
  metadata?: {
    visitorId?: string;
    sessionId?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
  }
) {
  await supabase.from('website_analytics').insert({
    website_id: websiteId,
    event_type: eventType,
    page_url: pageUrl,
    visitor_id: metadata?.visitorId,
    session_id: metadata?.sessionId,
    referrer: metadata?.referrer,
    utm_source: metadata?.utmSource,
    utm_medium: metadata?.utmMedium,
    utm_campaign: metadata?.utmCampaign,
    device_type: metadata?.deviceType,
    browser: metadata?.browser,
    os: metadata?.os,
  });
}

export async function submitSellerLead(
  websiteId: string,
  userId: string,
  leadData: {
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
    howHeard?: string;
    sourceUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
  }
) {
  const { data, error } = await supabase.from('seller_leads').insert({
    website_id: websiteId,
    user_id: userId,
    first_name: leadData.firstName,
    last_name: leadData.lastName,
    full_name: leadData.fullName,
    email: leadData.email,
    phone: leadData.phone,
    property_address: leadData.propertyAddress,
    property_city: leadData.propertyCity,
    property_state: leadData.propertyState,
    property_zip: leadData.propertyZip,
    property_condition: leadData.propertyCondition,
    sell_timeline: leadData.sellTimeline,
    reason_selling: leadData.reasonSelling,
    notes: leadData.notes,
    how_heard: leadData.howHeard,
    source_url: leadData.sourceUrl,
    utm_source: leadData.utmSource,
    utm_medium: leadData.utmMedium,
    utm_campaign: leadData.utmCampaign,
    utm_content: leadData.utmContent,
  }).select().single();

  if (!error && data) {
    // Update submission count directly
    const website = await supabase
      .from('seller_websites')
      .select('total_submissions')
      .eq('id', websiteId)
      .single();
    
    if (website.data) {
      await supabase
        .from('seller_websites')
        .update({ total_submissions: (website.data.total_submissions || 0) + 1 })
        .eq('id', websiteId);
    }
  }

  return { data, error };
}
