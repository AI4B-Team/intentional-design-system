import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { validateTwilioSignature } from '../_shared/webhook-signatures.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
  if (!TWILIO_AUTH_TOKEN) {
    console.error('twilio-recording: TWILIO_AUTH_TOKEN env var is not set')
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
      console.warn('twilio-recording: invalid signature for', new URL(req.url).pathname)
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const callSid = params.CallSid
    const recordingUrl = params.RecordingUrl
    const recordingDuration = parseInt(params.RecordingDuration || '0')
    const recordingStatus = params.RecordingStatus

    if (!callSid) {
      return new Response('Missing CallSid', { status: 400 })
    }

    const { data: call, error: findError } = await supabase
      .from('calls')
      .select('id')
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
      recording_status: recordingStatus,
      recording_duration_seconds: recordingDuration
    }

    if (recordingUrl) {
      updates.recording_url = `${recordingUrl}.mp3`
    }

    const { error: updateError } = await supabase
      .from('calls')
      .update(updates)
      .eq('id', call.id)

    if (updateError) {
      console.error('Error updating call recording:', updateError)
    }

    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error('Recording webhook error:', error)
    return new Response('Internal error', { status: 500 })
  }
})
