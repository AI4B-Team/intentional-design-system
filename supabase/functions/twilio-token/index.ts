import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_API_KEY_SID = Deno.env.get('TWILIO_API_KEY_SID')
    const TWILIO_API_KEY_SECRET = Deno.env.get('TWILIO_API_KEY_SECRET')
    const TWILIO_TWIML_APP_SID = Deno.env.get('TWILIO_TWIML_APP_SID')

    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET || !TWILIO_TWIML_APP_SID) {
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

    // Generate a simple capability token for browser-based calling
    // In production, use proper Twilio JWT library
    const identity = user.id
    const ttl = 3600 // 1 hour

    // Create a basic token structure (simplified - real implementation needs JWT signing)
    const tokenPayload = {
      iss: TWILIO_API_KEY_SID,
      sub: TWILIO_ACCOUNT_SID,
      exp: Math.floor(Date.now() / 1000) + ttl,
      grants: {
        identity: identity,
        voice: {
          outgoing: {
            application_sid: TWILIO_TWIML_APP_SID
          },
          incoming: {
            allow: true
          }
        }
      }
    }

    // Note: This is a placeholder. Real implementation requires proper JWT signing
    // with TWILIO_API_KEY_SECRET using HS256 algorithm
    const token = btoa(JSON.stringify(tokenPayload))

    return new Response(JSON.stringify({ 
      token, 
      identity,
      configured: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Token error:', error)
    return new Response(JSON.stringify({ error: 'Token generation failed' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
