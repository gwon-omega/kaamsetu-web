import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { initSupabase, type TypedSupabaseClient } from "@shram-sewa/shared/api";

type PublicConfig = {
  PUBLIC_ENABLE_SUPABASE?: string;
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_ANON_KEY?: string;
};

let supabaseClient: TypedSupabaseClient | null = null;

const secureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore non-fatal secure store write issues.
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore non-fatal secure store delete issues.
    }
  },
};

type RuntimeProcess = {
  env?: Partial<Record<string, string | undefined>>;
};

function getConfigValue(name: keyof PublicConfig): string | undefined {
  const extra = (Constants.expoConfig?.extra ?? {}) as PublicConfig;
  const runtimeEnv = (globalThis as { process?: RuntimeProcess }).process?.env;
  return runtimeEnv?.[name] ?? extra[name];
}

function isSupabaseEnabled(): boolean {
  const raw = getConfigValue("PUBLIC_ENABLE_SUPABASE");

  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase();
    if (!value) {
      return true;
    }
    return !["false", "0", "off", "no"].includes(value);
  }

  // Backward compatibility: if explicit flag is missing but URL/key are present,
  // treat backend as enabled to avoid accidental auth lockout.
  return Boolean(
    getConfigValue("PUBLIC_SUPABASE_URL") && getSupabasePublicKey(),
  );
}

function getSupabasePublicKey(): string | undefined {
  return getConfigValue("PUBLIC_SUPABASE_ANON_KEY");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    isSupabaseEnabled() &&
    getConfigValue("PUBLIC_SUPABASE_URL") &&
    getSupabasePublicKey(),
  );
}

export function getSupabaseClient(): TypedSupabaseClient {
  if (!isSupabaseEnabled()) {
    throw new Error("Supabase is disabled. Set PUBLIC_ENABLE_SUPABASE=true.");
  }

  if (!supabaseClient) {
    const url = getConfigValue("PUBLIC_SUPABASE_URL");
    const anonKey = getSupabasePublicKey();

    if (!url || !anonKey) {
      throw new Error(
        "Missing Supabase config. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.",
      );
    }

    supabaseClient = initSupabase({
      url,
      anonKey,
      options: {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storage: secureStoreAdapter,
        },
      },
    });
  }

  return supabaseClient;
}
