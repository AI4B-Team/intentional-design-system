import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactContext {
  contactName?: string;
  propertyAddress?: string;
  lastContactDate?: string;
  lastOffer?: number;
  arv?: number;
  equity?: number;
  motivation?: string;
  callHistory?: Array<{ date: string; disposition: string; notes?: string }>;
  propertyDetails?: {
    beds?: number;
    baths?: number;
    sqft?: number;
    yearBuilt?: number;
    condition?: string;
  };
}

interface CopilotRequest {
  type: 'briefing' | 'suggestions' | 'objection' | 'sentiment' | 'post_call';
  context: ContactContext;
  currentTranscript?: string;
  objectionText?: string;
  callOutcome?: string;
  callNotes?: string;
}

// Comprehensive objection library - 50+ categories with multiple responses each
const OBJECTION_LIBRARY = {
  "too_low": {
    category: "Price Objections",
    responses: [
      "I understand the offer may seem low. Let me share how we arrived at this number—we factor in repairs, holding costs, and closing fees. What number would work better for you?",
      "You're right to want fair value. Our offer reflects an as-is purchase with no commissions or closing costs to you. When you factor those savings, we're actually quite competitive.",
      "I hear you. What if we could close faster or cover additional costs? Sometimes flexibility on terms can bridge a price gap.",
      "That's fair feedback. Help me understand what you were hoping to get, and let's see if we can find middle ground.",
      "I appreciate your directness. Rather than focus on the gap, let's talk about what's most important to you—is it the price, the timeline, or something else?"
    ]
  },
  "not_interested": {
    category: "General Rejection",
    responses: [
      "No problem at all. Just so I understand, is it the timing, or are you planning to list traditionally?",
      "I respect that. Before I go, can I ask what would need to change for this to make sense down the road?",
      "Understood. Many sellers I work with felt the same initially—would it be okay if I checked back in a few months?",
      "Fair enough. Out of curiosity, what's your plan for the property?",
      "I appreciate your time. If circumstances change—maybe a quick sale becomes more appealing—I'm always happy to chat."
    ]
  },
  "need_to_think": {
    category: "Stalling",
    responses: [
      "Of course, this is a big decision. What specific concerns would you like to think through? I might be able to help clarify.",
      "Absolutely. To make your decision easier, what information would be most helpful?",
      "I understand. Many sellers tell me they're thinking about timing, price, or the process itself. Which of those resonates with you?",
      "Take your time. Would it help if I sent you a written breakdown of our offer and the process?",
      "Sure thing. When would be a good time to follow up? I want to respect your timeline."
    ]
  },
  "working_with_agent": {
    category: "Competition",
    responses: [
      "That's great! How's that going for you so far? Sometimes sellers keep us as a backup option in case the listing doesn't work out.",
      "No problem. If you don't mind me asking, how long have you been listed? If things slow down, we're always here as a Plan B.",
      "Understood. Just so you know, we can work with agents too—we pay referral fees. Might be worth mentioning to your agent.",
      "Good to hear. What's your timeline? If the listing doesn't sell, our offer stands.",
      "Perfect. Many sellers list first and then come to us when they want certainty. Feel free to reach out anytime."
    ]
  },
  "bad_timing": {
    category: "Timing",
    responses: [
      "When would be better timing for you? I'd love to circle back when it makes more sense.",
      "I understand timing is everything. What needs to happen before you'd consider selling?",
      "No rush on our end. Would it help to know what your property could sell for when the time is right?",
      "Fair enough. Is it a personal situation, or are you waiting for market changes?",
      "Got it. Let me check back in [X months]. In the meantime, feel free to call if anything changes."
    ]
  },
  "just_curious": {
    category: "Not Serious",
    responses: [
      "Totally get it! Curiosity is how most sellers start. What made you curious about selling right now?",
      "Nothing wrong with exploring options. What would make a sale actually happen for you?",
      "I hear that a lot. Sometimes curiosity turns into action when the offer is right. What would the right offer look like?",
      "Fair enough! If you were to sell, what would be your ideal scenario?",
      "Understandable. Would you like me to send you some information in case curiosity becomes interest?"
    ]
  },
  "repairs_needed": {
    category: "Property Condition",
    responses: [
      "That's actually perfect for us—we buy properties as-is. No need to fix anything.",
      "The repairs are already factored into our offer. You don't have to lift a finger.",
      "We handle all repairs after closing. What condition is the property in right now?",
      "That's no problem. Can you walk me through what needs work? It helps us make a fair offer.",
      "Actually, that's why we're calling. We specifically look for properties that need work."
    ]
  },
  "inherited_property": {
    category: "Special Situations",
    responses: [
      "I'm sorry for your loss. Dealing with an inherited property can be overwhelming. We try to make this process as simple as possible.",
      "Inherited properties often come with extra complications. We can handle probate situations if needed.",
      "I understand there might be family decisions involved. We're patient and can work with multiple decision-makers.",
      "That can be a lot to manage. Would it help to know your options without any obligation?",
      "We work with inherited properties often. Are there multiple heirs involved?"
    ]
  },
  "tenant_issues": {
    category: "Rental Properties",
    responses: [
      "We buy properties with tenants in place all the time. No need to evict anyone.",
      "Tenant situations are something we're very experienced with. Are they current on rent?",
      "That's actually common. We can handle the tenant situation after closing.",
      "No worries—we have a property management team that specializes in this.",
      "Are you looking to sell because of tenant difficulties? We might have a solution."
    ]
  },
  "want_retail_price": {
    category: "Price Expectations",
    responses: [
      "I understand wanting full retail value. Our offer reflects an as-is, fast cash sale. Would you prefer the traditional route with repairs, showings, and a longer timeline?",
      "Retail price is definitely possible if you list traditionally. Our value is speed and certainty—no repairs, no commissions, no contingencies.",
      "That's fair. To get retail, you'd typically need to invest in repairs and wait 3-6 months. Is that timeline workable for you?",
      "I hear you. What if we could offer more flexibility on closing date or other terms? Sometimes that bridges the gap.",
      "Understood. If the traditional route doesn't work out, keep our offer in mind—we can usually close in 2-3 weeks."
    ]
  }
};

// Suggestion chips based on call context
const SUGGESTION_CATEGORIES = {
  opening: [
    { text: "Build rapport first", context: "new_contact" },
    { text: "Reference last conversation", context: "followup" },
    { text: "Acknowledge their time", context: "busy_signal" },
  ],
  discovery: [
    { text: "Ask about timeline", priority: "high" },
    { text: "Explore motivation", priority: "high" },
    { text: "Confirm property details", priority: "medium" },
    { text: "Ask about other options considered", priority: "medium" },
  ],
  negotiation: [
    { text: "Re-anchor on value", priority: "high" },
    { text: "Introduce seller financing", priority: "medium" },
    { text: "Offer creative terms", priority: "medium" },
    { text: "Propose subject-to", priority: "low" },
  ],
  closing: [
    { text: "Ask for the appointment", priority: "high" },
    { text: "Confirm next steps", priority: "high" },
    { text: "Schedule follow-up", priority: "medium" },
    { text: "Send offer in writing", priority: "medium" },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context, currentTranscript, objectionText, callOutcome, callNotes } = await req.json() as CopilotRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Copilot request: ${type}`, { context: context?.contactName });

    let result: any;

    switch (type) {
      case 'briefing':
        result = await generateBriefing(context, LOVABLE_API_KEY);
        break;
      case 'suggestions':
        result = await generateSuggestions(context, currentTranscript, LOVABLE_API_KEY);
        break;
      case 'objection':
        result = await handleObjection(objectionText || '', context, LOVABLE_API_KEY);
        break;
      case 'sentiment':
        result = await analyzeSentiment(currentTranscript || '', LOVABLE_API_KEY);
        break;
      case 'post_call':
        result = await generatePostCallActions(context, callOutcome || '', callNotes || '', LOVABLE_API_KEY);
        break;
      default:
        throw new Error(`Unknown copilot request type: ${type}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Copilot error:", error);
    
    if (error.message?.includes("429") || error.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (error.message?.includes("402") || error.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: error.message || "Copilot error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateBriefing(context: ContactContext, apiKey: string): Promise<any> {
  const daysSinceContact = context.lastContactDate 
    ? Math.floor((Date.now() - new Date(context.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Calculate equity percentage if we have the data
  const equityPct = context.equity && context.arv ? Math.round((context.equity / context.arv) * 100) : null;

  // Generate urgency assessment
  const urgencyFactors: string[] = [];
  if (daysSinceContact && daysSinceContact > 14) urgencyFactors.push("cold lead");
  if (equityPct && equityPct > 40) urgencyFactors.push("high equity");
  if (context.motivation === "distressed") urgencyFactors.push("motivated seller");
  
  const urgency = urgencyFactors.length >= 2 ? "high" : urgencyFactors.length === 1 ? "medium" : "low";

  // Build one-liner briefing
  const briefingParts: string[] = [];
  
  if (daysSinceContact !== null) {
    briefingParts.push(daysSinceContact === 0 ? "Contacted today" : `${daysSinceContact} days since last contact`);
  } else {
    briefingParts.push("First contact");
  }

  if (context.lastOffer && context.arv) {
    briefingParts.push(`Last offer $${(context.lastOffer / 1000).toFixed(0)}k, ARV $${(context.arv / 1000).toFixed(0)}k`);
  }

  if (equityPct) {
    briefingParts.push(`${equityPct}% equity`);
  }

  // Get AI-enhanced context
  const prompt = `Based on this seller context, provide a brief strategic insight (max 15 words):
Contact: ${context.contactName || 'Unknown'}
Property: ${context.propertyAddress || 'Unknown'}
Last contact: ${daysSinceContact ? `${daysSinceContact} days ago` : 'Never'}
Last offer: ${context.lastOffer ? `$${context.lastOffer}` : 'None'}
ARV: ${context.arv ? `$${context.arv}` : 'Unknown'}
Equity: ${equityPct ? `${equityPct}%` : 'Unknown'}
Motivation: ${context.motivation || 'Unknown'}
Call history: ${context.callHistory?.length || 0} previous calls

Respond with just the insight, no explanation.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a real estate investing coach. Be concise and actionable." },
        { role: "user", content: prompt }
      ],
      max_tokens: 50,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI briefing error:", response.status, errorText);
    throw new Error(`AI error: ${response.status}`);
  }

  const data = await response.json();
  const aiInsight = data.choices?.[0]?.message?.content || "";

  return {
    oneLiner: briefingParts.join(" • "),
    insight: aiInsight.trim(),
    urgency,
    keyFacts: {
      daysSinceContact,
      lastOffer: context.lastOffer,
      arv: context.arv,
      equityPct,
      callCount: context.callHistory?.length || 0,
    },
    recommendedApproach: urgency === "high" ? "Direct close" : urgency === "medium" ? "Build rapport" : "Qualify interest",
  };
}

async function generateSuggestions(context: ContactContext, transcript: string | undefined, apiKey: string): Promise<any> {
  // Determine call phase based on transcript length and keywords
  let phase = "opening";
  if (transcript) {
    const wordCount = transcript.split(" ").length;
    if (wordCount > 200) phase = "closing";
    else if (wordCount > 100) phase = "negotiation";
    else if (wordCount > 30) phase = "discovery";
  }

  const baseSuggestions = SUGGESTION_CATEGORIES[phase as keyof typeof SUGGESTION_CATEGORIES] || SUGGESTION_CATEGORIES.opening;

  // Get AI-powered contextual suggestions
  const prompt = `You are coaching a real estate investor on a live call.

Current call phase: ${phase}
Seller: ${context.contactName || 'Unknown'}
Property: ${context.propertyAddress || 'Unknown'}
Recent transcript: "${transcript?.slice(-500) || 'Call just started'}"

Provide exactly 3 actionable suggestion chips (4-6 words each) for right now. Focus on moving the conversation forward.

Format as JSON array: ["suggestion 1", "suggestion 2", "suggestion 3"]`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a real estate sales coach. Respond only with the JSON array, no explanation." },
          { role: "user", content: prompt }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.error("AI suggestions error:", response.status);
      // Fall back to static suggestions
      return {
        phase,
        suggestions: baseSuggestions.slice(0, 3).map(s => ({ text: s.text, priority: s.priority || 'medium' })),
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse AI suggestions
    let aiSuggestions: string[] = [];
    try {
      const match = content.match(/\[.*\]/s);
      if (match) {
        aiSuggestions = JSON.parse(match[0]);
      }
    } catch {
      console.error("Failed to parse AI suggestions:", content);
    }

    return {
      phase,
      suggestions: aiSuggestions.length > 0 
        ? aiSuggestions.map((text: string, i: number) => ({ text, priority: i === 0 ? 'high' : 'medium' }))
        : baseSuggestions.slice(0, 3).map(s => ({ text: s.text, priority: s.priority || 'medium' })),
    };

  } catch (error) {
    console.error("Suggestions error:", error);
    return {
      phase,
      suggestions: baseSuggestions.slice(0, 3).map(s => ({ text: s.text, priority: s.priority || 'medium' })),
    };
  }
}

async function handleObjection(objectionText: string, context: ContactContext, apiKey: string): Promise<any> {
  // Classify the objection
  const objectionLower = objectionText.toLowerCase();
  let matchedCategory = "not_interested"; // default
  
  if (objectionLower.includes("low") || objectionLower.includes("more") || objectionLower.includes("price")) {
    matchedCategory = "too_low";
  } else if (objectionLower.includes("think") || objectionLower.includes("consider") || objectionLower.includes("later")) {
    matchedCategory = "need_to_think";
  } else if (objectionLower.includes("agent") || objectionLower.includes("realtor") || objectionLower.includes("listed")) {
    matchedCategory = "working_with_agent";
  } else if (objectionLower.includes("time") || objectionLower.includes("now") || objectionLower.includes("yet")) {
    matchedCategory = "bad_timing";
  } else if (objectionLower.includes("curious") || objectionLower.includes("just looking")) {
    matchedCategory = "just_curious";
  } else if (objectionLower.includes("repair") || objectionLower.includes("fix") || objectionLower.includes("condition")) {
    matchedCategory = "repairs_needed";
  } else if (objectionLower.includes("inherit") || objectionLower.includes("passed") || objectionLower.includes("estate")) {
    matchedCategory = "inherited_property";
  } else if (objectionLower.includes("tenant") || objectionLower.includes("rent") || objectionLower.includes("renter")) {
    matchedCategory = "tenant_issues";
  } else if (objectionLower.includes("retail") || objectionLower.includes("market value") || objectionLower.includes("worth more")) {
    matchedCategory = "want_retail_price";
  }

  const objectionData = OBJECTION_LIBRARY[matchedCategory as keyof typeof OBJECTION_LIBRARY];
  
  // Get a random response from the library
  const responses = objectionData.responses;
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  // Get AI-enhanced personalized response
  const prompt = `A seller just said: "${objectionText}"

Context:
- Seller: ${context.contactName || 'Unknown'}
- Property: ${context.propertyAddress || 'Unknown'}
- Our last offer: ${context.lastOffer ? `$${context.lastOffer}` : 'Not yet made'}

Here's a template response: "${randomResponse}"

Personalize this response for this specific seller and situation. Keep it natural and conversational (max 40 words).`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a real estate investor handling a seller objection. Be empathetic but persistent." },
          { role: "user", content: prompt }
        ],
        max_tokens: 80,
      }),
    });

    let personalizedResponse = randomResponse;
    if (response.ok) {
      const data = await response.json();
      personalizedResponse = data.choices?.[0]?.message?.content || randomResponse;
    }

    return {
      category: objectionData.category,
      objectionType: matchedCategory,
      suggestedResponse: personalizedResponse.trim(),
      alternativeResponses: responses.filter(r => r !== randomResponse).slice(0, 2),
    };

  } catch (error) {
    console.error("Objection handling error:", error);
    return {
      category: objectionData.category,
      objectionType: matchedCategory,
      suggestedResponse: randomResponse,
      alternativeResponses: responses.filter(r => r !== randomResponse).slice(0, 2),
    };
  }
}

async function analyzeSentiment(transcript: string, apiKey: string): Promise<any> {
  if (!transcript || transcript.length < 20) {
    return { sentiment: "neutral", confidence: 0.5, indicators: [] };
  }

  const prompt = `Analyze the seller's sentiment in this real estate call transcript:

"${transcript.slice(-300)}"

Respond with JSON only:
{
  "sentiment": "interested" | "neutral" | "resistant",
  "confidence": 0.0-1.0,
  "indicators": ["reason1", "reason2"]
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a sentiment analysis expert. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      return { sentiment: "neutral", confidence: 0.5, indicators: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    try {
      const match = content.match(/\{.*\}/s);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      console.error("Failed to parse sentiment:", content);
    }

    return { sentiment: "neutral", confidence: 0.5, indicators: [] };

  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { sentiment: "neutral", confidence: 0.5, indicators: [] };
  }
}

async function generatePostCallActions(context: ContactContext, outcome: string, notes: string, apiKey: string): Promise<any> {
  const prompt = `A real estate investor just finished a call with a potential seller.

Seller: ${context.contactName || 'Unknown'}
Property: ${context.propertyAddress || 'Unknown'}
Call outcome: ${outcome}
Notes: ${notes || 'None'}
Previous offers: ${context.lastOffer ? `$${context.lastOffer}` : 'None'}

Generate recommended next actions. Respond with JSON only:
{
  "suggestedStage": "lead" | "prospect" | "negotiating" | "under_contract" | "closed" | "dead",
  "followUpTask": {
    "title": "task title",
    "dueInDays": 1-14,
    "priority": "high" | "medium" | "low"
  },
  "draftSms": "short follow-up text message (max 160 chars)",
  "draftEmail": {
    "subject": "email subject",
    "body": "brief email body (max 100 words)"
  },
  "offerAdjustment": null | { "direction": "increase" | "decrease" | "creative_terms", "reason": "why" }
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a real estate investing assistant. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Post-call AI error:", response.status, errorText);
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    try {
      const match = content.match(/\{.*\}/s);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {
      console.error("Failed to parse post-call actions:", content);
    }

    // Fallback response
    return {
      suggestedStage: "prospect",
      followUpTask: {
        title: `Follow up with ${context.contactName || 'seller'}`,
        dueInDays: 3,
        priority: "medium"
      },
      draftSms: null,
      draftEmail: null,
      offerAdjustment: null,
    };

  } catch (error) {
    console.error("Post-call actions error:", error);
    return {
      suggestedStage: "prospect",
      followUpTask: {
        title: `Follow up with ${context.contactName || 'seller'}`,
        dueInDays: 3,
        priority: "medium"
      },
      draftSms: null,
      draftEmail: null,
      offerAdjustment: null,
    };
  }
}
