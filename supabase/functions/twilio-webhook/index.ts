import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateTwilioSignature } from '../_shared/webhook-signatures.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-signature',
}

function mapTwilioStatus(status: string): string {
  const map: Record<string, string> = {
    'queued': 'initiated',
    'ringing': 'ringing',
    'in-progress': 'in-progress',
    'completed': 'completed',
    'busy': 'busy',
    'no-answer': 'no-answer',
    'failed': 'failed',
    'canceled': 'canceled'
  }
  return map[status] || status
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
  if (!TWILIO_AUTH_TOKEN) {
    console.error('twilio-webhook: TWILIO_AUTH_TOKEN env var is not set')
    return new Response('Server not configured', { status: 503, headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => { params[key] = value.toString() })

    const signature = req.headers.get('x-twilio-signature')
    const ok = await validateTwilioSignature({
      authToken: TWILIO_AUTH_TOKEN,
      url: req.url,
      params,
      signature,
    })
    if (!ok) {
      console.warn('twilio-webhook: invalid signature for', new URL(req.url).pathname)
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const callSid = params.CallSid
    const callStatus = params.CallStatus
    const callDuration = parseInt(params.CallDuration || '0')

    if (!callSid) {
      return new Response('Missing CallSid', { status: 400 })
    }

    const { data: call, error: findError } = await supabase
      .from('calls')
      .select('*')
      .eq('twilio_call_sid', callSid)
      .maybeSingle()

    if (findError) {
      console.error('Error finding call:', findError)
      return new Response('Database error', { status: 500 })
    }

    if (!call) {
      console.log('Call not found for SID:', callSid)
      return new Response('OK', { status: 200 })
    }

    const updates: Record<string, any> = {
      status: mapTwilioStatus(callStatus)
    }

    if (callStatus === 'in-progress' && !call.answered_at) {
      updates.answered_at = new Date().toISOString()
    }

    if (callStatus === 'completed') {
      updates.ended_at = new Date().toISOString()
      updates.duration_seconds = callDuration

      if (call.answered_at && call.initiated_at) {
        const ringTime = Math.floor(
          (new Date(call.answered_at).getTime() - new Date(call.initiated_at).getTime()) / 1000
        )
        updates.ring_time_seconds = ringTime
        updates.talk_time_seconds = Math.max(0, callDuration - ringTime)
      }
    }

    if (['busy', 'no-answer', 'failed', 'canceled'].includes(callStatus)) {
      updates.ended_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('calls')
      .update(updates)
      .eq('id', call.id)

    if (updateError) {
      console.error('Error updating call:', updateError)
    }

    if (call.queue_contact_id) {
      const contactUpdates: Record<string, any> = {
        last_attempt_at: new Date().toISOString(),
        last_call_id: call.id,
        updated_at: new Date().toISOString()
      }

      const { data: contact } = await supabase
        .from('call_queue_contacts')
        .select('attempt_count')
        .eq('id', call.queue_contact_id)
        .single()

      if (contact) {
        contactUpdates.attempt_count = (contact.attempt_count || 0) + 1
      }

      await supabase
        .from('call_queue_contacts')
        .update(contactUpdates)
        .eq('id', call.queue_contact_id)
    }

    if (call.queue_id) {
      await supabase.rpc('update_queue_stats', { p_queue_id: call.queue_id })
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal error', { status: 500 })
  }
})
