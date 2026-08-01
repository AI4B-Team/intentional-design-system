-- App Family hub integration (Real Elite = hub)

-- Registry of satellite apps in the family
CREATE TABLE IF NOT EXISTS public.app_family_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  base_url text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_family_apps TO authenticated;
GRANT ALL ON public.app_family_apps TO service_role;
ALTER TABLE public.app_family_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view family apps"
  ON public.app_family_apps FOR SELECT TO authenticated USING (true);

-- Per-org link state to a satellite app
CREATE TABLE IF NOT EXISTS public.org_app_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  app_slug text NOT NULL REFERENCES public.app_family_apps(slug) ON UPDATE CASCADE,
  remote_org_id uuid,
  linked_at timestamptz,
  last_event_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, app_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_app_links TO authenticated;
GRANT ALL ON public.org_app_links TO service_role;
ALTER TABLE public.org_app_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage their app links"
  ON public.org_app_links FOR ALL TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- Inbound events from satellite apps (shared event vocabulary)
CREATE TABLE IF NOT EXISTS public.app_family_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  app_slug text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  remote_event_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_family_events_org_created
  ON public.app_family_events (organization_id, created_at DESC);
GRANT SELECT ON public.app_family_events TO authenticated;
GRANT ALL ON public.app_family_events TO service_role;
ALTER TABLE public.app_family_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members view their family events"
  ON public.app_family_events FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

-- Outbound webhooks for org events
CREATE TABLE IF NOT EXISTS public.org_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  enabled boolean NOT NULL DEFAULT true,
  last_delivery_at timestamptz,
  last_delivery_status int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_webhooks TO authenticated;
GRANT ALL ON public.org_webhooks TO service_role;
ALTER TABLE public.org_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage their webhooks"
  ON public.org_webhooks FOR ALL TO authenticated
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

-- Seed the known family apps
INSERT INTO public.app_family_apps (slug, name, description, base_url)
VALUES
  ('leadtrace', 'LeadTrace', 'List scrubbing, DNC and litigator flagging, lead enrichment.', 'https://leadtrace.lovable.app'),
  ('master-closer', 'Master Closer', 'Closing scripts, objection handling, and deal coaching.', 'https://master-closer.lovable.app')
ON CONFLICT (slug) DO NOTHING;

CREATE TRIGGER trg_app_family_apps_updated_at BEFORE UPDATE ON public.app_family_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_org_app_links_updated_at BEFORE UPDATE ON public.org_app_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_org_webhooks_updated_at BEFORE UPDATE ON public.org_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();