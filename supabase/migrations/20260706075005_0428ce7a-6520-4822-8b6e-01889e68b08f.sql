
CREATE TABLE IF NOT EXISTS public.public_ip_rate_limits (
  ip text NOT NULL,
  endpoint text NOT NULL,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, endpoint, window_start)
);
GRANT ALL ON public.public_ip_rate_limits TO service_role;
ALTER TABLE public.public_ip_rate_limits ENABLE ROW LEVEL SECURITY;
-- Service-role only; no policies.

CREATE INDEX IF NOT EXISTS idx_public_ip_rate_limits_window
  ON public.public_ip_rate_limits (window_start);

-- Support the phone-cooldown lookup used by submit-seller-lead
CREATE INDEX IF NOT EXISTS idx_scheduled_ai_calls_phone_org_recent
  ON public.scheduled_ai_calls (organization_id, phone_number, created_at DESC);
