import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) return `+1${cleaned}`
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`
  return phone.startsWith('+') ? phone : `+${phone}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return new Response(JSON.stringify({ 
        error: 'Twilio not configured',
        code: 'TWILIO_NOT_CONFIGURED'
      }), { 
        status: 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', '') || '')
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { 
      toNumber, 
      queueId, 
      queueContactId, 
      propertyId,
      contactName,
      organizationId,
      record = true
    } = await req.json()

    if (!toNumber) {
      return new Response(JSON.stringify({ error: 'Phone number required' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Format phone number
    const formattedNumber = formatPhoneNumber(toNumber)

    // Check DNC/suppression list
    const { data: dncCheck } = await supabase
      .from('suppression_list')
      .select('id')
      .eq('organization_id', organizationId)
      .or(`phone.ilike.%${formattedNumber.replace(/\D/g, '').slice(-10)}%,value.ilike.%${formattedNumber.replace(/\D/g, '').slice(-10)}%`)
      .limit(1)
      .maybeSingle()

    if (dncCheck) {
      return new Response(JSON.stringify({ 
        error: 'Number is on Do Not Call list',
        code: 'DNC_BLOCKED'
      }), { 
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Create call record first
    const { data: callRecord, error: callError } = await supabase
      .from('calls')
      .insert({
        user_id: user.id,
        organization_id: organizationId,
        queue_id: queueId,
        queue_contact_id: queueContactId,
        property_id: propertyId,
        phone_number: formattedNumber,
        contact_name: contactName,
        direction: 'outbound',
        from_number: TWILIO_PHONE_NUMBER,
        to_number: formattedNumber,
        status: 'initiated',
        initiated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (callError) {
      console.error('Failed to create call record:', callError)
      throw callError
    }

    // Build webhook URLs
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const statusCallbackUrl = `${supabaseUrl}/functions/v1/twilio-webhook`
    const twimlUrl = `${supabaseUrl}/functions/v1/twilio-twiml?callId=${callRecord.id}`
    const recordingCallbackUrl = `${supabaseUrl}/functions/v1/twilio-recording`

    // Make call via Twilio API
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: formattedNumber,
          From: TWILIO_PHONE_NUMBER,
          Url: twimlUrl,
          StatusCallback: statusCallbackUrl,
          StatusCallbackEvent: 'initiated ringing answered completed',
          Record: record ? 'true' : 'false',
          RecordingStatusCallback: recordingCallbackUrl,
          Timeout: '30'
        })
      }
    )

    const twilioData = await twilioResponse.json()

    if (!twilioResponse.ok) {
      console.error('Twilio API error:', twilioData)
      
      // Update call record as failed
      await supabase
        .from('calls')
        .update({ status: 'failed' })
        .eq('id', callRecord.id)

      return new Response(JSON.stringify({ 
        error: 'Failed to initiate call',
        details: twilioData.message || twilioData.code
      }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Update call record with Twilio SID
    await supabase
      .from('calls')
      .update({ 
        twilio_call_sid: twilioData.sid,
        status: 'ringing'
      })
      .eq('id', callRecord.id)

    return new Response(JSON.stringify({
      success: true,
      callId: callRecord.id,
      twilioSid: twilioData.sid,
      status: 'ringing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Make call error:', error)
    return new Response(JSON.stringify({ error: 'Failed to make call' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
