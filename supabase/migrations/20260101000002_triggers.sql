-- ═══════════════════════════════════════════════════════════════════════════════
-- DATABASE TRIGGERS & FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTO-UPDATE TIMESTAMPS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_worker_updated
  BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTO-UPDATE WORKER STATS ON HIRE CHANGES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_worker_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats for the affected worker
  UPDATE worker_profiles SET
    total_hires   = (SELECT COUNT(*) FROM hire_records WHERE worker_id = COALESCE(NEW.worker_id, OLD.worker_id) AND status = 'completed'),
    pending_hires = (SELECT COUNT(*) FROM hire_records WHERE worker_id = COALESCE(NEW.worker_id, OLD.worker_id) AND status = 'pending'),
    avg_rating    = (SELECT COALESCE(AVG(rating), 0) FROM hire_records WHERE worker_id = COALESCE(NEW.worker_id, OLD.worker_id) AND rating IS NOT NULL),
    total_reviews = (SELECT COUNT(*) FROM hire_records WHERE worker_id = COALESCE(NEW.worker_id, OLD.worker_id) AND rating IS NOT NULL)
  WHERE id = COALESCE(NEW.worker_id, OLD.worker_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hire_stats_insert
  AFTER INSERT ON hire_records
  FOR EACH ROW EXECUTE FUNCTION update_worker_stats();

CREATE TRIGGER trg_hire_stats_update
  AFTER UPDATE ON hire_records
  FOR EACH ROW EXECUTE FUNCTION update_worker_stats();

CREATE TRIGGER trg_hire_stats_delete
  AFTER DELETE ON hire_records
  FOR EACH ROW EXECUTE FUNCTION update_worker_stats();

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUTO-CREATE USER PROFILE ON AUTH SIGNUP
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, phone, role)
  VALUES (
    NEW.id,
    NEW.phone,
    'hirer'  -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUDIT LOG FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id::TEXT, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id::TEXT, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to critical tables
CREATE TRIGGER trg_audit_hire_records
  AFTER INSERT OR UPDATE OR DELETE ON hire_records
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER trg_audit_worker_profiles
  AFTER INSERT OR UPDATE OR DELETE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
