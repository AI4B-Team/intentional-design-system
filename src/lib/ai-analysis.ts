/**
 * AI Analysis Architecture
 * 
 * This module provides AI-powered analysis functions for real estate investing.
 * Uses Lovable AI gateway via the ai-property-analysis edge function.
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// ============ TYPES ============

export interface PropertyAnalysisInput {
  property: {
    id: string;
    address: string;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    beds?: number | null;
    baths?: number | null;
    sqft?: number | null;
    year_built?: number | null;
    property_type?: string | null;
    estimated_value?: number | null;
    arv?: number | null;
    repair_estimate?: number | null;
    mortgage_balance?: number | null;
    mortgage_rate?: number | null;
    equity_percent?: number | null;
    owner_name?: string | null;
    distress_signals?: any | null;
    motivation_score?: number | null;
  };
  comps?: Array<{
    id: string;
    comp_address: string;
    sale_price?: number | null;
    sqft?: number | null;
    beds?: number | null;
    baths?: number | null;
    sale_date?: string | null;
    distance_miles?: number | null;
    adjusted_value?: number | null;
    adjustments?: any | null;
    rating?: string | null;
  }>;
  photos?: string[];
}

export interface DistressSignal {
  signal: string;
  points: number;
  details: string;
}

export interface DistressAnalysis {
  motivation_score: number;
  distress_signals: DistressSignal[];
  priority: 'IMMEDIATE' | 'THIS_WEEK' | 'NURTURE' | 'SKIP';
  reasoning: string;
  recommended_contact_strategy: string;
}

export interface CompAnalysis {
  address: string;
  sale_price: number;
  adjusted_value: number;
  rating: 'STRONG' | 'MODERATE' | 'WEAK';
  adjustments: Array<{ type: string; amount: number; reason: string }>;
}

export interface ARVAnalysis {
  arv: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  value_range: { low: number; high: number };
  comps_analysis: CompAnalysis[];
  reasoning: string;
}

export interface RepairItem {
  category: string;
  description: string;
  cost: number;
}

export interface RepairEstimate {
  total_estimate: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  condition_score: number;
  itemized_repairs: RepairItem[];
  contingency: number;
  notes: string;
}

export interface OfferTier {
  amount: number;
  arv_percentage: number;
  spread: number;
}

export interface OfferRecommendation {
  offers: {
    aggressive: OfferTier;
    standard: OfferTier;
    conservative: OfferTier;
  };
  recommended_opening: number;
  maximum_offer: number;
  reasoning: string;
  negotiation_tips: string[];
}

export interface ExitStrategy {
  strategy: string;
  profit_potential: number;
  timeline: string;
  capital_required: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  pros: string[];
  cons: string[];
}

export interface ExitStrategyAnalysis {
  recommended_exit: string;
  reasoning: string;
  strategies: ExitStrategy[];
}

export interface UserPreferences {
  available_capital?: number;
  preferred_timeline?: string;
  risk_tolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
  experience_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  exit_preferences?: string[];
}

export interface BuyerInfo {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  license_number?: string;
}

export interface OfferDetails {
  amount: number;
  earnest_money: number;
  inspection_period_days: number;
  closing_days: number;
  contingencies?: string[];
}

// ============ HELPER ============

async function callAI<T>(systemPrompt: string, userPrompt: string, action: string): Promise<T> {
  const { data, error } = await supabase.functions.invoke('ai-property-analysis', {
    body: { systemPrompt, userPrompt, action },
  });

  if (error) throw error;

  if (data?.error) {
    throw new Error(data.error);
  }

  return data.result as T;
}

// ============ ANALYSIS FUNCTIONS ============

export async function analyzeDistress(input: PropertyAnalysisInput): Promise<DistressAnalysis> {
  return callAI<DistressAnalysis>(
    "You are an expert real estate distress analyst. Analyze seller motivation and return ONLY valid JSON matching this exact structure: { motivation_score: number (0-1000), distress_signals: [{signal: string, points: number, details: string}], priority: 'IMMEDIATE'|'THIS_WEEK'|'NURTURE'|'SKIP', reasoning: string, recommended_contact_strategy: string }. Score above 700 = IMMEDIATE, 500-699 = THIS_WEEK, 300-499 = NURTURE, below 300 = SKIP.",
    `Analyze this property owner's distress signals and motivation to sell below market value:

Property: ${input.property.address}, ${input.property.city} ${input.property.state}
Equity: ${input.property.equity_percent}%
Mortgage Balance: $${input.property.mortgage_balance}
Estimated Value: $${input.property.estimated_value}
Year Built: ${input.property.year_built}
Owner: ${input.property.owner_name}
Known Distress Signals: ${JSON.stringify(input.property.distress_signals)}
Motivation Score (existing): ${input.property.motivation_score}

Return only valid JSON.`,
    'analyzeDistress'
  );
}

export async function calculateARV(input: PropertyAnalysisInput): Promise<ARVAnalysis> {
  return callAI<ARVAnalysis>(
    "You are an expert real estate appraiser. Analyze comparable sales and return ONLY valid JSON: { arv: number, confidence: 'HIGH'|'MEDIUM'|'LOW', value_range: {low: number, high: number}, comps_analysis: [{address: string, sale_price: number, adjusted_value: number, rating: 'STRONG'|'MODERATE'|'WEAK', adjustments: [{type: string, amount: number, reason: string}]}], reasoning: string }. Be conservative. HIGH confidence = 3+ strong comps within 0.25 miles sold <6 months ago.",
    `Calculate the After Repair Value for this property using the comparable sales provided:

Subject Property: ${input.property.address}
Beds/Baths: ${input.property.beds}/${input.property.baths}
Sqft: ${input.property.sqft}
Year Built: ${input.property.year_built}
Property Type: ${input.property.property_type}
Existing ARV Estimate: $${input.property.arv}
Comps: ${JSON.stringify(input.comps)}

Return only valid JSON.`,
    'calculateARV'
  );
}

export async function estimateRepairs(input: PropertyAnalysisInput): Promise<RepairEstimate> {
  return callAI<RepairEstimate>(
    "You are an expert real estate repair estimator with 20 years of contractor experience. Estimate repairs and return ONLY valid JSON: { total_estimate: number, confidence: 'HIGH'|'MEDIUM'|'LOW', condition_score: number (1-10, 10=perfect), itemized_repairs: [{category: string, description: string, cost: number}], contingency: number, notes: string }. Use current 2024-2025 contractor pricing. Always add 10-15% contingency.",
    `Estimate repair costs for this property:

Address: ${input.property.address}
Year Built: ${input.property.year_built} (${new Date().getFullYear() - (input.property.year_built || 1990)} years old)
Sqft: ${input.property.sqft}
Property Type: ${input.property.property_type}
Beds/Baths: ${input.property.beds}/${input.property.baths}
Photos Available: ${input.photos?.length || 0}
Known repair estimate: $${input.property.repair_estimate}

Provide itemized breakdown by category (Kitchen, Bathrooms, Flooring, Paint, Roof, HVAC, Electrical, Plumbing, Exterior). Return only valid JSON.`,
    'estimateRepairs'
  );
}

export async function generateOfferRecommendation(input: PropertyAnalysisInput): Promise<OfferRecommendation> {
  return callAI<OfferRecommendation>(
    "You are an expert real estate wholesaler and negotiator. Generate offer recommendations and return ONLY valid JSON: { offers: { aggressive: {amount: number, arv_percentage: number, spread: number}, standard: {amount: number, arv_percentage: number, spread: number}, conservative: {amount: number, arv_percentage: number, spread: number} }, recommended_opening: number, maximum_offer: number, reasoning: string, negotiation_tips: string[] }. MAO formula: ARV × percentage - repairs - wholesale fee ($10,000). Aggressive=75% ARV, Standard=70%, Conservative=65%.",
    `Generate offer recommendations for this wholesale deal:

Property: ${input.property.address}
ARV: $${input.property.arv}
Repair Estimate: $${input.property.repair_estimate}
Asking Price: $${input.property.estimated_value}
Seller Motivation Score: ${input.property.motivation_score}/1000
Equity: ${input.property.equity_percent}%
Mortgage Balance: $${input.property.mortgage_balance}

Provide three offer tiers with negotiation tips specific to this seller's situation. Return only valid JSON.`,
    'generateOfferRecommendation'
  );
}

export async function analyzeExitStrategies(
  input: PropertyAnalysisInput,
  userPreferences: UserPreferences = {}
): Promise<ExitStrategyAnalysis> {
  return callAI<ExitStrategyAnalysis>(
    "You are a real estate investment strategist. Analyze exit strategies and return ONLY valid JSON: { recommended_exit: string, reasoning: string, strategies: [{strategy: string, profit_potential: number, timeline: string, capital_required: number, risk_level: 'LOW'|'MEDIUM'|'HIGH', pros: string[], cons: string[]}] }. Always include: Wholesale, Fix & Flip, BRRRR, and Subject-To/Creative Finance.",
    `Analyze exit strategies for this property:

Address: ${input.property.address}
ARV: $${input.property.arv}
Repair Estimate: $${input.property.repair_estimate}
Current Mortgage: $${input.property.mortgage_balance} at ${input.property.mortgage_rate}%
Equity: ${input.property.equity_percent}%

Investor Preferences:
- Available Capital: $${userPreferences.available_capital || 'Unknown'}
- Risk Tolerance: ${userPreferences.risk_tolerance || 'MEDIUM'}
- Experience Level: ${userPreferences.experience_level || 'INTERMEDIATE'}
- Preferred Timeline: ${userPreferences.preferred_timeline || 'Flexible'}

Return only valid JSON.`,
    'analyzeExitStrategies'
  );
}

export async function generateOfferLetter(
  property: PropertyAnalysisInput['property'],
  offer: OfferDetails,
  buyerInfo: BuyerInfo
): Promise<string> {
  const result = await callAI<{ letter: string }>(
    "You are a professional real estate attorney's paralegal. Generate a formal, professional Letter of Intent to Purchase. Return ONLY valid JSON: { letter: string }. The letter should be formal, include all provided terms, and end with a note that it's for discussion purposes only and not a binding contract.",
    `Generate a Letter of Intent for this real estate transaction:

Property: ${property.address}, ${property.city} ${property.state} ${property.zip}
Owner: ${property.owner_name || 'Property Owner'}
Purchase Price: $${offer.amount.toLocaleString()}
Earnest Money: $${offer.earnest_money.toLocaleString()}
Inspection Period: ${offer.inspection_period_days} days
Closing: ${offer.closing_days} days from acceptance
Financing: Cash, no contingency
Additional Terms: ${offer.contingencies?.join('; ') || 'None'}

Buyer: ${buyerInfo.name}, ${buyerInfo.company || ''}, ${buyerInfo.email || ''}, ${buyerInfo.phone || ''}
Today's Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Return only valid JSON with { letter: string }.`,
    'generateOfferLetter'
  );

  return result.letter;
}

// ============ CONFIGURATION ============

export interface AIConfiguration {
  apiKey: string;
  model: string;
  isConnected: boolean;
}

export async function testAIConnection(_apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    await callAI<{ status: string }>(
      "You are a helpful assistant. Return ONLY valid JSON: { status: \"ok\" }",
      "Return { status: \"ok\" } as valid JSON.",
      'testConnection'
    );
    return { success: true, message: "AI connection successful!" };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Connection failed"
    };
  }
}

export const AI_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast and efficient' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Most capable' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Quick responses' },
] as const;
