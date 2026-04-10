import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workerProfilesApi, workersApi } from "@shram-sewa/shared/api";
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

export function useMyWorkerProfile(enabled = true) {
  const backendReady = enabled && canUseBackend();
  const sessionQuery = useAuthSession(backendReady);
  const userId = sessionQuery.data?.user?.id;

  return useQuery({
    queryKey: ["workers", "me", userId ?? ""],
    enabled: backendReady && !!userId,
    queryFn: () => workersApi.getByUserId(userId!),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useWorkerAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { profileId: string; isAvailable: boolean }) =>
      workerProfilesApi.updateById(input.profileId, {
        isAvailable: input.isAvailable,
      }),
    onSuccess: (workerProfile) => {
      queryClient.invalidateQueries({ queryKey: ["workers", "me"] });
      queryClient.invalidateQueries({
        queryKey: ["workers", "detail", workerProfile.id],
      });
      queryClient.invalidateQueries({ queryKey: ["workers", "search"] });
    },
  });
}
