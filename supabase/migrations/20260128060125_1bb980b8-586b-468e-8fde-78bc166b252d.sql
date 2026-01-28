-- Create dispo_campaigns table for email campaigns
CREATE TABLE public.dispo_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  deal_id UUID REFERENCES public.dispo_deals(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  body_html TEXT NOT NULL DEFAULT '',
  body_json JSONB,
  template_type TEXT DEFAULT 'deal_announcement',
  status TEXT NOT NULL DEFAULT 'draft',
  recipient_filter JSONB,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispo_campaign_recipients table
CREATE TABLE public.dispo_campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.dispo_campaigns(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.cash_buyers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dispo_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispo_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- RLS policies for dispo_campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.dispo_campaigns FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.dispo_campaigns FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.dispo_campaigns FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.dispo_campaigns FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for dispo_campaign_recipients
CREATE POLICY "Users can view recipients of their campaigns"
ON public.dispo_campaign_recipients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dispo_campaigns 
    WHERE id = campaign_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert recipients to their campaigns"
ON public.dispo_campaign_recipients FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dispo_campaigns 
    WHERE id = campaign_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update recipients of their campaigns"
ON public.dispo_campaign_recipients FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.dispo_campaigns 
    WHERE id = campaign_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete recipients of their campaigns"
ON public.dispo_campaign_recipients FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.dispo_campaigns 
    WHERE id = campaign_id AND user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_dispo_campaigns_user_id ON public.dispo_campaigns(user_id);
CREATE INDEX idx_dispo_campaigns_deal_id ON public.dispo_campaigns(deal_id);
CREATE INDEX idx_dispo_campaigns_status ON public.dispo_campaigns(status);
CREATE INDEX idx_dispo_campaign_recipients_campaign_id ON public.dispo_campaign_recipients(campaign_id);
CREATE INDEX idx_dispo_campaign_recipients_buyer_id ON public.dispo_campaign_recipients(buyer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_dispo_campaigns_updated_at
BEFORE UPDATE ON public.dispo_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();