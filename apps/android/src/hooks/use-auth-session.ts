import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@shram-sewa/shared/api";
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

export function useAuthSession(enabled = true) {
  const backendReady = enabled && canUseBackend();

  return useQuery({
    queryKey: ["auth", "session"],
    enabled: backendReady,
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      queryClient.invalidateQueries({ queryKey: ["hires"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}
