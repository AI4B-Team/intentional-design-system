import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface PropertySearchResult {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  arv?: number;
  asking_price?: number;
  status?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  property_type?: string;
}

// Search properties in the database
async function searchPropertiesInDatabase(
  supabase: any,
  query: string,
  userId: string
): Promise<PropertySearchResult[]> {
  console.log("Searching database for:", query);
  
  // Parse search terms
  const terms = query.toLowerCase().split(/\s+/);
  
  let queryBuilder = supabase
    .from("properties")
    .select("id, address, city, state, zip, arv, asking_price, status, bedrooms, bathrooms, sqft, year_built, property_type")
    .eq("user_id", userId)
    .limit(10);
  
  // Search by address, city, or state
  const searchFilters: string[] = [];
  terms.forEach(term => {
    if (term.length > 1) {
      searchFilters.push(`address.ilike.%${term}%`);
      searchFilters.push(`city.ilike.%${term}%`);
      searchFilters.push(`state.ilike.%${term}%`);
      searchFilters.push(`zip.ilike.%${term}%`);
    }
  });
  
  if (searchFilters.length > 0) {
    queryBuilder = queryBuilder.or(searchFilters.join(","));
  }
  
  const { data, error } = await queryBuilder;
  
  if (error) {
    console.error("Database search error:", error);
    return [];
  }
  
  return data || [];
}

// Search for properties online using web search
async function searchPropertiesOnline(query: string): Promise<string> {
  console.log("Searching online for:", query);
  
  try {
    // Use Lovable AI with a search-focused prompt
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return "Online search is not available at the moment.";
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
          {
            role: "system",
            content: `You are a real estate research assistant. When asked about properties or real estate markets, provide helpful information based on your knowledge. Include typical market conditions, property value estimates, and relevant real estate insights. Format your response clearly with bullet points or sections as needed.`
          },
          {
            role: "user",
            content: `Research and provide information about: ${query}. Include any relevant details about property values, market conditions, or real estate opportunities in this area.`
          }
        ],
        max_tokens: 1000,
      }),
    });
    
    if (!response.ok) {
      console.error("Online search failed:", response.status);
      return "Unable to complete online search at this time.";
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No online results found.";
  } catch (error) {
    console.error("Online search error:", error);
    return "Error performing online search.";
  }
}

// Format property results for display
function formatPropertyResults(properties: PropertySearchResult[]): string {
  if (properties.length === 0) {
    return "No properties found in your database matching that criteria.";
  }
  
  let result = `Found ${properties.length} properties in your database:\n\n`;
  
  properties.forEach((prop, index) => {
    result += `**${index + 1}. ${prop.address}**\n`;
    result += `   📍 ${prop.city}, ${prop.state} ${prop.zip}\n`;
    if (prop.asking_price) result += `   💰 Asking: $${prop.asking_price.toLocaleString()}\n`;
    if (prop.arv) result += `   📈 ARV: $${prop.arv.toLocaleString()}\n`;
    if (prop.bedrooms || prop.bathrooms) result += `   🏠 ${prop.bedrooms || 0} bed / ${prop.bathrooms || 0} bath\n`;
    if (prop.sqft) result += `   📐 ${prop.sqft.toLocaleString()} sqft\n`;
    if (prop.status) result += `   📋 Status: ${prop.status}\n`;
    result += "\n";
  });
  
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, searchType } = await req.json() as { 
      messages: Message[];
      searchType?: "database" | "online" | "both";
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extract user ID from JWT
    let userId = "";
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || "";
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    
    // Determine if this is a property search query
    const propertySearchKeywords = ["search", "find", "look for", "properties", "property", "houses", "homes", "deals", "listings", "in ", "near", "around"];
    const isPropertySearch = propertySearchKeywords.some(keyword => 
      lastUserMessage.toLowerCase().includes(keyword)
    );

    let additionalContext = "";
    
    if (isPropertySearch && userId) {
      // Search the database
      const dbResults = await searchPropertiesInDatabase(supabase, lastUserMessage, userId);
      
      if (dbResults.length > 0) {
        additionalContext += "\n\n**🔍 Properties from your database:**\n" + formatPropertyResults(dbResults);
      }
      
      // If user wants online search or no DB results
      if (searchType === "online" || searchType === "both" || dbResults.length === 0) {
        const onlineResults = await searchPropertiesOnline(lastUserMessage);
        additionalContext += "\n\n**🌐 Online Research:**\n" + onlineResults;
      }
    }

    // Prepare system prompt
    const systemPrompt = `You are AIVA (AI Virtual Assistant), an intelligent real estate assistant for professional investors and wholesalers.

Your capabilities:
1. **Property Search**: You can search the user's property database and provide online market research
2. **Deal Analysis**: Help analyze deals, calculate ARV, repair costs, and profit potential
3. **Lead Qualification**: Score and prioritize leads based on motivation and deal potential
4. **Market Intelligence**: Provide insights on real estate markets and trends
5. **Outreach Assistance**: Help craft personalized emails, texts, and follow-up sequences

When searching for properties:
- First check the user's database for matching properties
- Provide online market research for areas of interest
- Give actionable insights and recommendations

Be concise, professional, and focused on helping the user close more deals. Use markdown formatting for clarity.`;

    // Build the messages for the AI
    const aiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages
    ];
    
    // If we have property context, add it as an assistant message
    if (additionalContext) {
      aiMessages.push({
        role: "assistant",
        content: `I searched for properties based on your query. Here's what I found:${additionalContext}\n\nWould you like me to provide more details on any of these properties or search for something else?`
      });
    }

    // Call Lovable AI for the response
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: additionalContext ? aiMessages.slice(0, -1).concat([
          { role: "user", content: lastUserMessage + "\n\nContext from search:\n" + additionalContext }
        ]) : aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AIVA chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
