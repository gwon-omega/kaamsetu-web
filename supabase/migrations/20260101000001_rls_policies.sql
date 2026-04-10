-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) Policies
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE hire_records        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens         ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════════
-- USERS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Users can read their own profile
CREATE POLICY "users_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Service role can do anything (for admin operations)
CREATE POLICY "users_service_all" ON public.users
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- WORKER PROFILES POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Anyone can view approved, available workers
CREATE POLICY "workers_public_read" ON worker_profiles
  FOR SELECT USING (is_approved = TRUE);

-- Workers can read their own profile (even if not approved)
CREATE POLICY "workers_read_own" ON worker_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Workers can update their own profile
CREATE POLICY "workers_update_own" ON worker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Workers can insert their own profile
CREATE POLICY "workers_insert_own" ON worker_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role for admin operations
CREATE POLICY "workers_service_all" ON worker_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- HIRE RECORDS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Hirers can read their own hire records
CREATE POLICY "hires_hirer_read" ON hire_records
  FOR SELECT USING (auth.uid() = hirer_id);

-- Workers can read hire records for their profile
CREATE POLICY "hires_worker_read" ON hire_records
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM worker_profiles WHERE id = worker_id)
  );

-- Hirers can create hire requests
CREATE POLICY "hires_hirer_insert" ON hire_records
  FOR INSERT WITH CHECK (auth.uid() = hirer_id);

-- Workers can update status (accept/reject)
CREATE POLICY "hires_worker_update" ON hire_records
  FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM worker_profiles WHERE id = worker_id)
  );

-- Hirers can update (complete, cancel, review)
CREATE POLICY "hires_hirer_update" ON hire_records
  FOR UPDATE USING (auth.uid() = hirer_id);

-- Service role for admin operations
CREATE POLICY "hires_service_all" ON hire_records
  FOR ALL USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Users can read their own notifications
CREATE POLICY "notif_read_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "notif_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can insert notifications
CREATE POLICY "notif_service_insert" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- PUSH TOKENS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Users can manage their own push tokens
CREATE POLICY "push_own" ON push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Service role can read for sending notifications
CREATE POLICY "push_service_read" ON push_tokens
  FOR SELECT USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════════
-- GEODATA POLICIES (Public read)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Anyone can read geodata
CREATE POLICY "provinces_public_read" ON provinces
  FOR SELECT USING (true);

CREATE POLICY "districts_public_read" ON districts
  FOR SELECT USING (true);

CREATE POLICY "local_units_public_read" ON local_units
  FOR SELECT USING (true);

CREATE POLICY "job_categories_public_read" ON job_categories
  FOR SELECT USING (is_active = true);
