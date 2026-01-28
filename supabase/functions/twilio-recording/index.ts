import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Recording webhook received:', params)

    const callSid = params.CallSid
    const recordingUrl = params.RecordingUrl
    const recordingSid = params.RecordingSid
    const recordingDuration = parseInt(params.RecordingDuration || '0')
    const recordingStatus = params.RecordingStatus

    if (!callSid) {
      return new Response('Missing CallSid', { status: 400 })
    }

    // Find call by Twilio SID
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

    // Update call with recording info
    const updates: Record<string, any> = {
      recording_status: recordingStatus,
      recording_duration_seconds: recordingDuration
    }

    // Store the recording URL (add .mp3 for direct access)
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
