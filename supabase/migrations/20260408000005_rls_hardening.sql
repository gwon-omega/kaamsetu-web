-- RLS hardening migration (additive, low-risk)
-- Goals:
-- 1) Ensure intended RLS policies on geodata tables are actually effective.
-- 2) Protect audit_log behind service role only.
-- 3) Prevent ownership-changing updates by adding WITH CHECK on key update policies.

-- Enable RLS on static geodata tables so existing public-read policies apply.
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit_log and lock it to service role.
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'audit_log' AND policyname = 'audit_service_all'
  ) THEN
    CREATE POLICY "audit_service_all" ON audit_log
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Tighten update policies so users cannot reassign ownership columns during UPDATE.
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "workers_update_own" ON worker_profiles;
CREATE POLICY "workers_update_own" ON worker_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "hires_worker_update" ON hire_records;
CREATE POLICY "hires_worker_update" ON hire_records
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM worker_profiles WHERE id = worker_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM worker_profiles WHERE id = worker_id)
  );

DROP POLICY IF EXISTS "hires_hirer_update" ON hire_records;
CREATE POLICY "hires_hirer_update" ON hire_records
  FOR UPDATE USING (auth.uid() = hirer_id)
  WITH CHECK (auth.uid() = hirer_id);
