import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const url = new URL(req.url)
    const callId = url.searchParams.get('callId')

    // Generate TwiML response for connecting the call
    // This creates a simple call flow - customize as needed
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${Deno.env.get('TWILIO_PHONE_NUMBER') || ''}">
    <Number>${url.searchParams.get('to') || ''}</Number>
  </Dial>
</Response>`

    return new Response(twiml, {
      headers: {
        'Content-Type': 'text/xml'
      }
    })

  } catch (error) {
    console.error('TwiML error:', error)
    
    // Return a basic TwiML response that says something went wrong
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>An error occurred. Please try again later.</Say>
  <Hangup/>
</Response>`

    return new Response(errorTwiml, {
      headers: {
        'Content-Type': 'text/xml'
      }
    })
  }
})
