// Public seller-website analytics event ingestion.
// - Table-backed per-IP hourly cap of 60 events/hour.
// - Silently drops requests beyond the cap (returns 200 with dropped=true)
//   because analytics beacons should never surface errors to end-users.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkAndBumpIpLimit, getClientIp } from '../_shared/abuse.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const ip = getClientIp(req)
    const limit = await checkAndBumpIpLimit(supabase, ip, 'track-website-event', 60)
    if (!limit.ok) {
      // Drop silently — analytics should never break the page.
      return new Response(
        JSON.stringify({ success: true, dropped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const body = await req.json().catch(() => ({}))
    const websiteId = String(body.websiteId || '')
    const eventType = String(body.eventType || '').slice(0, 60)
    if (!websiteId || !eventType) {
      return new Response(
        JSON.stringify({ error: 'Missing websiteId or eventType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { error } = await supabase.from('website_analytics').insert({
      website_id: websiteId,
      event_type: eventType,
      page_url: body.pageUrl ? String(body.pageUrl).slice(0, 1000) : null,
      visitor_id: body.visitorId ? String(body.visitorId).slice(0, 100) : null,
      session_id: body.sessionId ? String(body.sessionId).slice(0, 100) : null,
      referrer: body.referrer ? String(body.referrer).slice(0, 500) : null,
      utm_source: body.utmSource ? String(body.utmSource).slice(0, 100) : null,
      utm_medium: body.utmMedium ? String(body.utmMedium).slice(0, 100) : null,
      utm_campaign: body.utmCampaign ? String(body.utmCampaign).slice(0, 100) : null,
      device_type: body.deviceType ? String(body.deviceType).slice(0, 40) : null,
      browser: body.browser ? String(body.browser).slice(0, 60) : null,
      os: body.os ? String(body.os).slice(0, 60) : null,
      ip_address: ip,
      user_agent: req.headers.get('user-agent')?.slice(0, 500) || null,
    })
    if (error) {
      console.error('[track-website-event] insert error:', error)
      // Analytics failures should not disrupt the client.
      return new Response(
        JSON.stringify({ success: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[track-website-event] error:', err)
    return new Response(
      JSON.stringify({ success: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
