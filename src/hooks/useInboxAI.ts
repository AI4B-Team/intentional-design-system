import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { InboxMessage } from "./useAcquireFlow";

export interface MessageAnalysis {
  priority: {
    score: number;
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

export interface QuickTemplate {
  id: string;
  name: string;
  category: 'follow-up' | 'counter-offer' | 'scheduling' | 'closing' | 'general';
  template: string;
  variables: string[];
}

export const DEFAULT_QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: "1",
    name: "Quick Callback",
    category: "follow-up",
    template: "Hi {{name}}, thanks for reaching out about {{property}}. I'd love to connect - when's a good time for a quick call?",
    variables: ["name", "property"]
  },
  {
    id: "2",
    name: "Counter Offer",
    category: "counter-offer",
    template: "Thank you for your response. I understand your position. Would {{amount}} work for you? We can close in {{days}} days.",
    variables: ["amount", "days"]
  },
  {
    id: "3",
    name: "Schedule Viewing",
    category: "scheduling",
    template: "I'm available to meet at the property this {{day}}. Would {{time}} work for you?",
    variables: ["day", "time"]
  },
  {
    id: "4",
    name: "Urgency Close",
    category: "closing",
    template: "I appreciate your interest! To lock in this offer, I'll need confirmation by {{deadline}}. Ready to move forward?",
    variables: ["deadline"]
  },
  {
    id: "5",
    name: "Soft Follow-up",
    category: "general",
    template: "Hi {{name}}, just checking in on my previous message about {{property}}. Still interested in discussing?",
    variables: ["name", "property"]
  },
  {
    id: "6",
    name: "Motivated Buyer Response",
    category: "follow-up",
    template: "Great to hear from you! I'm very interested in {{property}}. What's your ideal timeline and are there any specific terms that would make this work for you?",
    variables: ["property"]
  }
];

// AI Analysis for messages
export function useAnalyzeMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messages: InboxMessage[]) => {
      const { data, error } = await supabase.functions.invoke('ai-inbox-analysis', {
        body: { messages }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Analysis failed');
      
      return data.results as Record<string, MessageAnalysis>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-analyses"] });
    },
    onError: (error: Error) => {
      if (error.message?.includes('429')) {
        toast.error("Rate limit reached. Please try again in a moment.");
      } else if (error.message?.includes('402')) {
        toast.error("AI credits exhausted. Please add more credits.");
      } else {
        toast.error("Failed to analyze messages");
      }
    }
  });
}

// Cache for analyses
export function useMessageAnalysis(messageId: string) {
  return useQuery({
    queryKey: ["message-analysis", messageId],
    queryFn: async () => {
      // Check local storage first
      const cached = localStorage.getItem(`inbox-analysis-${messageId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Cache for 1 hour
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed.data as MessageAnalysis;
        }
      }
      return null;
    },
    staleTime: 3600000, // 1 hour
  });
}

export function cacheMessageAnalysis(messageId: string, analysis: MessageAnalysis) {
  localStorage.setItem(`inbox-analysis-${messageId}`, JSON.stringify({
    data: analysis,
    timestamp: Date.now()
  }));
}

// Quick templates
export function useQuickTemplates() {
  return useQuery({
    queryKey: ["quick-templates"],
    queryFn: async () => {
      // For now return defaults, can be extended to fetch from DB
      return DEFAULT_QUICK_TEMPLATES;
    },
    staleTime: Infinity,
  });
}

// Fill template with variables
export function fillTemplate(template: string, values: Record<string, string>): string {
  let result = template;
  Object.entries(values).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
}

// Get priority color
export function getPriorityColor(level: MessageAnalysis['priority']['level']) {
  switch (level) {
    case 'urgent': return 'text-destructive';
    case 'high': return 'text-warning';
    case 'medium': return 'text-info';
    case 'low': return 'text-muted-foreground';
  }
}

export function getPriorityBg(level: MessageAnalysis['priority']['level']) {
  switch (level) {
    case 'urgent': return 'bg-destructive/10 border-destructive/30';
    case 'high': return 'bg-warning/10 border-warning/30';
    case 'medium': return 'bg-info/10 border-info/30';
    case 'low': return 'bg-muted border-border';
  }
}

// Get sentiment display
export function getSentimentDisplay(type: MessageAnalysis['sentiment']['type']) {
  const config = {
    positive: { emoji: '😊', label: 'Positive', color: 'text-success' },
    neutral: { emoji: '😐', label: 'Neutral', color: 'text-muted-foreground' },
    negative: { emoji: '😟', label: 'Negative', color: 'text-destructive' },
    eager: { emoji: '🔥', label: 'Eager', color: 'text-warning' },
    frustrated: { emoji: '😤', label: 'Frustrated', color: 'text-destructive' },
    skeptical: { emoji: '🤔', label: 'Skeptical', color: 'text-info' },
  };
  return config[type] || config.neutral;
}
