# श्रम सेवा — Full Stack Architecture Decision Document

**Nepal Local Government Manpower Platform**
Version 1.0 | Production-Grade

---

## 0. AGENT OPERATING PROTOCOL

Treat this file as the source of truth for all work in this workspace.

### Primary Rules

- Use an existing skill, prompt, or custom agent first whenever the task matches one. Do not invent a new workflow if a reusable one already exists.
- Prefer the smallest set of tools that can complete the task. Keep MCP and external tool usage minimal; use them only when they add clear value.
- Do not hallucinate APIs, libraries, policy details, or project requirements. If something is uncertain, verify it or ask a focused question.
- Keep reasoning grounded in the repository and in the user’s request. If the request is ambiguous, call out the ambiguity instead of guessing.
- For architecture, security, research, and cross-file reasoning, prefer the strongest available reasoning model or a read-only sub-agent for exploration. Use lighter-weight help for routine edits.

### Collaboration Protocol

- Use this AGENTS.md file to coordinate both main-agent work and sub-agent work.
- When a task benefits from parallel exploration, use a read-only sub-agent first, then consolidate results in the main thread.
- Keep sub-agent prompts narrow: what to inspect, what to return, and what to ignore.
- If tool usage risks exceeding the practical limit for a task, stop and simplify the approach before continuing.

### Documentation Standard

- This is a production project, so future documentation should be written with citation discipline.
- For explanatory docs, research notes, or formal deliverables, default to APA 7 style unless the user asks for a different format.
- Preserve sources, dates, and assumptions so future APA references can be generated without redoing the research.

### Response Structure

- When useful, organize work as: Task, Goals, Rules, Context, Output, Operations.
- Keep the structure concise and only include what helps execution.

### TGRCoo Kickoff (Project Start)

Task:

- Initialize a production-ready monorepo foundation for web, android, shared business logic, and design tokens.

Goals:

- Deliver a runnable web baseline quickly.
- Keep architecture compatible with low-end devices and offline-first behavior.
- Preserve a clean path to Supabase edge functions and future Kotlin migration.

Rules:

- Skill-first execution.
- Verify before claiming.
- Small, reversible changes.
- No hallucinated APIs or requirements.

Context:

- Rural Nepal constraints, government reliability requirements, and limited initial budget.

Output:

- Root workspace configs, app/package structure, baseline UI tokens, and startup scripts.

Operations:

- Prefer local repository evidence first.
- Use focused sub-agents for read-only exploration when complexity increases.
- Keep external tool calls minimal and justified.

---

## 1. PROJECT CONTEXT FIRST

Think deeply as your role as senior web developer, researcher, ui/ux designer, fullstack developer, claude/gemini/gpt skills expert, mcp expert with 30+ years of experience.

Before choosing tools, here's what constrains us:

| Factor                 | Reality                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| **Users**              | Rural Nepal — low-end Android phones (2-3GB RAM), 2G/3G connectivity |
| **Scale**              | 753 local units × ~50 workers each = ~37,650 initial records         |
| **Two surfaces**       | Mobile web (PWA) + Native Android (React Native)                     |
| **Government context** | Must be reliable, offline-capable, auditable                         |
| **Budget**             | Likely self-funded → serverless first makes sense                    |
| **Future**             | Kotlin conversion path must be clean                                 |

---

## 2. ARCHITECTURE DECISION: HYBRID SERVERLESS

### Verdict: Hybrid (Serverless-first + Optional Dedicated Server)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌─────────────────┐    ┌──────────────────────┐        │
│  │   React (Web)   │    │  React Native (Android)│       │
│  │   PWA + SW      │    │  Expo Managed Workflow │       │
│  └────────┬────────┘    └──────────┬───────────┘        │
└───────────┼──────────────────────┼──────────────────────┘
            │                      │
            ▼                      ▼
┌─────────────────────────────────────────────────────────┐
│                  API GATEWAY LAYER                       │
│            Supabase Edge Functions (Deno)                │
│         + Cloudflare Workers (CDN/cache)                 │
└────────────────────────┬────────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
┌──────────────────┐       ┌──────────────────────┐
│  Supabase        │       │  Redis (Upstash)      │
│  PostgreSQL      │       │  Session/Rate Limit   │
│  + Row Level     │       │  + Notification Queue │
│  Security        │       └──────────────────────┘
│  + Realtime      │
│  + Storage       │       ┌──────────────────────┐
└──────────────────┘       │  Expo Push Service   │
                           │  (FCM for Android)   │
                           └──────────────────────┘
```

### Why NOT fully serverless?

- Notification scheduling needs persistent worker (cron) → Supabase cron jobs cover this
- Complex geolocation queries need PostGIS → Supabase has it built in
- File uploads (worker photos) → Supabase Storage

### Why NOT dedicated server?

- Nepal context: self-hosted servers = power cuts, maintenance overhead
- Supabase free tier covers launch phase generously
- Scale up later with Supabase Pro ($25/mo) only when needed

---

## 3. MONOREPO STRUCTURE

```
shram-sewa/
├── apps/
│   ├── web/                    ← React 18 + Vite (PWA)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── lib/
│   │   ├── public/
│   │   │   └── manifest.json   ← PWA manifest
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── android/                ← React Native (Expo)
│       ├── src/
│       │   ├── components/     ← Shared where possible
│       │   ├── screens/
│       │   ├── navigation/
│       │   ├── hooks/
│       │   └── store/
│       ├── app.json
│       └── package.json
│
├── packages/
│   ├── shared/                 ← Shared business logic
│   │   ├── api/                ← API client (same for both)
│   │   ├── types/              ← TypeScript types/interfaces
│   │   ├── validation/         ← Zod schemas
│   │   ├── constants/          ← Nepal geodata, job types
│   │   └── utils/
│   │
│   └── ui-tokens/              ← Design tokens (colors, spacing)
│       ├── colors.ts
│       ├── typography.ts
│       └── spacing.ts
│
├── supabase/
│   ├── migrations/             ← SQL migrations
│   ├── functions/              ← Edge Functions (Deno)
│   │   ├── hire-worker/
│   │   ├── send-notification/
│   │   ├── verify-otp/
│   │   └── search-workers/
│   └── seed.sql
│
├── turbo.json                  ← Turborepo config
├── package.json
└── pnpm-workspace.yaml
```

### Monorepo Tool: Turborepo + pnpm workspaces

- Turborepo caches builds → fast CI
- pnpm workspaces → shared packages without duplication
- Single `pnpm dev` boots everything

---

## 4. FRONTEND STACK

### Web: React 18 + Vite + TypeScript

```
React 18              → Concurrent features, Suspense
Vite 5                → Sub-second HMR, ES modules
TypeScript 5          → Type safety across monorepo
React Router v6       → File-based routing (or TanStack Router)
TanStack Query v5     → Server state, caching, background sync
Zustand               → Client state (auth, filters, cart)
React Hook Form       → Forms with Zod validation
Zod                   → Schema validation (shared with backend)
```

**Why Vite over Next.js?**

- This is a PWA, not an SSR/SEO site
- Workers are found by hirers directly, not via Google search
- Vite PWA plugin gives perfect offline support
- Simpler deployment to Cloudflare Pages (free, global CDN)

**Why NOT Next.js?**

- Server components add complexity without benefit here
- Nepal users need offline-first, not SSR

### Android: React Native + Expo (Managed Workflow)

```
Expo SDK 51           → Managed workflow, OTA updates
Expo Router v3        → File-based navigation (same mental model as web)
React Native Paper    → Material Design 3 components
React Native MMKV     → Ultra-fast local storage (C++ bindings)
React Native Reanimated 3 → 60fps animations on JS thread
React Native Gesture Handler → Swipe, long-press, pan gestures
Expo Notifications    → FCM push notifications
Expo SecureStore      → Secure token storage (Keychain/Keystore)
WatermelonDB          → Offline-first local database (SQLite)
```

**Why Expo over bare React Native?**

- OTA updates without Play Store review → critical for bug fixes
- Expo EAS Build → cloud builds, no local Android SDK needed
- Expo Go for testing on real devices instantly

**Why NOT Flutter?**

- You already know React ecosystem
- Shared `packages/shared` types/API work across both apps
- Code sharing percentage: ~40-60% (hooks, API calls, validation, constants)

---

Does nepal have this for this specific category?
AMExamined search results to assess Nepal's category availabilityExamined search results to assess Nepal's category availabilityThe research gives a very clear picture.
Here's the honest answer:

No. Nepal does NOT have this system for this specific category.
Here's exactly what exists vs. what you're building:

What exists in Nepal:
PlatformScopeProblemHomework Nepal, Sajilo Services, Technical SewaPlumbers, electricians — Kathmandu Valley onlyUrban only, no rural coverageService Nepal AppHandyman bookingKathmandu-centric startupDharaBijuliElectrical + plumbingLimited to a few metro areasDOFE PortalForeign employment manpowerFor sending workers abroad, not local hireJobsNepal.comWhite-collar jobsOffice/corporate jobs, not physical laborMyFutureNepalGeneral employmentNot ward/municipality targeted

What does NOT exist:

❌ No platform covering all 77 districts and 753 local units
❌ No system for gardeners, soil ploughers, agricultural hand laborers
❌ No ward-level targeting for rural municipalities
❌ No local government-integrated worker registry
❌ No IP-based one-hire-per-location system
❌ No Nepali government digital tool for domestic physical labor matching at municipal level

The gap is enormous. Existing services are:

Private startups serving only Kathmandu, Lalitpur, Bhaktapur
Focused on urban home services, not agricultural/rural labor
No government linkage

Your app fills a completely unoccupied niche — specifically the intersection of:

Local government × rural physical labor × all-77-district coverage × ward-level targeting

This is a first-of-its-kind in Nepal for this category. The closest global equivalent would be India's MGNREGS digital portal, but even that is a wage payment system, not a hiring marketplace.

## 5. COMPONENT LIBRARY

### Web: shadcn/ui + Tailwind CSS v4

```bash
# shadcn/ui is NOT a library — it's copy-paste components
# You own the code, customize freely
npx shadcn-ui@latest init
```

**Why shadcn/ui:**

- Copy into your codebase → full control
- Built on Radix UI primitives (accessible, unstyled)
- Tailwind-based → consistent with design tokens
- No bundle bloat from unused components
- Works perfectly with Tailwind v4

**Why NOT Chakra UI / MUI / Ant Design:**

- Too opinionated, hard to customize for Nepali brand identity
- Heavy bundle sizes hurt Nepal's 2G/3G users
- MUI's Material Design clashes with your Himalayan identity

### Android: React Native Paper v5 (Material Design 3)

```
React Native Paper → MD3 components, theming support
Custom theme tokens → Match web design system exactly
```

### Tailwind CSS v4 Configuration

```typescript
// apps/web/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // BRAND PALETTE (see section 7)
        crimson: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          500: "#A02535",
          700: "#7C1D2B",
          900: "#4A0F17",
        },
        gold: {
          300: "#E8B830",
          500: "#C9971C",
          700: "#A07A12",
        },
        mountain: {
          50: "#F0F4F8",
          500: "#1C3557",
          900: "#0D1E35",
        },
        terrain: {
          50: "#FAF7F0",
          100: "#F0EBE1",
          200: "#E4DDD0",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["DM Sans", "sans-serif"],
        devanagari: ["Noto Sans Devanagari", "sans-serif"],
      },
    },
  },
};
```

---

## 6. DATABASE SCHEMA (PostgreSQL via Supabase)

### Entity Relationship Overview

```
provinces (7)
    └── districts (77)
            └── local_units (753)
                    └── workers (many)
                            └── hire_records (many)
                                    └── notifications (many)

users (hirers + workers)
    ├── worker_profiles (1:1)
    └── hire_records (1:many as hirer)
```

### Full Schema

```sql
-- ─────────────────────────────────────────
-- GEODATA (static, seeded once)
-- ─────────────────────────────────────────

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

-- ─────────────────────────────────────────
-- JOB CATEGORIES (static, seeded)
-- ─────────────────────────────────────────

CREATE TABLE job_categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,       -- 'gardener', 'mason'
  name_en     TEXT NOT NULL,
  name_np     TEXT NOT NULL,
  icon        TEXT,                       -- emoji or icon name
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE
);

-- ─────────────────────────────────────────
-- USERS (Supabase Auth integration)
-- ─────────────────────────────────────────

CREATE TABLE public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone         TEXT UNIQUE,              -- Nepal: 98XXXXXXXX
  full_name     TEXT,
  full_name_np  TEXT,
  role          TEXT CHECK (role IN ('worker', 'hirer', 'admin')) NOT NULL DEFAULT 'hirer',
  is_verified   BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- WORKER PROFILES
-- ─────────────────────────────────────────

CREATE TABLE worker_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_category_id INT NOT NULL REFERENCES job_categories(id),
  province_id     SMALLINT NOT NULL REFERENCES provinces(id),
  district_id     SMALLINT NOT NULL REFERENCES districts(id),
  local_unit_id   INT NOT NULL REFERENCES local_units(id),
  ward_no         SMALLINT NOT NULL CHECK (ward_no BETWEEN 1 AND 35),

  -- Status
  is_available    BOOLEAN DEFAULT TRUE,
  is_approved     BOOLEAN DEFAULT FALSE,  -- admin approval before going live
  approval_note   TEXT,

  -- Work details
  experience_yrs  SMALLINT DEFAULT 0,
  about           TEXT,
  daily_rate_npr  INTEGER,               -- daily wage in NPR
  citizenship_no  TEXT,                  -- for verification

  -- Stats (denormalized for performance)
  total_hires     INT DEFAULT 0,
  pending_hires   INT DEFAULT 0,
  avg_rating      DECIMAL(2,1) DEFAULT 0.0,
  total_reviews   INT DEFAULT 0,

  -- Metadata
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_worker_province   ON worker_profiles(province_id);
CREATE INDEX idx_worker_district   ON worker_profiles(district_id);
CREATE INDEX idx_worker_local_unit ON worker_profiles(local_unit_id);
CREATE INDEX idx_worker_job        ON worker_profiles(job_category_id);
CREATE INDEX idx_worker_available  ON worker_profiles(is_available) WHERE is_available = TRUE;

-- ─────────────────────────────────────────
-- HIRE RECORDS (core transaction)
-- ─────────────────────────────────────────

CREATE TABLE hire_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id       UUID NOT NULL REFERENCES worker_profiles(id),
  hirer_id        UUID NOT NULL REFERENCES public.users(id),

  -- IP-based one-hire enforcement
  hirer_ip        INET NOT NULL,
  ip_fingerprint  TEXT,                  -- additional browser fingerprint

  -- Status
  status          TEXT CHECK (status IN (
                    'pending', 'accepted', 'rejected',
                    'completed', 'cancelled'
                  )) DEFAULT 'pending',

  -- Location context at time of hire
  hire_province_id  SMALLINT REFERENCES provinces(id),
  hire_district_id  SMALLINT REFERENCES districts(id),
  hire_local_unit_id INT REFERENCES local_units(id),

  -- Work details
  work_description  TEXT,
  agreed_rate_npr   INTEGER,
  work_date         DATE,
  work_duration_days SMALLINT DEFAULT 1,

  -- Timeline
  hired_at        TIMESTAMPTZ DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,

  -- Review (post-completion)
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

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────

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

-- ─────────────────────────────────────────
-- PUSH TOKENS (Expo FCM)
-- ─────────────────────────────────────────

CREATE TABLE push_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  platform    TEXT CHECK (platform IN ('android', 'ios', 'web')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ─────────────────────────────────────────
-- ADMIN / AUDIT LOG
-- ─────────────────────────────────────────

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

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE hire_records        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens         ENABLE ROW LEVEL SECURITY;

-- Users: see own profile only
CREATE POLICY "users_own" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Workers: public can view approved workers
CREATE POLICY "workers_public_read" ON worker_profiles
  FOR SELECT USING (is_approved = TRUE AND is_active = TRUE);

-- Workers: own profile full access
CREATE POLICY "workers_own_write" ON worker_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Hire records: hirer or worker can see their own
CREATE POLICY "hire_own" ON hire_records
  FOR ALL USING (
    auth.uid() = hirer_id OR
    auth.uid() = (SELECT user_id FROM worker_profiles WHERE id = worker_id)
  );

-- Notifications: own only
CREATE POLICY "notif_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- TRIGGERS: auto-update timestamps + stats
-- ─────────────────────────────────────────

-- Auto updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_worker_updated
  BEFORE UPDATE ON worker_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-update worker hire stats on hire completion
CREATE OR REPLACE FUNCTION update_worker_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE worker_profiles SET
    total_hires   = (SELECT COUNT(*) FROM hire_records WHERE worker_id = NEW.worker_id AND status = 'completed'),
    pending_hires = (SELECT COUNT(*) FROM hire_records WHERE worker_id = NEW.worker_id AND status = 'pending'),
    avg_rating    = (SELECT COALESCE(AVG(rating), 0) FROM hire_records WHERE worker_id = NEW.worker_id AND rating IS NOT NULL),
    total_reviews = (SELECT COUNT(*) FROM hire_records WHERE worker_id = NEW.worker_id AND rating IS NOT NULL)
  WHERE id = NEW.worker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hire_stats
  AFTER INSERT OR UPDATE ON hire_records
  FOR EACH ROW EXECUTE FUNCTION update_worker_stats();
```

---

## 7. SECURITY — JOSE / JWT ARCHITECTURE

### Token Strategy

```
Supabase Auth (built on GoTrue) handles:
  - Phone OTP login (Nepal mobile number)
  - JWT access tokens (RS256 signed) — 1 hour expiry
  - Refresh tokens — 7 days, stored in HttpOnly cookies (web)
                   — Expo SecureStore (Android)

JOSE library usage:
  - Edge Functions verify JWT using jose.jwtVerify()
  - Custom claims: { role, province_id, district_id }
  - IP binding in token claims for hire validation
```

### Edge Function Auth Pattern

```typescript
// supabase/functions/_shared/auth.ts
import { jwtVerify, createRemoteJWKSet } from "https://esm.sh/jose@5";

const JWKS = createRemoteJWKSet(
  new URL(`${Deno.env.get("SUPABASE_URL")}/auth/v1/jwks`),
);

export async function verifyRequest(req: Request) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) throw new Error("No token");

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: Deno.env.get("SUPABASE_URL") + "/auth/v1",
    audience: "authenticated",
  });

  return payload; // { sub: userId, role, ... }
}
```

### Security Layers

```
Layer 1: Phone OTP      → No passwords, SMS-verified identity
Layer 2: JWT (JOSE)     → Short-lived, RS256 signed
Layer 3: RLS Policies   → Database-level, not just API-level
Layer 4: IP Enforcement → hire_records UNIQUE constraint (DB level)
Layer 5: Rate Limiting  → Upstash Redis (100 req/min per IP)
Layer 6: CORS           → Whitelist app domains only
Layer 7: Input sanitize → Zod validation on every edge function
```

---

## 8. UI/UX COLOR SYSTEM

### Why these colors for Nepal manpower?

Color psychology for rural Nepal context:

- **Crimson/Red** → matches Nepal flag, conveys authority, trust in government context
- **Gold/Amber** → prosperity, harvest, warmth — resonates with agricultural workers
- **Mountain Slate** → stability, reliability — the permanence of Himalayan geography
- **Earth tones** → ground-level, approachable for low-literacy users

### Complete Token System

```typescript
// packages/ui-tokens/colors.ts

export const colors = {
  // PRIMARY BRAND
  crimson: {
    50: "#FFF1F2", // hover backgrounds
    100: "#FFE4E6", // light badges
    200: "#FECDD3", // borders
    500: "#A02535", // buttons, links
    700: "#7C1D2B", // primary brand
    900: "#4A0F17", // dark headings
  },

  // ACCENT
  gold: {
    300: "#F0C84A", // highlights
    500: "#C9971C", // CTAs, icons
    700: "#A07A12", // dark gold
  },

  // NEUTRAL (Himalayan earth)
  mountain: {
    50: "#F0F4F8", // page bg alt
    200: "#C8D6E5", // borders
    500: "#1C3557", // dark text, nav
    700: "#142740", // darkest slate
    900: "#0A1520", // near-black
  },

  terrain: {
    50: "#FAF7F0", // page background ← warm off-white, not stark white
    100: "#F5EFE3", // card backgrounds
    200: "#E8DDD0", // input backgrounds
    300: "#D4C5B0", // borders
    400: "#B8A490", // placeholders
    500: "#8A7A65", // muted text
  },

  // SEMANTIC
  success: "#2D6A4F", // hired, completed
  warning: "#B45309", // pending
  error: "#991B1B", // rejected
  info: "#1D4ED8", // informational

  // NEPALI FLAG REFERENCE
  flag: {
    crimson: "#DC143C",
    blue: "#003893",
  },
};

// DARK MODE (for night use in rural areas — saves battery on AMOLED)
export const darkColors = {
  bg: "#0F0A06", // warm near-black
  surface: "#1A120C", // cards
  border: "#2E200E", // subtle borders
  textPrimary: "#F5EFE3",
  textMuted: "#8A7A65",
  crimson: "#C9414F", // slightly lighter for dark bg
  gold: "#E8B830",
};
```

### Typography Scale

```typescript
// packages/ui-tokens/typography.ts
export const typography = {
  fonts: {
    display: "Fraunces", // headlines — organic serif, authoritative
    body: "DM Sans", // UI text — modern, readable at small sizes
    devanagari: "Noto Sans Devanagari", // Nepali script
    mono: "JetBrains Mono", // codes, IDs
  },
  // Scale (mobile-first, rem)
  sizes: {
    xs: "0.75rem", // 12px — labels
    sm: "0.875rem", // 14px — body small
    base: "1rem", // 16px — body
    lg: "1.125rem", // 18px — body large
    xl: "1.25rem", // 20px — subheading
    "2xl": "1.5rem", // 24px — heading
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px — hero
  },
};
```

---

## 9. ANIMATIONS

### Is Three.js suitable?

**Short answer: NO for this app — here's why:**

| Consideration        | Reality                                        |
| -------------------- | ---------------------------------------------- |
| Target devices       | Low-end Android (Snapdragon 4xx, Mali GPU)     |
| Three.js bundle      | ~600KB minified — kills 2G load time           |
| GPU on budget phones | WebGL context creation fails or throttles      |
| Use case             | Labour hiring app, not an immersive experience |
| Maintenance          | Adds significant complexity for zero UX gain   |

**Three.js verdict: ❌ Overkill and harmful to performance for this context.**

Use Three.js if/when: a landing marketing page for the platform (not the app itself), running on known decent-spec devices, or for an admin 3D district map visualization (optional future feature).

### What TO use instead:

#### Web — Framer Motion

```bash
pnpm add framer-motion
```

```typescript
// Worker card entrance — staggered list
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05, duration: 0.3 }}
>
  <WorkerCard worker={worker} />
</motion.div>

// Hire confirmation modal — spring scale
<motion.div
  initial={{ scale: 0.85, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.85, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
>

// Page transitions
const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit:    { x: '-30%', opacity: 0 },
}
```

#### Android — Reanimated 3

```typescript
// Worker card swipe-to-hire
const translateX = useSharedValue(0);
const gestureHandler = useAnimatedGestureHandler({
  onActive: (event) => {
    translateX.value = event.translationX;
  },
  onEnd: () => {
    if (translateX.value > 80) runOnJS(onHire)();
    translateX.value = withSpring(0);
  },
});

// Available pulse badge
const scale = useSharedValue(1);
scale.value = withRepeat(
  withSequence(
    withTiming(1.15, { duration: 600 }),
    withTiming(1, { duration: 600 }),
  ),
  -1,
  false,
);
```

### Animation Catalogue for this App

```
✅ Card entrance     → Stagger fade-up (Framer/Reanimated)
✅ Page transition   → Slide + fade (native-feeling)
✅ Hire modal        → Spring scale from button origin
✅ Success state     → Confetti burst (canvas-based, tiny)
✅ Skeleton loading  → Shimmer animation (CSS only)
✅ Available badge   → Gentle pulse (CSS keyframes)
✅ Pull-to-refresh   → Custom lottie (Expo Lottie, ~20KB JSON)
✅ Bottom sheet      → Spring drag (Gorhom Bottom Sheet)
✅ Notification bell → Shake on new notification
✅ Number counter    → Count-up animation on dashboard stats
✅ Province bar      → Width animate on mount
❌ Particle system   → Not needed
❌ 3D anything       → Not needed
❌ Complex SVG morph → Not needed
```

### Lottie for micro-animations (15-30KB each)

```bash
# Web
pnpm add lottie-react

# Android
npx expo install lottie-react-native

# Use for: success hire, empty state, loading, error states
```

---

## 10. OFFLINE & PWA STRATEGY

### Service Worker (Vite PWA Plugin)

```typescript
// vite.config.ts
import { VitePWA } from "vite-plugin-pwa";

VitePWA({
  registerType: "autoUpdate",
  workbox: {
    globPatterns: ["**/*.{js,css,html,woff2}"],
    runtimeCaching: [
      {
        urlPattern: /\/api\/workers/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "workers-cache",
          expiration: { maxAgeSeconds: 3600 },
        },
      },
    ],
  },
  manifest: {
    name: "श्रम सेवा — Nepal Manpower",
    short_name: "श्रम सेवा",
    theme_color: "#7C1D2B",
    background_color: "#FAF7F0",
    display: "standalone",
    orientation: "portrait",
  },
});
```

### WatermelonDB for Android offline

```typescript
// Sync architecture: WatermelonDB ↔ Supabase
// Workers table syncs on app open (delta sync)
// Hire records queue offline → sync on reconnect
// 753 local units seeded locally → no network needed for geodata
```

---

## 11. NOTIFICATIONS ARCHITECTURE

```
User hires worker
  → Edge Function: hire-worker
      → Insert hire_record
      → Insert notification record
      → Call Expo Push API
          → Expo routes to FCM (Android) / APNs (iOS)
              → Device receives push notification

Supabase Realtime:
  → In-app notification bell updates in real-time
  → No polling needed
```

### Notification Types

```typescript
type NotificationType =
  | "hire_request" // Worker: "Ram Bahadur wants to hire you"
  | "hire_accepted" // Hirer: "Sita accepted your hire request"
  | "hire_rejected" // Hirer: "Worker unavailable"
  | "hire_completed" // Both: "Job marked complete — please review"
  | "new_review" // Worker: "You received a 5-star review"
  | "system"; // "Your profile has been approved"
```

---

## 12. RECOMMENDED TOOLCHAIN SUMMARY

```
MONOREPO        Turborepo + pnpm workspaces
BACKEND         Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
CACHE/QUEUE     Upstash Redis (serverless Redis)
CDN             Cloudflare Pages (web) + Cloudflare Workers (middleware)

WEB             React 18 + Vite 5 + TypeScript
ROUTING         TanStack Router (type-safe) or React Router v6
STATE           TanStack Query (server) + Zustand (client)
FORMS           React Hook Form + Zod
COMPONENTS      shadcn/ui + Radix UI
STYLING         Tailwind CSS v4
ANIMATION       Framer Motion
PWA             vite-plugin-pwa + Workbox

ANDROID         React Native + Expo SDK 51
NAVIGATION      Expo Router v3
COMPONENTS      React Native Paper (MD3)
ANIMATION       Reanimated 3 + Gesture Handler
OFFLINE DB      WatermelonDB
STORAGE         Expo SecureStore (tokens) + MMKV (cache)
NOTIFICATIONS   Expo Notifications → FCM

SECURITY        Supabase Auth (Phone OTP) + JOSE JWT + RLS + Upstash rate limit
VALIDATION      Zod (shared between web + android + edge functions)
MONITORING      Sentry (both platforms)
CI/CD           GitHub Actions + Expo EAS Build + Cloudflare Pages

FUTURE KOTLIN   REST API from Supabase → direct Retrofit/OkHttp calls
                Same DB schema, same auth tokens
                WatermelonDB → Room DB migration
```

---

## 13. THREE.JS — FINAL VERDICT

| Use case                           | Verdict                                                 |
| ---------------------------------- | ------------------------------------------------------- |
| Main app UI                        | ❌ Never                                                |
| Worker cards, animations           | ❌ Use Framer Motion                                    |
| Admin dashboard charts             | ❌ Use Recharts/Victory                                 |
| Marketing landing page (future)    | ✅ Mountain particle system — beautiful                 |
| 3D Nepal map (admin, desktop only) | ✅ Appropriate if scoped to desktop                     |
| App loading screen                 | ⚠️ Maybe — a simple 3D mountain logo, but only if <50KB |

**Conclusion: Framer Motion + Lottie + CSS animations covers 100% of what this app needs. Three.js would be a liability, not an asset, for rural Nepal's device profile.**

---

_Document generated for श्रम सेवा production planning. Review before implementation._
