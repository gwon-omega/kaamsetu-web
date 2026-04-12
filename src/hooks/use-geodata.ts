/**
 * useGeodata hook — TanStack Query
 * Fetches Nepal administrative data
 */

import { useQuery } from "@tanstack/react-query";
import { geodataApi } from "@shram-sewa/shared/api";
import { queryKeys } from "../lib/query-client";

/**
 * Get all provinces
 * This data is static, cache forever
 */
export function useProvinces() {
  return useQuery({
    queryKey: queryKeys.geodata.provinces,
    queryFn: () => geodataApi.getProvinces(),
    staleTime: Infinity, // Never stale - static data
    gcTime: Infinity, // Keep in cache forever
  });
}

/**
 * Get districts for a province
 */
export function useDistricts(provinceId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.geodata.districts(provinceId ?? 0),
    queryFn: () => geodataApi.getDistricts(provinceId!),
    enabled: !!provinceId,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Get local units (municipalities) for a district
 */
export function useLocalUnits(districtId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.geodata.localUnits(districtId ?? 0),
    queryFn: () => geodataApi.getLocalUnits(districtId!),
    enabled: !!districtId,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
