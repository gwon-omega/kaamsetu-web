/* @vitest-environment jsdom */

import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hireApi, notificationsApi } from "@shram-sewa/shared/api";
import { useCreateHireMutation } from "../../src/hooks/use-hire";
import { queryKeys } from "../../src/lib/query-client";

describe("web hire flow integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates hire and invalidates related query caches", async () => {
    const hireResult = {
      id: "hire-100",
      workerId: "worker-9",
      hirerId: "hirer-12",
      hirerIp: "203.0.113.10",
      status: "pending",
      workDurationDays: 2,
      hiredAt: new Date("2026-04-06T11:00:00.000Z"),
    };

    const createHireSpy = vi
      .spyOn(hireApi, "create")
      .mockResolvedValue(hireResult as never);
    const dispatchHireRequestSpy = vi
      .spyOn(notificationsApi, "dispatchHireRequest")
      .mockResolvedValue({
        notificationId: "notif-1",
        workerUserId: "worker-user-9",
        sentCount: 1,
        invalidTokenCount: 0,
      } as never);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreateHireMutation(), { wrapper });

    await result.current.mutateAsync({
      workerId: "worker-9",
      hirerIp: "203.0.113.10",
      workDescription: "Need stone masonry",
      workDurationDays: 2,
    });

    expect(createHireSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        workerId: "worker-9",
        hirerIp: "203.0.113.10",
      }),
    );

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.hires.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.hires.byWorker("worker-9"),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.hires.byHirer("hirer-12"),
      });
    });

    expect(dispatchHireRequestSpy).toHaveBeenCalledWith("hire-100");
  });
});
