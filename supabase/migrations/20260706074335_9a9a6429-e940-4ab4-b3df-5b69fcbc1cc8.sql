
DROP POLICY IF EXISTS "Allow session operations" ON public.buyer_portal_sessions;

DROP POLICY IF EXISTS "Users can view all feedback" ON public.feedback;
CREATE POLICY "Authenticated users can view feedback" ON public.feedback
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view all comments" ON public.feedback_comments;
CREATE POLICY "Authenticated users can view feedback comments" ON public.feedback_comments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view all votes" ON public.feedback_votes;
CREATE POLICY "Authenticated users can view feedback votes" ON public.feedback_votes
  FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.aiva_chat_rate_limits (
  user_id uuid NOT NULL,
  window_start timestamptz NOT NULL DEFAULT date_trunc('hour', now()),
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, window_start)
);
GRANT ALL ON public.aiva_chat_rate_limits TO service_role;
ALTER TABLE public.aiva_chat_rate_limits ENABLE ROW LEVEL SECURITY;
