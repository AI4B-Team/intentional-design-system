-- Add missing columns to dispo_settings for complete settings support
ALTER TABLE public.dispo_settings
ADD COLUMN IF NOT EXISTS default_visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS buyer_slug TEXT,
ADD COLUMN IF NOT EXISTS require_email_verification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS require_proof_of_funds BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_approve_buyers BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS registration_fields TEXT[],
ADD COLUMN IF NOT EXISTS email_from_name TEXT,
ADD COLUMN IF NOT EXISTS email_reply_to TEXT,
ADD COLUMN IF NOT EXISTS email_signature TEXT,
ADD COLUMN IF NOT EXISTS email_footer_text TEXT,
ADD COLUMN IF NOT EXISTS email_unsubscribe_text TEXT,
ADD COLUMN IF NOT EXISTS notify_new_buyer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_deal_view BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_interest BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_offer BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_email TEXT,
ADD COLUMN IF NOT EXISTS notification_phone TEXT;

-- Create unique index on buyer_slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_dispo_settings_buyer_slug ON public.dispo_settings(buyer_slug) WHERE buyer_slug IS NOT NULL;