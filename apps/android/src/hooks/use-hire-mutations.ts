import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  hireApi,
  notificationsApi,
  type CreateHireRequest,
} from "@shram-sewa/shared/api";
import type { UpdateHireStatusInput } from "@shram-sewa/shared/validation";
import { reportAndroidError } from "../lib/monitoring";

export function useCreateHireMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHireRequest) => hireApi.create(input),
    onSuccess: (hire) => {
      queryClient.invalidateQueries({ queryKey: ["hires"] });
      queryClient.invalidateQueries({
        queryKey: ["hires", "worker", hire.workerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hires", "hirer", hire.hirerId],
      });
      queryClient.invalidateQueries({ queryKey: ["hires", "detail", hire.id] });

      void notificationsApi.dispatchHireRequest(hire.id).catch((error) => {
        console.warn("Worker notification dispatch failed:", error);
        void reportAndroidError({
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
      queryClient.invalidateQueries({ queryKey: ["hires"] });
      queryClient.invalidateQueries({
        queryKey: ["hires", "worker", hire.workerId],
      });
      queryClient.invalidateQueries({
        queryKey: ["hires", "hirer", hire.hirerId],
      });
      queryClient.invalidateQueries({ queryKey: ["hires", "detail", hire.id] });
    },
  });
}
