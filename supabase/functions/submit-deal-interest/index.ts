// Public deal-interest submission endpoint.
// - Table-backed per-IP hourly rate limit (10/hour)
// - Optional Cloudflare Turnstile verification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  checkAndBumpIpLimit,
  getClientIp,
  rateLimitedResponse,
  verifyTurnstile,
} from '../_shared/abuse.ts'
import { emitHubEvent } from '../_shared/hub-emit.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VALID_INTEREST = new Set(['viewed', 'interested', 'very_interested', 'made_offer'])

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const ip = getClientIp(req)

    const limit = await checkAndBumpIpLimit(supabase, ip, 'submit-deal-interest', 10)
    if (!limit.ok) return rateLimitedResponse(corsHeaders)

    const body = await req.json().catch(() => ({}))

    const turnstile = await verifyTurnstile(body.turnstileToken, ip)
    if (!turnstile.ok) {
      return new Response(
        JSON.stringify({ error: 'Verification failed. Please try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const dealId = String(body.dealId || '')
    const userId = String(body.userId || '')
    const name = String(body.name || '').trim().slice(0, 100)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 255)
    const phone = body.phone ? String(body.phone).trim().slice(0, 40) : null
    const interestType = String(body.interestType || 'interested')
    const message = body.message ? String(body.message).slice(0, 2000) : null
    const offerAmount = typeof body.offerAmount === 'number' && body.offerAmount > 0
      ? body.offerAmount
      : null

    if (!dealId || !userId || !name || !email || !VALID_INTEREST.has(interestType)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { error: insertError } = await supabase.from('deal_interests').insert({
      deal_id: dealId,
      user_id: userId,
      guest_name: name,
      guest_email: email,
      guest_phone: phone,
      interest_type: interestType,
      message,
      offer_amount: offerAmount,
      source: 'direct',
    })
    if (insertError) {
      console.error('[submit-deal-interest] insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Unable to submit interest.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Bump interest_count on the deal
    const { data: deal } = await supabase
      .from('dispo_deals')
      .select('interest_count, organization_id, address, city, state, title, asking_price')
      .eq('id', dealId)
      .maybeSingle()
    if (deal) {
      await supabase
        .from('dispo_deals')
        .update({ interest_count: (deal.interest_count || 0) + 1 })
        .eq('id', dealId)
    }

    // Fan the buyer interest out to connected App Family apps + org webhooks.
    if (deal?.organization_id) {
      await emitHubEvent(supabase, deal.organization_id, 'leads.new', {
        lead_type: 'cash_buyer',
        name,
        email,
        phone,
        interest_type: interestType,
        message,
        offer_amount: offerAmount,
        property_address: deal.address ?? null,
        city: deal.city ?? null,
        state: deal.state ?? null,
        deal_title: deal.title ?? null,
        asking_price: deal.asking_price ?? null,
        source: 'real-elite:deal-interest',
      })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[submit-deal-interest] error:', err)
    return new Response(
      JSON.stringify({ error: 'Submission failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
