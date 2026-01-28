import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAGING_COST = 0.50;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, roomType, style, customInstructions, userId, imageId } = await req.json();

    if (!imageUrl || !roomType || !style || !userId || !imageId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Check and deduct credits
    const creditCheckRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/deduct_credits`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_user_id: userId,
        p_amount: STAGING_COST,
        p_description: `Virtual staging - ${style} style`,
        p_service: "virtual_staging",
        p_reference_id: imageId,
      }),
    });

    const creditResult = await creditCheckRes.json();
    
    if (!creditResult.success) {
      return new Response(
        JSON.stringify({ error: creditResult.error || "Insufficient credits" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the staging prompt
    const stylePrompts: Record<string, string> = {
      modern: "modern minimalist style with clean lines, neutral color palette, sleek contemporary furniture, minimal decor",
      farmhouse: "farmhouse chic style with rustic wood elements, shiplap accents, cozy textiles, vintage-inspired decor",
      luxury: "luxury contemporary style with high-end finishes, elegant furniture, marble accents, designer lighting",
      coastal: "coastal style with light colors, natural textures, beach-inspired decor, airy and relaxed atmosphere",
      industrial: "industrial loft style with exposed brick, metal accents, raw materials, urban warehouse aesthetic",
      scandinavian: "scandinavian style with light wood, white walls, functional furniture, cozy textiles, hygge atmosphere",
      traditional: "traditional style with classic furniture, rich colors, ornate details, timeless elegant decor",
    };

    const styleDescription = stylePrompts[style] || stylePrompts.modern;
    
    let prompt = `Transform this empty ${roomType.toLowerCase()} into a beautifully staged room with ${styleDescription}. `;
    prompt += `Add appropriate furniture, decor, and accessories for a ${roomType.toLowerCase()}. `;
    prompt += `Keep the existing architectural features, windows, and flooring. `;
    prompt += `Make it look professional and photorealistic for real estate marketing.`;
    
    if (customInstructions) {
      prompt += ` Additional requirements: ${customInstructions}`;
    }

    // Call Replicate for image-to-image transformation
    const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");
    
    if (!REPLICATE_API_KEY) {
      // Refund credits if API key is missing
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_credits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_amount: STAGING_COST,
          p_description: "Refund - API configuration error",
          p_type: "refund",
        }),
      });

      return new Response(
        JSON.stringify({ error: "Staging service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Replicate's img2img model for staging
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", // SDXL img2img
        input: {
          image: imageUrl,
          prompt: prompt,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          prompt_strength: 0.65, // Balance between preserving original and applying changes
          negative_prompt: "blurry, low quality, distorted, unrealistic, cartoon, anime, illustration, drawing, painting",
        },
      }),
    });

    if (!replicateResponse.ok) {
      const error = await replicateResponse.text();
      console.error("Replicate API error:", error);
      
      // Refund credits on failure
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_credits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_amount: STAGING_COST,
          p_description: "Refund - Generation failed",
          p_type: "refund",
        }),
      });

      return new Response(
        JSON.stringify({ error: "Generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prediction = await replicateResponse.json();
    
    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max

    while (result.status !== "succeeded" && result.status !== "failed" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          Authorization: `Token ${REPLICATE_API_KEY}`,
        },
      });
      
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status === "failed" || attempts >= maxAttempts) {
      // Refund credits on failure
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/add_credits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_amount: STAGING_COST,
          p_description: "Refund - Generation timed out or failed",
          p_type: "refund",
        }),
      });

      return new Response(
        JSON.stringify({ error: result.error || "Generation failed or timed out" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedImageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

    // Generate unique ID for this variation
    const variationId = crypto.randomUUID();

    return new Response(
      JSON.stringify({
        success: true,
        variationId,
        imageUrl: generatedImageUrl,
        style,
        prompt,
        cost: STAGING_COST,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Virtual staging error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
