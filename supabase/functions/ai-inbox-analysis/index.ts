import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface InboxMessage {
  id: string;
  contact_name: string | null;
  contact_type: string | null;
  channel: string;
  subject: string | null;
  body: string | null;
  direction: string;
  created_at: string;
  properties?: { address: string; city: string | null; state: string | null } | null;
  offers?: { offer_amount: number } | null;
}

interface AnalysisResult {
  priority: {
    score: number; // 0-100
    level: 'urgent' | 'high' | 'medium' | 'low';
    reason: string;
  };
  sentiment: {
    type: 'positive' | 'neutral' | 'negative' | 'eager' | 'frustrated' | 'skeptical';
    confidence: number;
    indicators: string[];
  };
  summary: string;
  suggestedResponse: string;
  responseTimeAlert: {
    shouldAlert: boolean;
    message: string | null;
    deadline: string | null;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, analysisType = 'full' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const messageList = Array.isArray(messages) ? messages : [messages];
    const results: Record<string, AnalysisResult> = {};

    // Process messages in batches for efficiency
    const batchSize = 5;
    for (let i = 0; i < messageList.length; i += batchSize) {
      const batch = messageList.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (message: InboxMessage) => {
        const context = buildMessageContext(message);
        
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
                content: `You are an expert real estate deal analyst. Analyze incoming messages to help investors prioritize and respond effectively.

For each message, provide:
1. Priority Score (0-100) with level (urgent/high/medium/low) and reasoning
2. Sentiment Analysis - detect if sender is positive, negative, eager, frustrated, or skeptical
3. One-sentence summary (max 15 words)
4. Suggested response opener (one sentence that addresses their concern/interest)
5. Response time alert - if urgent, provide recommended response deadline

Priority scoring factors:
- Motivated seller language (+30): "need to sell fast", "behind on payments", "relocating"
- Counter-offer (+25): any price negotiation
- Hot lead signals (+20): "interested", "let's talk", "call me"
- Time-sensitive (+15): mentions deadlines, urgency
- Agent involvement (-5): typically slower process
- Just browsing (-10): "just curious", "not ready yet"`
              },
              {
                role: "user",
                content: context
              }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "analyze_message",
                  description: "Return structured analysis of the inbox message",
                  parameters: {
                    type: "object",
                    properties: {
                      priority: {
                        type: "object",
                        properties: {
                          score: { type: "number", description: "0-100 priority score" },
                          level: { type: "string", enum: ["urgent", "high", "medium", "low"] },
                          reason: { type: "string", description: "Brief reason for priority level" }
                        },
                        required: ["score", "level", "reason"]
                      },
                      sentiment: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["positive", "neutral", "negative", "eager", "frustrated", "skeptical"] },
                          confidence: { type: "number", description: "0-1 confidence" },
                          indicators: { type: "array", items: { type: "string" }, description: "Key phrases indicating sentiment" }
                        },
                        required: ["type", "confidence", "indicators"]
                      },
                      summary: { type: "string", description: "One-sentence summary, max 15 words" },
                      suggestedResponse: { type: "string", description: "Suggested response opener" },
                      responseTimeAlert: {
                        type: "object",
                        properties: {
                          shouldAlert: { type: "boolean" },
                          message: { type: "string", nullable: true },
                          deadline: { type: "string", nullable: true, description: "ISO timestamp" }
                        },
                        required: ["shouldAlert"]
                      }
                    },
                    required: ["priority", "sentiment", "summary", "suggestedResponse", "responseTimeAlert"]
                  }
                }
              }
            ],
            tool_choice: { type: "function", function: { name: "analyze_message" } }
          }),
        });

        if (!response.ok) {
          console.error("AI gateway error:", response.status);
          return { id: message.id, analysis: getDefaultAnalysis() };
        }

        const data = await response.json();
        const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall?.function?.arguments) {
          try {
            const analysis = JSON.parse(toolCall.function.arguments);
            return { id: message.id, analysis };
          } catch {
            return { id: message.id, analysis: getDefaultAnalysis() };
          }
        }
        
        return { id: message.id, analysis: getDefaultAnalysis() };
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, analysis }) => {
        results[id] = analysis;
      });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("ai-inbox-analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Analysis failed",
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function buildMessageContext(message: InboxMessage): string {
  const parts = [
    `Channel: ${message.channel}`,
    `Direction: ${message.direction}`,
    `Contact: ${message.contact_name || 'Unknown'} (${message.contact_type || 'Unknown type'})`,
    message.subject ? `Subject: ${message.subject}` : null,
    `Message: ${message.body || '(no content)'}`,
    message.properties ? `Property: ${message.properties.address}, ${message.properties.city || ''} ${message.properties.state || ''}` : null,
    message.offers ? `Related Offer: $${message.offers.offer_amount.toLocaleString()}` : null,
    `Received: ${message.created_at}`
  ];
  
  return parts.filter(Boolean).join('\n');
}

function getDefaultAnalysis(): AnalysisResult {
  return {
    priority: { score: 50, level: 'medium', reason: 'Standard message' },
    sentiment: { type: 'neutral', confidence: 0.5, indicators: [] },
    summary: 'Message requires review',
    suggestedResponse: 'Thank you for reaching out. I would be happy to discuss this further.',
    responseTimeAlert: { shouldAlert: false, message: null, deadline: null }
  };
}
