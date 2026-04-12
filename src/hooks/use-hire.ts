import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  hireApi,
  notificationsApi,
  type CreateHireRequest,
} from "@shram-sewa/shared/api";
import type {
  SubmitReviewInput,
  UpdateHireStatusInput,
} from "@shram-sewa/shared";
import { useAuthStore } from "../store/auth-store";
import { reportWebError } from "../lib/monitoring";
import { queryKeys } from "../lib/query-client";
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

export function useHireRecord(hireId: string | undefined, enabled = true) {
  const backendReady = enabled && canUseBackend();

  return useQuery({
    queryKey: queryKeys.hires.detail(hireId ?? ""),
    queryFn: () => hireApi.getById(hireId!),
    enabled: backendReady && !!hireId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useMyHires(enabled = true) {
  const backendReady = enabled && canUseBackend();
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: queryKeys.hires.byHirer(userId ?? ""),
    queryFn: () => hireApi.listByHirer(userId!),
    enabled: backendReady && !!userId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateHireMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHireRequest) => hireApi.create(input),
    onSuccess: (hire) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hires.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hires.byWorker(hire.workerId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hires.byHirer(hire.hirerId),
      });

      void notificationsApi.dispatchHireRequest(hire.id).catch((error) => {
        console.warn("Worker notification dispatch failed:", error);
        void reportWebError({
          category: "notification",
          level: "warning",
          message:
            error instanceof Error
              ? error.message
              : "Worker notification dispatch failed",
          stack: error instanceof Error ? error.stack : undefined,
          context: {
            hireId: hire.id,
            workerId: hire.workerId,
            hirerId: hire.hirerId,
          },
        });
      });
    },
  });
}

export function useUpdateHireStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateHireStatusInput) => hireApi.updateStatus(input),
    onSuccess: (hire) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hires.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hires.detail(hire.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hires.byWorker(hire.workerId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hires.byHirer(hire.hirerId),
      });
    },
  });
}

export function useSubmitHireReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubmitReviewInput) => hireApi.submitReview(input),
    onSuccess: (hire) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.hires.detail(hire.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hires.byWorker(hire.workerId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hires.byHirer(hire.hirerId),
      });
    },
  });
}
