import { useQuery } from "@tanstack/react-query";
import { hireApi } from "@shram-sewa/shared/api";
import { getSupabaseClient, isSupabaseConfigured } from "../lib";
import { useAuthSession } from "./use-auth-session";

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

export function useMyHires(enabled = true) {
  const backendReady = enabled && canUseBackend();
  const sessionQuery = useAuthSession(backendReady);
  const userId = sessionQuery.data?.user?.id;

  return useQuery({
    queryKey: ["hires", "hirer", userId ?? ""],
    enabled: backendReady && !!userId,
    queryFn: () => hireApi.listByHirer(userId!),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useHireRecord(hireId: string | undefined, enabled = true) {
  const backendReady = enabled && canUseBackend();

  return useQuery({
    queryKey: ["hires", "detail", hireId ?? ""],
    enabled: backendReady && !!hireId,
    queryFn: () => hireApi.getById(hireId!),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
