import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BuyerData {
  id: string;
  full_name: string | null;
  company_name: string | null;
  max_price: number | null;
  min_price: number | null;
  markets: string[] | null;
  zip_codes: string[] | null;
  property_types: string[] | null;
  buying_strategy: string[] | null;
  deals_purchased: number | null;
  is_verified: boolean | null;
}

interface BuyerIntelligence {
  matchingBuyers: number;
  verifiedBuyers: number;
  avgMaxPrice: number | null;
  minMaxPrice: number | null;
  maxMaxPrice: number | null;
  buyersAbove70: number;
  avgArvPercentage: number | null;
  topBuyers: Array<{
    name: string;
    maxPrice: number;
    dealsCompleted: number;
    verified: boolean;
  }>;
}

interface OfferInsightRequest {
  step: "dealSetup" | "package" | "pricing" | "delivery" | "preview" | "review";
  context: {
    propertyAddress?: string;
    propertyCity?: string;
    propertyState?: string;
    propertyZip?: string;
    propertyType?: string;
    arv?: number;
    askingPrice?: number;
    offerAmount?: number;
    offerPercentage?: number;
    flipperProfit?: number;
    wholesalerProfit?: number;
    selectedTemplate?: string;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { step, context } = await req.json() as OfferInsightRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let buyerIntelligence: BuyerIntelligence | null = null;

    // For pricing step, fetch buyer data
    if (step === "pricing" && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && authHeader) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        
        // Get user from token
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // Query matching cash buyers
          let query = supabase
            .from("cash_buyers")
            .select("id, full_name, company_name, max_price, min_price, markets, zip_codes, property_types, buying_strategy, deals_purchased, is_verified")
            .eq("user_id", user.id)
            .eq("status", "active");
          
          // Filter by max price if ARV is available
          if (context.arv) {
            query = query.gte("max_price", context.offerAmount || context.arv * 0.7);
          }
          
          const { data: buyers, error } = await query.limit(50);
          
          if (!error && buyers && buyers.length > 0) {
            const typedBuyers = buyers as BuyerData[];
            
            // Filter buyers that match the market (city, state, or zip)
            const matchingBuyers = typedBuyers.filter(buyer => {
              // Check if buyer's markets include the property's city/state
              const marketMatch = buyer.markets?.some(m => 
                m.toLowerCase().includes(context.propertyCity?.toLowerCase() || "") ||
                m.toLowerCase().includes(context.propertyState?.toLowerCase() || "")
              ) ?? true; // If no markets specified, include them
              
              // Check zip code match
              const zipMatch = !buyer.zip_codes || buyer.zip_codes.length === 0 || 
                buyer.zip_codes.includes(context.propertyZip || "");
              
              // Check property type match
              const typeMatch = !buyer.property_types || buyer.property_types.length === 0 ||
                buyer.property_types.some(t => 
                  t.toLowerCase().includes(context.propertyType?.toLowerCase() || "single") ||
                  context.propertyType?.toLowerCase().includes(t.toLowerCase())
                );
              
              return marketMatch || zipMatch || typeMatch;
            });
            
            if (matchingBuyers.length > 0) {
              const buyersWithMaxPrice = matchingBuyers.filter(b => b.max_price && b.max_price > 0);
              const maxPrices = buyersWithMaxPrice.map(b => b.max_price!);
              
              // Calculate how many buyers would pay above 70% of ARV
              const buyersAbove70 = context.arv 
                ? buyersWithMaxPrice.filter(b => b.max_price! >= context.arv! * 0.7).length
                : 0;
              
              // Calculate average ARV percentage buyers are willing to pay
              const avgArvPercentage = context.arv && buyersWithMaxPrice.length > 0
                ? Math.round((maxPrices.reduce((a, b) => a + b, 0) / maxPrices.length / context.arv) * 100)
                : null;
              
              buyerIntelligence = {
                matchingBuyers: matchingBuyers.length,
                verifiedBuyers: matchingBuyers.filter(b => b.is_verified).length,
                avgMaxPrice: maxPrices.length > 0 
                  ? Math.round(maxPrices.reduce((a, b) => a + b, 0) / maxPrices.length)
                  : null,
                minMaxPrice: maxPrices.length > 0 ? Math.min(...maxPrices) : null,
                maxMaxPrice: maxPrices.length > 0 ? Math.max(...maxPrices) : null,
                buyersAbove70,
                avgArvPercentage,
                topBuyers: matchingBuyers
                  .filter(b => b.max_price && b.max_price > 0)
                  .sort((a, b) => (b.max_price || 0) - (a.max_price || 0))
                  .slice(0, 3)
                  .map(b => ({
                    name: b.full_name || b.company_name || "Unknown",
                    maxPrice: b.max_price || 0,
                    dealsCompleted: b.deals_purchased || 0,
                    verified: b.is_verified || false,
                  })),
              };
            }
          }
        }
      } catch (dbError) {
        console.error("Error fetching buyer data:", dbError);
        // Continue without buyer data
      }
    }

    const systemPrompt = `You are an expert real estate investment advisor specializing in wholesaling and fix-and-flip deals. Provide brief, actionable insights (2-3 sentences max) based on the current step of the offer process. Be specific with numbers when available. Focus on maximizing profit and reducing risk.`;

    let userPrompt = "";
    
    switch (step) {
      case "dealSetup":
        userPrompt = `The investor is setting up a deal for offer.
Property: ${context.propertyAddress}
ARV: $${context.arv?.toLocaleString() || "Unknown"}
Asking: $${context.askingPrice?.toLocaleString() || "Unknown"}

Give a quick tip about what to verify before making an offer on this property.`;
        break;
        
      case "package":
        userPrompt = `The investor is selecting an offer package type. They're considering: ${context.selectedTemplate || "Cash Offer"}. 
Property: ${context.propertyAddress}
ARV: $${context.arv?.toLocaleString()}
Asking: $${context.askingPrice?.toLocaleString()}

Give a quick tip about which offer type works best for this deal based on the numbers.`;
        break;
        
      case "pricing":
        // Enhanced prompt with buyer intelligence
        let buyerContext = "";
        if (buyerIntelligence && buyerIntelligence.matchingBuyers > 0) {
          buyerContext = `

LOCAL BUYER DATA (from ${buyerIntelligence.matchingBuyers} matching buyers in this market):
- ${buyerIntelligence.verifiedBuyers} verified buyers
- Average max purchase price: $${buyerIntelligence.avgMaxPrice?.toLocaleString() || "N/A"}
- Buyers willing to pay 70%+ of ARV: ${buyerIntelligence.buyersAbove70}
- Average ARV percentage buyers pay: ${buyerIntelligence.avgArvPercentage || "N/A"}%
- Price range buyers accept: $${buyerIntelligence.minMaxPrice?.toLocaleString() || "N/A"} - $${buyerIntelligence.maxMaxPrice?.toLocaleString() || "N/A"}`;
        }

        userPrompt = `The investor is setting their offer price.
Property: ${context.propertyAddress}
ARV: $${context.arv?.toLocaleString()}
Offer: $${context.offerAmount?.toLocaleString()} (${context.offerPercentage}% of ARV)
Flipper Profit: $${context.flipperProfit?.toLocaleString()}
Wholesaler Spread: $${context.wholesalerProfit?.toLocaleString()}
${buyerContext}

${buyerIntelligence && buyerIntelligence.matchingBuyers > 0 
  ? "Based on the LOCAL BUYER DATA, analyze if this offer will be profitable for wholesaling. Mention specific buyer stats and suggest optimal pricing based on what local buyers are actually paying."
  : "Analyze if this offer percentage is competitive and profitable. Suggest if they should adjust."}`;
        break;
        
      case "delivery":
        userPrompt = `The investor is configuring how to deliver their offer.
Email enabled: ${context.emailEnabled ? "Yes" : "No"}
SMS enabled: ${context.smsEnabled ? "Yes" : "No"}
Offer amount: $${context.offerAmount?.toLocaleString()}

Give a quick tip about the best delivery strategy for getting a response.`;
        break;
        
      case "preview":
        userPrompt = `The investor is previewing their offer before sending.
Property: ${context.propertyAddress}
Offer: $${context.offerAmount?.toLocaleString()} (${context.offerPercentage}% of ARV)
Template: ${context.selectedTemplate}

Give a final check tip - what should they verify before sending?`;
        break;
        
      case "review":
        userPrompt = `The investor is about to submit their offer.
Property: ${context.propertyAddress}
ARV: $${context.arv?.toLocaleString()}
Final Offer: $${context.offerAmount?.toLocaleString()} (${context.offerPercentage}% of ARV)
Flipper Profit: $${context.flipperProfit?.toLocaleString()}
Wholesaler Spread: $${context.wholesalerProfit?.toLocaleString()}

Give a brief final assessment and confidence level for this deal.`;
        break;
    }

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
          { role: "user", content: userPrompt },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "Unable to generate insight.";

    return new Response(JSON.stringify({ 
      insight,
      buyerIntelligence: step === "pricing" ? buyerIntelligence : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating offer insight:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
