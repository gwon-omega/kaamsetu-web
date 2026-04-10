import { useQuery } from "@tanstack/react-query";
import { jobCategoriesApi } from "@shram-sewa/shared/api";
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

export function useJobCategories(enabled = true) {
  const backendReady = enabled && canUseBackend();

  return useQuery({
    queryKey: ["job-categories", "active"],
    enabled: backendReady,
    queryFn: () => jobCategoriesApi.getAll(),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
