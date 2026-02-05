export interface ContactContext {
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

export interface BriefingData {
  oneLiner: string;
  insight: string;
  urgency: 'high' | 'medium' | 'low';
  keyFacts: {
    daysSinceContact: number | null;
    lastOffer: number | null;
    arv: number | null;
    equityPct: number | null;
    callCount: number;
  };
  recommendedApproach: string;
}

export interface Suggestion {
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SuggestionsData {
  phase: 'opening' | 'discovery' | 'negotiation' | 'closing';
  suggestions: Suggestion[];
}

export interface ObjectionData {
  category: string;
  objectionType: string;
  suggestedResponse: string;
  alternativeResponses: string[];
}

export interface SentimentData {
  sentiment: 'interested' | 'neutral' | 'resistant';
  confidence: number;
  indicators: string[];
}

export interface PostCallData {
  suggestedStage: string;
  followUpTask: {
    title: string;
    dueInDays: number;
    priority: 'high' | 'medium' | 'low';
  };
  draftSms: string | null;
  draftEmail: {
    subject: string;
    body: string;
  } | null;
  offerAdjustment: {
    direction: 'increase' | 'decrease' | 'creative_terms';
    reason: string;
  } | null;
}

export type CallMode = 'voice_agent' | 'listen_mode';

export type CopilotPhase = 'before' | 'during' | 'after';
