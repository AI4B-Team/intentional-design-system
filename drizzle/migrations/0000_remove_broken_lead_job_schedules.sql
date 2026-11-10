DO $$
DECLARE j text;
BEGIN
  FOREACH j IN ARRAY ARRAY['leads-agent-detect-2h','leads-agent-detect-daily','leads-agent-validate-30m','leads-agent-grade-2h','leads-agent-oversight-15m','leads-auto-campaign-hourly'] LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = j) THEN
      PERFORM cron.unschedule(j);
    END IF;
  END LOOP;
END $$;