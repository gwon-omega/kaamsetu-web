/**
 * Supabase client initialization for web
 */

import { initSupabase, type TypedSupabaseClient } from "@shram-sewa/shared/api";

let supabaseClient: TypedSupabaseClient | null = null;
let initError: string | null = null;

function isSupabaseEnabled(): boolean {
  const raw = import.meta.env.PUBLIC_ENABLE_SUPABASE;

  if (typeof raw !== "string") {
    // Default to enabled in production builds. Explicitly set false to opt out.
    return true;
  }

  const value = raw.trim().toLowerCase();
  if (!value) {
    return true;
  }

  return !["false", "0", "off", "no"].includes(value);
}

function getSupabaseAnonKey(): string | undefined {
  return (
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  );
}

function getSupabaseConfig() {
  if (!isSupabaseEnabled()) {
    throw new Error(
      import.meta.env.DEV
        ? "Backend access is disabled. Set PUBLIC_ENABLE_SUPABASE=true to enable backend calls."
        : "Service is temporarily unavailable.",
    );
  }

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      import.meta.env.DEV
        ? "Missing backend environment variables. Add PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY (or PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
        : "Service is temporarily unavailable.",
    );
  }

  return { url, anonKey };
}

/**
 * Initialize and get Supabase client
 * Call once at app startup
 */
export function getSupabaseClient(): TypedSupabaseClient {
  const { url, anonKey } = getSupabaseConfig();

  if (!supabaseClient) {
    supabaseClient = initSupabase({
      url,
      anonKey,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    });
  }

  initError = null;
  return supabaseClient;
}

/**
 * Best-effort eager initialization used by app startup.
 */
export function bootstrapSupabase(): TypedSupabaseClient | null {
  try {
    return getSupabaseClient();
  } catch (error) {
    initError =
      error instanceof Error ? error.message : "Failed to initialize Supabase";
    if (import.meta.env.DEV) {
      console.warn("[shram-sewa]", initError);
    }
    return null;
  }
}

/**
 * Safe getter for compatibility with older modules.
 */
export function getSupabaseSafe(): TypedSupabaseClient | null {
  try {
    return getSupabaseClient();
  } catch {
    return null;
  }
}

/**
 * Helper to check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    isSupabaseEnabled() &&
    import.meta.env.PUBLIC_SUPABASE_URL &&
    getSupabaseAnonKey()
  );
}

export function isSupabaseReady(): boolean {
  return getSupabaseSafe() !== null;
}

export function getSupabaseError(): string | null {
  return initError;
}
