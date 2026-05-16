
CREATE TABLE public.trial_reminders_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day integer NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);

ALTER TABLE public.trial_reminders_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view trial reminders"
ON public.trial_reminders_sent
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Schedule daily cron at 14:00 UTC to invoke the trial-reminder-cron edge function
SELECT cron.schedule(
  'trial-reminder-daily',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url := 'https://dbgckuwuskfvzmspzjex.supabase.co/functions/v1/trial-reminder-cron',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
