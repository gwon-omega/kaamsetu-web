-- Allow public worker listings to include worker name/avatar via embedded users relation.
-- This keeps `public.users` restricted except for active worker rows.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'users_public_worker_read'
  ) THEN
    CREATE POLICY "users_public_worker_read" ON public.users
      FOR SELECT USING (role = 'worker' AND is_active = TRUE);
  END IF;
END $$;
