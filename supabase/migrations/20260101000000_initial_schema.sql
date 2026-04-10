-- ═══════════════════════════════════════════════════════════════════════════════
-- SHRAM SEWA — Initial Database Schema Migration
-- Based on AGENTS.md Section 6
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- GEODATA TABLES (Static, seeded once)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE provinces (
  id          SMALLINT PRIMARY KEY,
  name_en     TEXT NOT NULL,
  name_np     TEXT NOT NULL,
  color_hex   CHAR(7),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE districts (
  id          SMALLINT PRIMARY KEY,
  province_id SMALLINT NOT NULL REFERENCES provinces(id),
  name_en     TEXT NOT NULL,
  name_np     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE local_units (
  id          SERIAL PRIMARY KEY,
  district_id SMALLINT NOT NULL REFERENCES districts(id),
  name_en     TEXT NOT NULL,
  name_np     TEXT,
  unit_type   TEXT CHECK (unit_type IN (
                'metropolitan', 'sub_metropolitan',
                'municipality', 'rural_municipality'
              )) NOT NULL,
  ward_count  SMALLINT DEFAULT 9,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_local_units_district ON local_units(district_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- JOB CATEGORIES (Static, seeded)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE job_categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name_en     TEXT NOT NULL,
  name_np     TEXT NOT NULL,
  icon        TEXT,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- USERS (Supabase Auth integration)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         TEXT UNIQUE,
  full_name     TEXT,
  full_name_np  TEXT,
  role          TEXT CHECK (role IN ('worker', 'hirer', 'admin')) NOT NULL DEFAULT 'hirer',
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- WORKER PROFILES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE worker_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_category_id INT NOT NULL REFERENCES job_categories(id),
  province_id     SMALLINT NOT NULL REFERENCES provinces(id),
  district_id     SMALLINT NOT NULL REFERENCES districts(id),
  local_unit_id   INT NOT NULL REFERENCES local_units(id),
  ward_no         SMALLINT NOT NULL CHECK (ward_no BETWEEN 1 AND 35),

  is_available    BOOLEAN DEFAULT TRUE,
  is_approved     BOOLEAN DEFAULT FALSE,
  approval_note   TEXT,

  experience_yrs  SMALLINT DEFAULT 0,
  about           TEXT,
  daily_rate_npr  INTEGER,
  citizenship_no  TEXT,

  total_hires     INT DEFAULT 0,
  pending_hires   INT DEFAULT 0,
  avg_rating      DECIMAL(2,1) DEFAULT 0.0,
  total_reviews   INT DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_worker_province   ON worker_profiles(province_id);
CREATE INDEX idx_worker_district   ON worker_profiles(district_id);
CREATE INDEX idx_worker_local_unit ON worker_profiles(local_unit_id);
CREATE INDEX idx_worker_job        ON worker_profiles(job_category_id);
CREATE INDEX idx_worker_available  ON worker_profiles(is_available) WHERE is_available = TRUE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- HIRE RECORDS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE hire_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       UUID NOT NULL REFERENCES worker_profiles(id),
  hirer_id        UUID NOT NULL REFERENCES public.users(id),

  hirer_ip        INET NOT NULL,
  ip_fingerprint  TEXT,

  status          TEXT CHECK (status IN (
                    'pending', 'accepted', 'rejected',
                    'completed', 'cancelled'
                  )) DEFAULT 'pending',

  hire_province_id  SMALLINT REFERENCES provinces(id),
  hire_district_id  SMALLINT REFERENCES districts(id),
  hire_local_unit_id INT REFERENCES local_units(id),

  work_description  TEXT,
  agreed_rate_npr   INTEGER,
  work_date         DATE,
  work_duration_days SMALLINT DEFAULT 1,

  hired_at        TIMESTAMPTZ DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,

  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT,
  reviewed_at     TIMESTAMPTZ
);

-- UNIQUE constraint: one IP per worker (the core IP-hire rule)
CREATE UNIQUE INDEX idx_hire_ip_worker
  ON hire_records(worker_id, hirer_ip)
  WHERE status != 'cancelled';

CREATE INDEX idx_hire_worker   ON hire_records(worker_id);
CREATE INDEX idx_hire_hirer    ON hire_records(hirer_id);
CREATE INDEX idx_hire_status   ON hire_records(status);
CREATE INDEX idx_hire_date     ON hire_records(hired_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hire_id       UUID REFERENCES hire_records(id),
  type          TEXT CHECK (type IN (
                  'hire_request', 'hire_accepted', 'hire_rejected',
                  'hire_completed', 'new_review', 'system'
                )) NOT NULL,
  title         TEXT NOT NULL,
  title_np      TEXT,
  body          TEXT NOT NULL,
  body_np       TEXT,
  is_read       BOOLEAN DEFAULT FALSE,
  push_sent     BOOLEAN DEFAULT FALSE,
  push_token    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user    ON notifications(user_id, is_read);
CREATE INDEX idx_notif_created ON notifications(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PUSH TOKENS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE push_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT CHECK (platform IN ('android', 'ios', 'web')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- AUDIT LOG
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES public.users(id),
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   TEXT,
  old_values  JSONB,
  new_values  JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
