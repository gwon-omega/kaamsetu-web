/* @vitest-environment jsdom */

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { workersApi } from "@shram-sewa/shared/api";
import { useWorkers } from "../../apps/web/src/hooks/use-workers";
import * as webLib from "../../apps/web/src/lib";

function createWrapper(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("web workers search smoke", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("runs workers search query when backend is available", async () => {
    vi.spyOn(webLib, "isSupabaseConfigured").mockReturnValue(true);
    vi.spyOn(webLib, "getSupabaseClient").mockReturnValue({} as never);

    const workersResult = {
      data: [
        {
          id: "worker-1",
          fullName: "Sita Magar",
        },
      ],
      count: 1,
      page: 1,
      pageSize: 20,
    };

    const searchWorkersSpy = vi
      .spyOn(workersApi, "search")
      .mockResolvedValue(workersResult as never);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const filters = { districtId: 18, isAvailable: true };

    const { result } = renderHook(() => useWorkers(filters, 1, 20, true), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(searchWorkersSpy).toHaveBeenCalledWith(filters, 1, 20);
    expect(result.current.data).toEqual(workersResult);
  });

  it("keeps query idle when backend is unavailable", async () => {
    vi.spyOn(webLib, "isSupabaseConfigured").mockReturnValue(false);
    const searchWorkersSpy = vi.spyOn(workersApi, "search");

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const { result } = renderHook(
      () => useWorkers({ districtId: 18 }, 1, 20, true),
      {
        wrapper: createWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe("idle");
    });

    expect(searchWorkersSpy).not.toHaveBeenCalled();
  });
});
