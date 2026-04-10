import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient, isSupabaseConfigured } from "../lib";

function canUseBackend() {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    getSupabaseClient();
    return true;
  } catch {
    return false;
  }
}

export type UserProfileRow = {
  id: string;
  phone: string | null;
  full_name: string | null;
  full_name_np: string | null;
  role: "worker" | "hirer" | "admin";
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
};

export function useCurrentUserProfile(
  userId: string | undefined,
  enabled = true,
) {
  const backendReady = enabled && canUseBackend();

  return useQuery({
    queryKey: ["users", "profile", userId ?? ""],
    enabled: backendReady && !!userId,
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, phone, full_name, full_name_np, role, is_verified, is_active, created_at",
        )
        .eq("id", userId!)
        .single();

      if (error) {
        throw error;
      }

      return data as UserProfileRow;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
