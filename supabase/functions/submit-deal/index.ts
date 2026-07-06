// Public deal submission endpoint.
// Wraps the same insert flow the client used to run, adding:
//   - table-backed per-IP hourly rate limit (10/hour)
//   - optional Cloudflare Turnstile verification
//
// The client should send the full SubmitDealData payload as JSON.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  checkAndBumpIpLimit,
  getClientIp,
  rateLimitedResponse,
  verifyTurnstile,
} from '../_shared/abuse.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLACEHOLDER_USER = '00000000-0000-0000-0000-000000000000'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const ip = getClientIp(req)

    const limit = await checkAndBumpIpLimit(supabase, ip, 'submit-deal', 10)
    if (!limit.ok) return rateLimitedResponse(corsHeaders)

    const body = await req.json().catch(() => ({}))

    const turnstile = await verifyTurnstile(body.turnstileToken, ip)
    if (!turnstile.ok) {
      return new Response(
        JSON.stringify({ error: 'Verification failed. Please try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Minimal validation — the client already validates with zod-ish rules,
    // but we harden here since this endpoint is anon-callable.
    const submitterName = String(body.submitterName || '').trim().slice(0, 200)
    const submitterEmail = String(body.submitterEmail || '').trim().toLowerCase().slice(0, 255)
    const submitterPhone = String(body.submitterPhone || '').trim().slice(0, 40)
    const address = String(body.address || '').trim().slice(0, 500)
    if (!submitterName || !submitterEmail || !submitterPhone || !address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 1. Find or create deal source by email
    const { data: existingSource } = await supabase
      .from('deal_sources')
      .select('id')
      .eq('email', submitterEmail)
      .maybeSingle()

    let dealSourceId = existingSource?.id
    if (!dealSourceId) {
      const typeMap: Record<string, string> = {
        Wholesaler: 'wholesaler',
        Agent: 'agent',
        'Property Owner': 'agent',
        Other: 'agent',
      }
      const { data: newSource, error: sourceError } = await supabase
        .from('deal_sources')
        .insert({
          name: submitterName,
          company: body.submitterCompany || null,
          phone: submitterPhone,
          email: submitterEmail,
          type: typeMap[body.submitterType || 'Other'] || 'agent',
          source: 'deal_submission',
          status: 'cold',
          user_id: PLACEHOLDER_USER,
        })
        .select('id')
        .single()
      if (sourceError) {
        console.error('[submit-deal] deal_sources insert error:', sourceError)
        return new Response(
          JSON.stringify({ error: 'Unable to process submission.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }
      dealSourceId = newSource.id
    }

    // 2. Insert property record
    const notes = [
      body.isWholesale ? `Wholesale assignment - Fee: $${body.assignmentFee || 0}` : null,
      body.propertyCondition ? `Condition: ${body.propertyCondition}` : null,
      body.occupancy ? `Occupancy: ${body.occupancy}` : null,
      body.sellerMotivation ? `Motivation: ${body.sellerMotivation}` : null,
      body.timeline ? `Timeline: ${body.timeline}` : null,
      body.dealNotes ? `Deal notes: ${body.dealNotes}` : null,
      body.additionalNotes ? `Additional: ${body.additionalNotes}` : null,
    ].filter(Boolean).join('\n\n')

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        address,
        city: String(body.city || '').trim().slice(0, 100),
        state: String(body.state || '').trim().slice(0, 10),
        zip: String(body.zip || '').trim().slice(0, 20),
        property_type: body.propertyType || null,
        beds: body.beds || null,
        baths: body.baths || null,
        sqft: body.sqft || null,
        year_built: body.yearBuilt || null,
        lot_size: body.lotSize || null,
        estimated_value: body.askingPrice,
        arv: body.arv || null,
        repair_estimate: body.repairEstimate || null,
        source: 'deal_submission',
        source_id: dealSourceId,
        status: 'new',
        notes,
        user_id: PLACEHOLDER_USER,
      })
      .select('id')
      .single()
    if (propertyError) {
      console.error('[submit-deal] properties insert error:', propertyError)
      return new Response(
        JSON.stringify({ error: 'Unable to process submission.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 3. Insert deal_submission record
    const { data: submission, error: submissionError } = await supabase
      .from('deal_submissions')
      .insert({
        property_id: property.id,
        deal_source_id: dealSourceId,
        submitter_name: submitterName,
        submitter_email: submitterEmail,
        submitter_phone: submitterPhone,
        submitter_company: body.submitterCompany || null,
        submitter_type: body.submitterType || null,
        referral_source: body.referralSource || null,
      })
      .select()
      .single()
    if (submissionError) {
      console.error('[submit-deal] deal_submissions insert error:', submissionError)
      return new Response(
        JSON.stringify({ error: 'Unable to process submission.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ success: true, submission, property }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[submit-deal] error:', err)
    return new Response(
      JSON.stringify({ error: 'Submission failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
