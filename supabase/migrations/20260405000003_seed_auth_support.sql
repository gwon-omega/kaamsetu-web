-- ═══════════════════════════════════════════════════════════════════════════════
-- SHRAM SEWA — Seed/Auth Support Migration
-- Adds pgcrypto so seed scripts can use crypt() and gen_random_uuid() reliably.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;
