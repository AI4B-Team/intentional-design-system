import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { fieldType, currentValue, siteType, companyName, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert real estate marketing copywriter. You write punchy, high-converting website copy for real estate businesses.

Rules:
- Be concise and direct
- Use power words that create urgency and trust
- Never use generic filler — every word must earn its place
- Match the tone to the site type: seller sites are empathetic and urgent, buyer sites are opportunity-focused, company sites are professional and trustworthy, squeeze pages are ultra-direct
- Return ONLY the copy text, no quotes, no explanation, no markdown`;

    const fieldPrompts: Record<string, string> = {
      heroHeadline: `Write a compelling hero headline (under 10 words) for a ${siteType} real estate website. Company: "${companyName}". Current: "${currentValue}". Write 1 alternative that's punchier and more converting.`,
      heroSubheadline: `Write a persuasive hero subheadline (1-2 sentences, under 25 words) for a ${siteType} real estate website. Company: "${companyName}". Headline: "${context}". Current: "${currentValue}". Make it support the headline and drive action.`,
      formSubmitText: `Write a high-converting form submit button text (2-5 words) for a ${siteType} real estate website. Include an arrow → at the end. Current: "${currentValue}".`,
      trustBadgeText: `Write a trust badge line (under 10 words) for a ${siteType} real estate website. Something like ratings, reviews count, or years in business. Current: "${currentValue}".`,
      benefitsLine: `Write a bold benefits line (under 15 words) for a ${siteType} real estate website. Use exclamation points. Format: "NO X! NO Y! NO Z!" style. Current: "${currentValue}".`,
      ctaHeadline: `Write a compelling CTA section headline (under 10 words) for a ${siteType} real estate website. Current: "${currentValue}".`,
      ctaSubheadline: `Write a persuasive CTA subheadline (1-2 sentences) that drives immediate action. Site type: ${siteType}. Current: "${currentValue}".`,
      testimonialsHeadline: `Write a testimonials section headline (under 8 words) for a ${siteType} real estate website. Current: "${currentValue}".`,
      generic: `Rewrite this website copy to be more compelling and converting for a ${siteType} real estate website (company: "${companyName}"): "${currentValue}". Keep similar length.`,
    };

    const prompt = fieldPrompts[fieldType] || fieldPrompts.generic;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-website-writer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
