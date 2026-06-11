import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { validateTwilioSignature } from '../_shared/webhook-signatures.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-signature',
}

// Minimal TwiML response that ends the call cleanly when signature validation
// fails — so a rogue caller can't drive arbitrary outbound dials, but we also
// don't crash Twilio's call flow mid-leg.
const REJECT_TWIML = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Hangup/></Response>`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
  if (!TWILIO_AUTH_TOKEN) {
    console.error('twilio-twiml: TWILIO_AUTH_TOKEN env var is not set')
    return new Response('Server not configured', { status: 503, headers: corsHeaders })
  }

  try {
    // Twilio POSTs application/x-www-form-urlencoded for voice webhooks.
    // For GETs the params object is empty (signature still covers full URL).
    let params: Record<string, string> = {}
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        const formData = await req.formData()
        formData.forEach((value, key) => { params[key] = value.toString() })
      } catch {
        params = {}
      }
    }

    const signature = req.headers.get('x-twilio-signature')
    const ok = await validateTwilioSignature({
      authToken: TWILIO_AUTH_TOKEN,
      url: req.url, // includes query string — Twilio signs the full URL
      params,
      signature,
    })
    if (!ok) {
      console.warn('twilio-twiml: invalid signature for', new URL(req.url).pathname)
      return new Response(REJECT_TWIML, {
        status: 403,
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const url = new URL(req.url)

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${Deno.env.get('TWILIO_PHONE_NUMBER') || ''}">
    <Number>${url.searchParams.get('to') || ''}</Number>
  </Dial>
</Response>`

    return new Response(twiml, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error) {
    console.error('TwiML error:', error)
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred. Please try again later.</Say>
  <Hangup/>
</Response>`

    return new Response(errorTwiml, {
      headers: { 'Content-Type': 'text/xml' }
    })
  }
})
