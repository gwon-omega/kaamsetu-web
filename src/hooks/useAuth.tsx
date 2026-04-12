/**
 * Auth Context — Supabase Auth integration
 * Provides session, user, and auth actions throughout the app
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getSupabaseSafe } from "../lib/supabase";

interface AuthUser {
  id: string;
  phone: string;
  email?: string;
  role: "worker" | "hirer" | "admin";
  fullName?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  signInWithOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, meta?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Listen to Supabase auth state
  useEffect(() => {
    const supabase = getSupabaseSafe();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(mapUser(data.session.user));
      }
      setIsLoading(false);
    });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapUser(session.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = useCallback(async (phone: string) => {
    const supabase = getSupabaseSafe();
    if (!supabase) return { success: false, error: "Supabase not available" };

    const fullPhone = phone.startsWith("+977") ? phone : `+977${phone}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const supabase = getSupabaseSafe();
    if (!supabase) return { success: false, error: "Supabase not available" };

    const fullPhone = phone.startsWith("+977") ? phone : `+977${phone}`;
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token, type: "sms" });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseSafe();
    if (!supabase) return { success: false, error: "Supabase not available" };

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string, meta?: any) => {
    const supabase = getSupabaseSafe();
    if (!supabase) return { success: false, error: "Supabase not available" };

    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: meta
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseSafe();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      showAuthModal,
      setShowAuthModal,
      signInWithOtp,
      verifyOtp,
      signInWithPassword,
      signUp,
      signOut: handleSignOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function mapUser(supaUser: any): AuthUser {
  return {
    id: supaUser.id,
    phone: supaUser.phone?.replace("+977", "") ?? "",
    email: supaUser.email ?? undefined,
    role: supaUser.user_metadata?.role ?? "hirer",
    fullName: supaUser.user_metadata?.full_name ?? undefined,
  };
}
