import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Parse form data from Twilio webhook
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    console.log('Twilio webhook received:', params)

    const callSid = params.CallSid
    const callStatus = params.CallStatus
    const callDuration = parseInt(params.CallDuration || '0')

    if (!callSid) {
      return new Response('Missing CallSid', { status: 400 })
    }

    // Find call by Twilio SID
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

    // Set answered_at when call is answered
    if (callStatus === 'in-progress' && !call.answered_at) {
      updates.answered_at = new Date().toISOString()
    }

    // Handle call completion
    if (callStatus === 'completed') {
      updates.ended_at = new Date().toISOString()
      updates.duration_seconds = callDuration
      
      // Calculate talk time vs ring time
      if (call.answered_at && call.initiated_at) {
        const ringTime = Math.floor(
          (new Date(call.answered_at).getTime() - new Date(call.initiated_at).getTime()) / 1000
        )
        updates.ring_time_seconds = ringTime
        updates.talk_time_seconds = Math.max(0, callDuration - ringTime)
      }
    }

    // Handle failed/no-answer/busy calls
    if (['busy', 'no-answer', 'failed', 'canceled'].includes(callStatus)) {
      updates.ended_at = new Date().toISOString()
    }

    // Update call record
    const { error: updateError } = await supabase
      .from('calls')
      .update(updates)
      .eq('id', call.id)

    if (updateError) {
      console.error('Error updating call:', updateError)
    }

    // Update queue contact if applicable
    if (call.queue_contact_id) {
      const contactUpdates: Record<string, any> = {
        last_attempt_at: new Date().toISOString(),
        last_call_id: call.id,
        updated_at: new Date().toISOString()
      }

      // Increment attempt count
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

    // Update queue stats if applicable
    if (call.queue_id) {
      await supabase.rpc('update_queue_stats', { p_queue_id: call.queue_id })
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal error', { status: 500 })
  }
})
