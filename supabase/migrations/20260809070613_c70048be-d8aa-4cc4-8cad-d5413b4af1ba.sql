INSERT INTO public.app_family_apps (slug, name, description, base_url, enabled)
VALUES
  ('leadtrace', 'LeadTrace', 'Lead sourcing, list building, and DNC/litigator scrubbing.', 'https://leadtrace.lovable.app', true),
  ('master-closer', 'Master Closer', 'Closing scripts, objection handling, and negotiation coaching.', 'https://master-closer.lovable.app', true)
ON CONFLICT (slug) DO NOTHING;

CREATE POLICY "Org admins can add family apps" ON public.app_family_apps
FOR INSERT TO authenticated WITH CHECK (public.user_has_role('admin'));

CREATE POLICY "Org admins can update family apps" ON public.app_family_apps
FOR UPDATE TO authenticated USING (public.user_has_role('admin')) WITH CHECK (public.user_has_role('admin'));

CREATE POLICY "Org admins can delete family apps" ON public.app_family_apps
FOR DELETE TO authenticated USING (public.user_has_role('admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_family_apps TO authenticated;
GRANT ALL ON public.app_family_apps TO service_role;