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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context, currentTranscript, objectionText, callOutcome, callNotes } = await req.json();
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
        result = await analyzeSentiment(currentTranscript || '');
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
    const status = error.message?.includes("429") ? 429 : error.message?.includes("402") ? 402 : 500;
    return new Response(JSON.stringify({ error: error.message || "Copilot error" }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateBriefing(context: ContactContext, apiKey: string) {
  const daysSinceContact = context.lastContactDate 
    ? Math.floor((Date.now() - new Date(context.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const equityPct = context.equity && context.arv ? Math.round((context.equity / context.arv) * 100) : null;

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

  const urgencyFactors = [
    daysSinceContact && daysSinceContact > 14,
    equityPct && equityPct > 40,
    context.motivation === "distressed"
  ].filter(Boolean).length;
  const urgency = urgencyFactors >= 2 ? "high" : urgencyFactors === 1 ? "medium" : "low";

  const prompt = `Seller context - give a 15-word strategic insight:
Name: ${context.contactName || 'Unknown'}, Property: ${context.propertyAddress || 'Unknown'}
Last contact: ${daysSinceContact ?? 'Never'} days, Last offer: ${context.lastOffer || 'None'}, ARV: ${context.arv || 'Unknown'}
Respond with just the insight.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
      }),
    });
    const data = await response.json();
    const aiInsight = data.choices?.[0]?.message?.content || "Focus on building rapport";

    return {
      oneLiner: briefingParts.join(" • "),
      insight: aiInsight.trim(),
      urgency,
      keyFacts: { daysSinceContact, lastOffer: context.lastOffer, arv: context.arv, equityPct, callCount: context.callHistory?.length || 0 },
      recommendedApproach: urgency === "high" ? "Direct close" : urgency === "medium" ? "Build rapport" : "Qualify interest",
    };
  } catch {
    return {
      oneLiner: briefingParts.join(" • "),
      insight: "Focus on understanding their situation",
      urgency,
      keyFacts: { daysSinceContact, lastOffer: context.lastOffer, arv: context.arv, equityPct, callCount: context.callHistory?.length || 0 },
      recommendedApproach: "Build rapport",
    };
  }
}

async function generateSuggestions(context: ContactContext, transcript: string | undefined, apiKey: string) {
  const wordCount = transcript?.split(" ").length || 0;
  const phase = wordCount > 200 ? "closing" : wordCount > 100 ? "negotiation" : wordCount > 30 ? "discovery" : "opening";

  const defaultSuggestions = {
    opening: ["Build rapport first", "Reference their property", "Ask about timeline"],
    discovery: ["Explore their motivation", "Ask about timeline", "Confirm property details"],
    negotiation: ["Re-anchor on value", "Offer creative terms", "Introduce seller financing"],
    closing: ["Ask for the appointment", "Confirm next steps", "Schedule follow-up"],
  };

  const prompt = `Real estate call coaching. Phase: ${phase}. Seller: ${context.contactName || 'Unknown'}. 
Give 3 short action suggestions (4-6 words each). JSON array only: ["s1", "s2", "s3"]`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 80,
      }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    const match = content.match(/\[.*\]/s);
    const suggestions = match ? JSON.parse(match[0]) : defaultSuggestions[phase];
    return { phase, suggestions: suggestions.slice(0, 3).map((text: string, i: number) => ({ text, priority: i === 0 ? 'high' : 'medium' })) };
  } catch {
    return { phase, suggestions: defaultSuggestions[phase].map((text, i) => ({ text, priority: i === 0 ? 'high' : 'medium' })) };
  }
}

async function handleObjection(objectionText: string, context: ContactContext, apiKey: string) {
  const prompt = `Seller said: "${objectionText}"
Property: ${context.propertyAddress || 'Unknown'}

Give a professional response (2-3 sentences) to handle this objection. Be empathetic and solution-focused.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a real estate investing coach helping with objection handling." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I understand your concern. Let me address that...";
    
    // Classify objection type
    const lower = objectionText.toLowerCase();
    let category = "general";
    if (lower.includes("low") || lower.includes("price")) category = "price";
    else if (lower.includes("think") || lower.includes("later")) category = "stalling";
    else if (lower.includes("agent") || lower.includes("listed")) category = "competition";
    else if (lower.includes("time")) category = "timing";

    return {
      category,
      suggestedResponse: aiResponse.trim(),
      alternativeApproaches: ["Acknowledge and pivot", "Ask clarifying questions", "Offer flexibility"],
    };
  } catch {
    return {
      category: "general",
      suggestedResponse: "I completely understand. Many sellers feel the same way initially. What would need to change for this to make sense for you?",
      alternativeApproaches: ["Acknowledge their concern", "Ask clarifying questions", "Offer to follow up later"],
    };
  }
}

function analyzeSentiment(transcript: string) {
  if (!transcript || transcript.length < 20) {
    return { sentiment: "neutral", confidence: 0.5, indicators: [] };
  }

  const lower = transcript.toLowerCase();
  const positiveWords = ["yes", "interested", "great", "sounds good", "tell me more", "okay", "sure", "definitely"];
  const negativeWords = ["no", "not interested", "stop", "don't call", "too low", "never", "busy", "can't"];

  const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
  const negativeCount = negativeWords.filter(w => lower.includes(w)).length;

  let sentiment = "neutral";
  let confidence = 0.5;
  const indicators: string[] = [];

  if (positiveCount > negativeCount + 1) {
    sentiment = "positive";
    confidence = Math.min(0.9, 0.5 + positiveCount * 0.1);
    indicators.push("Using positive language");
  } else if (negativeCount > positiveCount + 1) {
    sentiment = "negative";
    confidence = Math.min(0.9, 0.5 + negativeCount * 0.1);
    indicators.push("Showing resistance");
  }

  return { sentiment, confidence, indicators };
}

async function generatePostCallActions(context: ContactContext, outcome: string, notes: string, apiKey: string) {
  const prompt = `Call ended. Outcome: ${outcome}. Notes: ${notes}. Seller: ${context.contactName || 'Unknown'}.
Suggest: 1) Next pipeline stage, 2) Follow-up task, 3) Short SMS message.
JSON format: {"stage": "...", "task": "...", "sms": "..."}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
      }),
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const match = content.match(/\{.*\}/s);
    const parsed = match ? JSON.parse(match[0]) : {};

    return {
      suggestedStage: parsed.stage || "Follow Up",
      tasks: [{ title: parsed.task || "Follow up with seller", dueIn: "3 days", priority: "medium" }],
      draftSms: parsed.sms || `Hi ${context.contactName?.split(" ")[0] || "there"}, thanks for chatting today. Let me know if you have any questions!`,
      draftEmail: { subject: `Following up - ${context.propertyAddress || "Your Property"}`, body: "Thank you for your time..." },
    };
  } catch {
    return {
      suggestedStage: "Follow Up",
      tasks: [{ title: "Follow up with seller", dueIn: "3 days", priority: "medium" }],
      draftSms: `Hi ${context.contactName?.split(" ")[0] || "there"}, thanks for chatting. Let me know if you have questions!`,
      draftEmail: { subject: `Following up - ${context.propertyAddress || "Your Property"}`, body: "Thank you for your time on the call today." },
    };
  }
}
