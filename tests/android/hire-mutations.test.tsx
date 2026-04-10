/* @vitest-environment jsdom */

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hireApi, notificationsApi } from "@shram-sewa/shared/api";
import {
  useCreateHireMutation,
  useUpdateHireStatusMutation,
} from "../../apps/android/src/hooks/use-hire-mutations";

const monitoringMocks = vi.hoisted(() => ({
  reportAndroidError: vi.fn(),
}));

vi.mock("../../apps/android/src/lib/monitoring", () => ({
  reportAndroidError: monitoringMocks.reportAndroidError,
}));

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("android hire mutations", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    monitoringMocks.reportAndroidError.mockReset();
  });

  it("creates hire and invalidates dependent cache keys", async () => {
    const hireResult = {
      id: "hire-android-1",
      workerId: "worker-android-7",
      hirerId: "hirer-android-2",
      hirerIp: "203.0.113.88",
      status: "pending",
      workDurationDays: 1,
      hiredAt: new Date("2026-04-06T12:00:00.000Z"),
    };

    const createHireSpy = vi
      .spyOn(hireApi, "create")
      .mockResolvedValue(hireResult as never);
    const dispatchHireRequestSpy = vi
      .spyOn(notificationsApi, "dispatchHireRequest")
      .mockResolvedValue({
        notificationId: "notif-a1",
        workerUserId: "worker-user-a1",
        sentCount: 1,
        invalidTokenCount: 0,
      } as never);
    monitoringMocks.reportAndroidError.mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateHireMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      workerId: "worker-android-7",
      hirerIp: "203.0.113.88",
      workDescription: "Need masonry support",
      workDurationDays: 1,
    });

    expect(createHireSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workerId: "worker-android-7",
        hirerIp: "203.0.113.88",
      }),
    );

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["hires"] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["hires", "worker", "worker-android-7"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["hires", "hirer", "hirer-android-2"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["hires", "detail", "hire-android-1"],
      });
    });

    expect(dispatchHireRequestSpy).toHaveBeenCalledWith("hire-android-1");
    expect(monitoringMocks.reportAndroidError).not.toHaveBeenCalled();
  });

  it("reports notification warning when push dispatch fails", async () => {
    const hireResult = {
      id: "hire-android-2",
      workerId: "worker-android-8",
      hirerId: "hirer-android-3",
      hirerIp: "203.0.113.89",
      status: "pending",
      workDurationDays: 2,
      hiredAt: new Date("2026-04-06T12:30:00.000Z"),
    };

    const dispatchError = new Error("Expo push unavailable");

    vi.spyOn(hireApi, "create").mockResolvedValue(hireResult as never);
    vi.spyOn(notificationsApi, "dispatchHireRequest").mockRejectedValue(
      dispatchError,
    );
    monitoringMocks.reportAndroidError.mockResolvedValue(undefined);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const { result } = renderHook(() => useCreateHireMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      workerId: "worker-android-8",
      hirerIp: "203.0.113.89",
      workDescription: "Need concrete support",
      workDurationDays: 2,
    });

    await waitFor(() => {
      expect(monitoringMocks.reportAndroidError).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "notification",
          level: "warning",
          message: "Expo push unavailable",
          context: {
            hireId: "hire-android-2",
            workerId: "worker-android-8",
            hirerId: "hirer-android-3",
          },
        }),
      );
    });
  });

  it("updates hire status and invalidates dependent cache keys", async () => {
    const hireResult = {
      id: "hire-android-3",
      workerId: "worker-android-9",
      hirerId: "hirer-android-4",
      hirerIp: "203.0.113.90",
      status: "accepted",
      workDurationDays: 3,
      hiredAt: new Date("2026-04-06T13:00:00.000Z"),
    };

    const updateHireStatusSpy = vi
      .spyOn(hireApi, "updateStatus")
      .mockResolvedValue(hireResult as never);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateHireStatusMutation(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutateAsync({
      hireId: "hire-android-3",
      status: "accepted",
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["hires"] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["hires", "worker", "worker-android-9"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["hires", "hirer", "hirer-android-4"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["hires", "detail", "hire-android-3"],
      });
    });

    expect(updateHireStatusSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        hireId: "hire-android-3",
        status: "accepted",
      }),
    );
  });
});
