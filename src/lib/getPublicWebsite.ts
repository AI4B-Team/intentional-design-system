import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SellerWebsite = Database["public"]["Tables"]["seller_websites"]["Row"];

export async function getPublicWebsite(slug: string): Promise<SellerWebsite | null> {
  const { data, error } = await supabase
    .from('seller_websites')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

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
  // Routed through the edge function so the write is rate-limited per IP
  // (60/hour). Beyond that cap events are silently dropped — analytics
  // beacons should never break the page.
  try {
    await supabase.functions.invoke('track-website-event', {
      body: {
        websiteId,
        eventType,
        pageUrl,
        visitorId: metadata?.visitorId,
        sessionId: metadata?.sessionId,
        referrer: metadata?.referrer,
        utmSource: metadata?.utmSource,
        utmMedium: metadata?.utmMedium,
        utmCampaign: metadata?.utmCampaign,
        deviceType: metadata?.deviceType,
        browser: metadata?.browser,
        os: metadata?.os,
      },
    });
  } catch (err) {
    // Never surface analytics errors to the user.
    console.warn('trackWebsiteEvent failed:', err);
  }
}

// Public seller-lead submissions go through the rate-limited `submit-seller-lead`
// edge function, which stamps the receiving workspace on the lead.
