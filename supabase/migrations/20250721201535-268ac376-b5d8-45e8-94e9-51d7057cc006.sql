-- Enable pg_cron and pg_net extensions for automated scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the auto-scheduler to run every minute
SELECT cron.schedule(
  'auto-scheduler-job',
  '* * * * *', -- Run every minute
  $$
  SELECT net.http_post(
    url := 'https://vwylsusacaucxyphbxad.supabase.co/functions/v1/auto-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3eWxzdXNhY2F1Y3h5cGhieGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTg1MjEsImV4cCI6MjA2ODY5NDUyMX0.g8WA6KE07scLfDTHiGyYAgS2PL-36FSztg2dJsE4rPI"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) as request_id;
  $$
);