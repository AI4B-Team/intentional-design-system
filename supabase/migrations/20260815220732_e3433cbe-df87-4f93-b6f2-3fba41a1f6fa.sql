DELETE FROM public.leads_scores s
USING (
  SELECT id,
         row_number() OVER (
           PARTITION BY lead_property_id
           ORDER BY computed_at DESC, created_at DESC, id DESC
         ) AS rn
  FROM public.leads_scores
) ranked
WHERE ranked.id = s.id AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS leads_scores_lead_property_id_key
  ON public.leads_scores (lead_property_id);