import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const MATERIAL_SWAP_PRICE = 0.75

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

    if (!credits || credits.balance < MATERIAL_SWAP_PRICE) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient credits',
        required: MATERIAL_SWAP_PRICE,
        balance: credits?.balance || 0,
        code: 'INSUFFICIENT_CREDITS'
      }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get request data
    const { 
      imageUrl,
      materialType,
      description,
      referenceImageUrl,
      userId,
      imageId,
      // Legacy support
      maskImageUrl,
      materialDescription,
      materialImageUrl,
      renovationImageId
    } = await req.json()

    // Support both new and legacy field names
    const finalMaterialType = materialType
    const finalDescription = description || materialDescription
    const finalImageId = imageId || renovationImageId

    if (!imageUrl || !finalMaterialType || !finalDescription) {
      return new Response(JSON.stringify({ 
        error: 'imageUrl, materialType, and description are required' 
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Build targeted prompt based on material type
    const materialPrompts: Record<string, string> = {
      flooring: `interior with new ${finalDescription} flooring, seamlessly installed, professional finish`,
      backsplash: `kitchen with new ${finalDescription} backsplash, professionally installed, grouted perfectly`,
      countertops: `kitchen/bathroom with new ${finalDescription} countertops, polished finish, professional installation`,
      cabinets: `room with new ${finalDescription} cabinets, modern hardware, professional installation`,
      paint: `room with walls painted in ${finalDescription}, fresh professional paint job, clean edges`,
      roofing: `house exterior with new ${finalDescription} roof, professionally installed`,
      siding: `house exterior with new ${finalDescription} siding, clean installation`,
      windows: `building with new ${finalDescription} windows, modern frames, clean installation`,
      landscaping: `property with ${finalDescription} landscaping, professional design`
    }

    const prompt = materialPrompts[finalMaterialType] || `with new ${finalDescription}, professional quality`
    const fullPrompt = `${prompt}, photorealistic, high quality real estate photography, natural lighting, keep the rest of the room unchanged`

    // Build Replicate request
    const replicateInput: Record<string, unknown> = {
      image: imageUrl,
      prompt: fullPrompt,
      negative_prompt: "blurry, low quality, distorted, unrealistic, cartoon, different room layout, changed furniture position",
      strength: 0.55,
      guidance_scale: 8,
      num_inference_steps: 35
    }

    if (maskImageUrl) {
      replicateInput.mask = maskImageUrl
    }
    
    if (referenceImageUrl) {
      // Use reference image for style guidance if provided
      replicateInput.image_guidance = referenceImageUrl
      replicateInput.image_guidance_scale = 1.5
    }

    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: replicateInput
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
      return new Response(JSON.stringify({ error: 'Generation failed', status: result.status }), { 
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const generatedImageUrl = Array.isArray(result.output) ? result.output[0] : result.output

    // Deduct credits
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: MATERIAL_SWAP_PRICE,
      p_description: `Material swap: ${finalMaterialType} - ${finalDescription.slice(0, 50)}`,
      p_service: 'material_swap',
      p_reference_id: finalImageId || null
    })

    // Generate variation ID
    const variationId = crypto.randomUUID()

    // Update renovation_images if ID provided
    if (finalImageId) {
      const { data: existingImage } = await supabase
        .from('renovation_images')
        .select('generated_images, total_credits_used')
        .eq('id', finalImageId)
        .single()

      const newGenerated = {
        id: variationId,
        url: generatedImageUrl,
        type: 'material_swap',
        style: finalMaterialType,
        prompt: fullPrompt,
        created_at: new Date().toISOString()
      }

      await supabase
        .from('renovation_images')
        .update({
          generated_images: [...(existingImage?.generated_images || []), newGenerated],
          selected_after_url: generatedImageUrl,
          selected_after_id: variationId,
          total_credits_used: (existingImage?.total_credits_used || 0) + MATERIAL_SWAP_PRICE,
          updated_at: new Date().toISOString()
        })
        .eq('id', finalImageId)
    }

    const { data: newCredits } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    return new Response(JSON.stringify({
      success: true,
      variationId,
      imageUrl: generatedImageUrl,
      creditsUsed: MATERIAL_SWAP_PRICE,
      newBalance: newCredits?.balance || 0,
      prompt: fullPrompt
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Material swap error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
