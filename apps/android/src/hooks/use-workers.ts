import { useQuery } from "@tanstack/react-query";
import { workersApi, type WorkerFilters } from "@shram-sewa/shared/api";
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

export function useWorkersSearch(
  filters: WorkerFilters,
  page = 1,
  pageSize = 30,
  enabled = true,
) {
  const backendReady = enabled && canUseBackend();

  return useQuery({
    queryKey: ["workers", "search", filters, page, pageSize],
    enabled: backendReady,
    queryFn: () => workersApi.search(filters, page, pageSize),
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useWorker(workerId: string | undefined, enabled = true) {
  const backendReady = enabled && canUseBackend();

  return useQuery({
    queryKey: ["workers", "detail", workerId ?? ""],
    enabled: backendReady && !!workerId,
    queryFn: () => workersApi.getById(workerId!),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
