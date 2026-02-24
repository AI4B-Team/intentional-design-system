import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { colors, style, symbols, slogan, companyName } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const colorNames = (colors || []).join(", ") || "professional colors";
    const styleDesc = style || "minimal";
    const symbolDescs = (symbols || []).join(", ") || "abstract shapes";
    const sloganText = slogan ? `, with slogan "${slogan}"` : "";
    const company = companyName || "a real estate company";

    const prompt = `Generate a professional logo icon for "${company}". 
Style: ${styleDesc}. 
Colors: ${colorNames}. 
Symbol types: ${symbolDescs}${sloganText}.
The logo should be a clean, vector-style icon on a solid dark background (#1e293b). 
Make it simple, bold, and recognizable. No text unless a slogan is provided. 
Square format, centered composition.`;

    // Generate 3 logos in parallel
    const generateOne = async () => {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("RATE_LIMIT");
        if (response.status === 402) throw new Error("CREDITS_EXHAUSTED");
        const t = await response.text();
        console.error("AI gateway error:", response.status, t);
        throw new Error("AI gateway error");
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!imageUrl) throw new Error("No image returned");
      return imageUrl;
    };

    // Generate 3 logos
    const results = await Promise.allSettled([generateOne(), generateOne(), generateOne()]);
    const logos = results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
      .map((r) => r.value);

    if (logos.length === 0) {
      // Check if it was a rate limit or credit issue
      const firstError = results.find(r => r.status === "rejected");
      if (firstError && firstError.status === "rejected") {
        const msg = (firstError as PromiseRejectedResult).reason?.message;
        if (msg === "RATE_LIMIT") {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg === "CREDITS_EXHAUSTED") {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      throw new Error("Failed to generate any logos");
    }

    return new Response(JSON.stringify({ logos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-logo-generator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
