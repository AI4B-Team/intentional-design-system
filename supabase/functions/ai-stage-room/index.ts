import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const STAGING_PRICE = 0.50

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (!REPLICATE_API_KEY) {
      console.error('REPLICATE_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'AI service not configured' }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Check credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!credits || credits.balance < STAGING_PRICE) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient credits',
        required: STAGING_PRICE,
        balance: credits?.balance || 0,
        code: 'INSUFFICIENT_CREDITS'
      }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get request data
    const { 
      imageUrl,
      roomType,
      stylePreset,
      customPrompt,
      renovationImageId
    } = await req.json()

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'imageUrl is required' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Build the prompt
    const roomPrompts: Record<string, string> = {
      living_room: 'spacious living room with comfortable sofa, coffee table, area rug, floor lamp, wall art, plants',
      bedroom: 'cozy bedroom with bed, nightstands, lamps, dresser, soft bedding, curtains',
      kitchen: 'modern kitchen with clean countertops, bar stools, pendant lights, decorative items',
      bathroom: 'clean bathroom with towels, bath mat, plants, organized toiletries, mirror lighting',
      dining_room: 'elegant dining room with dining table, chairs, centerpiece, chandelier, sideboard',
      office: 'professional home office with desk, ergonomic chair, bookshelf, desk lamp, organized workspace',
      exterior_front: 'beautiful front yard with landscaping, walkway, porch furniture, potted plants',
      exterior_back: 'inviting backyard with patio furniture, outdoor lighting, landscaping, clean lawn'
    }

    const stylePrompts: Record<string, string> = {
      modern: 'modern minimalist design, clean lines, neutral colors, contemporary furniture',
      farmhouse: 'modern farmhouse style, warm wood tones, cozy textiles, rustic accents',
      luxury: 'luxury high-end design, premium materials, sophisticated styling, designer pieces',
      coastal: 'coastal beach style, light colors, natural textures, airy and bright',
      industrial: 'industrial style, metal accents, exposed elements, urban modern',
      traditional: 'traditional classic style, elegant furniture, warm colors, timeless design',
      scandinavian: 'scandinavian design, minimalist, functional, light wood, hygge comfort'
    }

    const basePrompt = roomPrompts[roomType] || 'beautifully furnished interior'
    const styleAddition = stylePrompts[stylePreset] || 'modern stylish design'
    
    const fullPrompt = `${basePrompt}, ${styleAddition}, professional real estate photography, high quality, well-lit, photorealistic${customPrompt ? ', ' + customPrompt : ''}`

    // Call Replicate API - using SDXL img2img model
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          image: imageUrl,
          prompt: fullPrompt,
          negative_prompt: "blurry, low quality, distorted, ugly, bad architecture, unrealistic, cartoon, anime, sketch, drawing",
          strength: 0.65,
          guidance_scale: 7.5,
          num_inference_steps: 30
        }
      })
    })

    const prediction = await replicateResponse.json()

    if (!replicateResponse.ok) {
      console.error('Replicate error:', prediction)
      return new Response(JSON.stringify({ error: 'AI generation failed', details: prediction }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Poll for completion
    let result = prediction
    let attempts = 0
    const maxAttempts = 60

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${REPLICATE_API_KEY}` }
      })
      result = await statusResponse.json()
      attempts++
    }

    if (result.status !== 'succeeded') {
      return new Response(JSON.stringify({ error: 'Generation timed out or failed', status: result.status }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const generatedImageUrl = Array.isArray(result.output) ? result.output[0] : result.output

    // Deduct credits
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: STAGING_PRICE,
      p_description: `Virtual staging: ${roomType || 'room'} - ${stylePreset || 'custom'}`,
      p_service: 'virtual_staging',
      p_reference_id: renovationImageId || null
    })

    // Update renovation_images with new generated image
    if (renovationImageId) {
      const { data: existingImage } = await supabase
        .from('renovation_images')
        .select('generated_images, total_credits_used')
        .eq('id', renovationImageId)
        .single()

      const newGenerated = {
        id: crypto.randomUUID(),
        url: generatedImageUrl,
        type: 'staging',
        style: stylePreset,
        room: roomType,
        prompt: fullPrompt,
        created_at: new Date().toISOString()
      }

      const updatedImages = [...(existingImage?.generated_images || []), newGenerated]

      await supabase
        .from('renovation_images')
        .update({
          generated_images: updatedImages,
          selected_after_url: generatedImageUrl,
          selected_after_id: newGenerated.id,
          total_credits_used: (existingImage?.total_credits_used || 0) + STAGING_PRICE,
          updated_at: new Date().toISOString()
        })
        .eq('id', renovationImageId)
    }

    // Get updated balance
    const { data: newCredits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    return new Response(JSON.stringify({
      success: true,
      imageUrl: generatedImageUrl,
      creditsUsed: STAGING_PRICE,
      newBalance: newCredits?.balance || 0,
      prompt: fullPrompt
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Staging error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
