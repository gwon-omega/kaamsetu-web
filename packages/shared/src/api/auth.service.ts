/**
 * Supabase Auth Service
 * Handles phone OTP authentication flow with JWT tokens
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthSession,
  PhoneOtpRequest,
  OtpVerification,
} from "../validation/auth.schema";

// Environment variables (should be set in .env)
const importMetaEnv = (import.meta as { env?: Record<string, string> }).env;
const SUPABASE_URL = importMetaEnv?.PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = importMetaEnv?.PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Supabase client instance
 */
let supabase: SupabaseClient | null = null;

/**
 * Initialize Supabase client
 */
export function initSupabase(): SupabaseClient {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase URL and Anon Key must be configured");
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
      },
    });
  }

  return supabase;
}

/**
 * Get current Supabase client instance
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
}

/**
 * Request OTP for phone number
 * Sends a 6-digit OTP via SMS (5min expiry)
 */
export async function requestPhoneOtp(
  request: PhoneOtpRequest,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+977${request.phone}`, // Nepal country code +977
      options: {
        channel: "sms",
        data: {
          locale: request.locale,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Verify OTP and create session
 * Returns JWT access token (1hr) and refresh token (7 days)
 */
export async function verifyOtp(
  verification: OtpVerification,
): Promise<{ session: AuthSession | null; error?: string }> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+977${verification.phone}`,
      token: verification.otp,
      type: "sms",
    });

    if (error) {
      return { session: null, error: error.message };
    }

    if (!data.session) {
      return { session: null, error: "No session returned" };
    }

    // Transform Supabase session to our AuthSession type
    const session: AuthSession = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at || 0,
      expiresIn: data.session.expires_in || 3600,
      user: {
        id: data.session.user.id,
        phone: data.session.user.phone?.replace("+977", "") || "",
        role:
          (data.session.user.user_metadata?.role as
            | "worker"
            | "hirer"
            | "admin") || "hirer",
        isVerified: data.session.user.phone_confirmed_at !== null,
      },
    };

    return { session };
  } catch (err) {
    return {
      session: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ session: AuthSession | null; error?: string }> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      return { session: null, error: error.message };
    }

    if (!data.session) {
      return { session: null, error: "No session returned" };
    }

    const session: AuthSession = {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at || 0,
      expiresIn: data.session.expires_in || 3600,
      user: {
        id: data.session.user.id,
        phone: data.session.user.phone?.replace("+977", "") || "",
        role:
          (data.session.user.user_metadata?.role as
            | "worker"
            | "hirer"
            | "admin") || "hirer",
        isVerified: data.session.user.phone_confirmed_at !== null,
      },
    };

    return { session };
  } catch (err) {
    return {
      session: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Sign out and clear session
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      return null;
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at || 0,
      expiresIn: data.session.expires_in || 3600,
      user: {
        id: data.session.user.id,
        phone: data.session.user.phone?.replace("+977", "") || "",
        role:
          (data.session.user.user_metadata?.role as
            | "worker"
            | "hirer"
            | "admin") || "hirer",
        isVerified: data.session.user.phone_confirmed_at !== null,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}
