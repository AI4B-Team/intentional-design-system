export interface PipelineDeal {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  stage: string;
  asking_price: number;
  offer_amount: number | null;
  arv: number;
  equity_percentage: number;
  lead_score: number;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  contact_type: string;
  source: string;
  days_in_stage: number;
  created_at: string;
  last_activity: string;
  notes: string | null;
  property_type: string;
  beds: number;
  baths: number;
  sqft: number;
}

export interface PipelineStageConfig {
  id: string;
  label: string;
  color: string;
  description: string;
  targetDays: number;
}
