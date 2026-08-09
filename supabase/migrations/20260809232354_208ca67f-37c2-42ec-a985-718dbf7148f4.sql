CREATE OR REPLACE FUNCTION public.get_expiring_pofs(days_ahead integer DEFAULT 5)
 RETURNS TABLE(id uuid, user_id uuid, organization_id uuid, file_name text, expiration_date date, amount numeric, lender_name text, days_until_expiry integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    pof.id,
    pof.user_id,
    pof.organization_id,
    pof.file_name,
    pof.expiration_date,
    pof.amount,
    pof.lender_name,
    (pof.expiration_date - CURRENT_DATE)::INTEGER as days_until_expiry
  FROM public.proof_of_funds pof
  WHERE (
      pof.organization_id = ANY (public.user_org_ids())
      OR (pof.organization_id IS NULL AND pof.user_id = auth.uid())
    )
    AND pof.is_active = true
    AND pof.expiration_date <= (CURRENT_DATE + days_ahead)
    AND pof.expiration_date >= CURRENT_DATE
  ORDER BY pof.expiration_date ASC;
$function$;