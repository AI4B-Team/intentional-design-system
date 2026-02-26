import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) return `+1${cleaned}`
  if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`
  return phone.startsWith('+') ? phone : `+${phone}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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

    const { callSid, transferTo, callId } = await req.json()

    if (!callSid || !transferTo) {
      return new Response(JSON.stringify({ error: 'Call SID and transfer number required' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const formattedTransferTo = formatPhoneNumber(transferTo)

    // Build a TwiML URL that will redirect the call to the transfer number
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const transferTwimlUrl = `${supabaseUrl}/functions/v1/twilio-twiml?to=${encodeURIComponent(formattedTransferTo)}`

    // Update the active call to redirect to the transfer TwiML
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls/${callSid}.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          Url: transferTwimlUrl,
          Method: 'POST'
        })
      }
    )

    if (!twilioResponse.ok) {
      const errorData = await twilioResponse.json()
      console.error('Twilio transfer error:', errorData)
      return new Response(JSON.stringify({ 
        error: 'Failed to transfer call',
        details: errorData.message || errorData.code
      }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Update the call record with transfer info
    if (callId) {
      await supabase
        .from('calls')
        .update({ 
          notes: `Transferred to ${formattedTransferTo}`,
          status: 'transferred'
        })
        .eq('id', callId)
    }

    return new Response(JSON.stringify({
      success: true,
      transferredTo: formattedTransferTo
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Transfer call error:', error)
    return new Response(JSON.stringify({ error: 'Failed to transfer call' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
