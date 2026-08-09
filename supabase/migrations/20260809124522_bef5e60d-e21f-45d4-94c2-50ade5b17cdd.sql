select cron.schedule(
  'hub-integration-monitor-nightly',
  '7 5 * * *',
  $$
  select net.http_post(
    url:='https://iaenzywwyiaccnnpdqzt.supabase.co/functions/v1/hub-integration-monitor',
    headers:='{"Content-Type": "application/json", "x-hub-cron-secret": "9f2c7a41d6b83e05c1af74be92d5307fb8ce16a4d97025e3f6c8b1a4d0e72359"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);