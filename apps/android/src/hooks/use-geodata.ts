import { useQuery } from "@tanstack/react-query";
import { geodataApi } from "@shram-sewa/shared/api";
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

export function useLocalUnitsByDistrict(
  districtId: number | null,
  enabled = true,
) {
  const backendReady = enabled && canUseBackend();

  return useQuery({
    queryKey: ["geodata", "local-units", districtId ?? ""],
    enabled: backendReady && districtId !== null,
    queryFn: () => geodataApi.getLocalUnits(districtId!),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
