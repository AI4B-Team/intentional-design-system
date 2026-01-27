-- Mail Templates table
CREATE TABLE public.mail_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'postcard_6x9', -- postcard_4x6, postcard_6x9, postcard_6x11, letter, yellow_letter
  description TEXT,
  front_html TEXT,
  back_html TEXT,
  thumbnail_url TEXT,
  merge_fields TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mail Lists table (for uploaded lists)
CREATE TABLE public.mail_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_name TEXT,
  total_records INTEGER DEFAULT 0,
  valid_records INTEGER DEFAULT 0,
  invalid_records INTEGER DEFAULT 0,
  duplicate_records INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing', -- processing, ready, error
  column_mapping JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mail List Records table
CREATE TABLE public.mail_list_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.mail_lists(id) ON DELETE CASCADE,
  owner_name TEXT,
  property_address TEXT,
  property_city TEXT,
  property_state TEXT,
  property_zip TEXT,
  mailing_address TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,
  is_valid BOOLEAN DEFAULT true,
  validation_error TEXT,
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mail Campaigns table
CREATE TABLE public.mail_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, paused, completed, cancelled
  template_id UUID REFERENCES public.mail_templates(id),
  list_type TEXT, -- property_list, uploaded_list, filtered_list
  list_filters JSONB DEFAULT '{}',
  uploaded_list_id UUID REFERENCES public.mail_lists(id),
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_returned INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  total_cost DECIMAL DEFAULT 0,
  cost_per_piece DECIMAL,
  scheduled_date DATE,
  send_time TIME,
  is_drip BOOLEAN DEFAULT false,
  drip_settings JSONB DEFAULT '{}',
  tracking_phone TEXT,
  tracking_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mail Pieces table (individual mail pieces)
CREATE TABLE public.mail_pieces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.mail_campaigns(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id),
  list_record_id UUID REFERENCES public.mail_list_records(id),
  recipient_name TEXT,
  recipient_address TEXT,
  recipient_city TEXT,
  recipient_state TEXT,
  recipient_zip TEXT,
  lob_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, queued, mailed, in_transit, delivered, returned, failed
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  return_reason TEXT,
  cost DECIMAL,
  response_received BOOLEAN DEFAULT false,
  response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mail Suppression List table
CREATE TABLE public.mail_suppression_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  reason TEXT, -- do_not_mail, deceased, returned, undeliverable, opted_out, already_contacted
  source TEXT, -- manual, campaign_return, user_request
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lob Connections table (stores API keys and settings)
CREATE TABLE public.lob_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  api_key_encrypted TEXT,
  is_active BOOLEAN DEFAULT false,
  account_name TEXT,
  return_name TEXT,
  return_address_line1 TEXT,
  return_address_line2 TEXT,
  return_city TEXT,
  return_state TEXT,
  return_zip TEXT,
  default_mail_class TEXT DEFAULT 'usps_first_class',
  default_postcard_size TEXT DEFAULT '6x9',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.mail_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_list_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mail_suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lob_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mail_templates
CREATE POLICY "Users can view their own mail templates" ON public.mail_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mail templates" ON public.mail_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mail templates" ON public.mail_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mail templates" ON public.mail_templates FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mail_lists
CREATE POLICY "Users can view their own mail lists" ON public.mail_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mail lists" ON public.mail_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mail lists" ON public.mail_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mail lists" ON public.mail_lists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mail_list_records (through list ownership)
CREATE POLICY "Users can view records of their own lists" ON public.mail_list_records FOR SELECT 
  USING (list_id IN (SELECT id FROM public.mail_lists WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert records to their own lists" ON public.mail_list_records FOR INSERT 
  WITH CHECK (list_id IN (SELECT id FROM public.mail_lists WHERE user_id = auth.uid()));
CREATE POLICY "Users can update records of their own lists" ON public.mail_list_records FOR UPDATE 
  USING (list_id IN (SELECT id FROM public.mail_lists WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete records of their own lists" ON public.mail_list_records FOR DELETE 
  USING (list_id IN (SELECT id FROM public.mail_lists WHERE user_id = auth.uid()));

-- RLS Policies for mail_campaigns
CREATE POLICY "Users can view their own mail campaigns" ON public.mail_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mail campaigns" ON public.mail_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mail campaigns" ON public.mail_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mail campaigns" ON public.mail_campaigns FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mail_pieces (through campaign ownership)
CREATE POLICY "Users can view mail pieces of their campaigns" ON public.mail_pieces FOR SELECT 
  USING (campaign_id IN (SELECT id FROM public.mail_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert mail pieces to their campaigns" ON public.mail_pieces FOR INSERT 
  WITH CHECK (campaign_id IN (SELECT id FROM public.mail_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Users can update mail pieces of their campaigns" ON public.mail_pieces FOR UPDATE 
  USING (campaign_id IN (SELECT id FROM public.mail_campaigns WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete mail pieces of their campaigns" ON public.mail_pieces FOR DELETE 
  USING (campaign_id IN (SELECT id FROM public.mail_campaigns WHERE user_id = auth.uid()));

-- RLS Policies for mail_suppression_list
CREATE POLICY "Users can view their suppression list" ON public.mail_suppression_list FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to their suppression list" ON public.mail_suppression_list FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their suppression list" ON public.mail_suppression_list FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from their suppression list" ON public.mail_suppression_list FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for lob_connections
CREATE POLICY "Users can view their own lob connection" ON public.lob_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lob connection" ON public.lob_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lob connection" ON public.lob_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lob connection" ON public.lob_connections FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_mail_templates_user_id ON public.mail_templates(user_id);
CREATE INDEX idx_mail_lists_user_id ON public.mail_lists(user_id);
CREATE INDEX idx_mail_list_records_list_id ON public.mail_list_records(list_id);
CREATE INDEX idx_mail_campaigns_user_id ON public.mail_campaigns(user_id);
CREATE INDEX idx_mail_campaigns_status ON public.mail_campaigns(status);
CREATE INDEX idx_mail_pieces_campaign_id ON public.mail_pieces(campaign_id);
CREATE INDEX idx_mail_pieces_status ON public.mail_pieces(status);
CREATE INDEX idx_mail_pieces_lob_id ON public.mail_pieces(lob_id);
CREATE INDEX idx_mail_suppression_list_user_id ON public.mail_suppression_list(user_id);
CREATE INDEX idx_mail_suppression_list_address ON public.mail_suppression_list(address);

-- Create trigger for updating timestamps
CREATE TRIGGER update_mail_templates_updated_at BEFORE UPDATE ON public.mail_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mail_campaigns_updated_at BEFORE UPDATE ON public.mail_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lob_connections_updated_at BEFORE UPDATE ON public.lob_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();