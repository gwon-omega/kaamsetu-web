/* @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { hireApi, notificationsApi } from "@shram-sewa/shared/api";
import * as supabaseLib from "../../src/lib/supabase";
import {
  enqueueHireOutbox,
  flushHireOutbox,
  getQueuedHireCount,
} from "../../src/lib/hire-outbox";

describe("web hire outbox smoke", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();

    vi.spyOn(supabaseLib, "isSupabaseConfigured").mockReturnValue(true);
    vi.spyOn(supabaseLib, "getSupabaseClient").mockReturnValue({} as never);

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  it("queues only one item for duplicate payloads", () => {
    const payload = {
      workerId: "worker-1",
      hirerIp: "203.0.113.8",
      workDescription: "Need plumbing support",
      workDurationDays: 2,
      workDate: new Date("2026-04-12T00:00:00.000Z"),
    };

    const first = enqueueHireOutbox(payload);
    const second = enqueueHireOutbox(payload);

    expect(first.queued).toBe(true);
    expect(first.duplicate).toBe(false);
    expect(second.queued).toBe(true);
    expect(second.duplicate).toBe(true);
    expect(getQueuedHireCount()).toBe(1);
  });

  it("flushes queued hire payload when network is online", async () => {
    vi.spyOn(hireApi, "create").mockResolvedValue({
      id: "hire-1",
      workerId: "worker-1",
      hirerId: "hirer-1",
      hirerIp: "203.0.113.8",
      status: "pending",
      workDurationDays: 2,
      hiredAt: new Date("2026-04-12T00:00:00.000Z"),
    } as never);

    const notificationSpy = vi
      .spyOn(notificationsApi, "dispatchHireRequest")
      .mockResolvedValue({
        notificationId: "notif-1",
        workerUserId: "worker-user-1",
        sentCount: 1,
        invalidTokenCount: 0,
      } as never);

    enqueueHireOutbox({
      workerId: "worker-1",
      hirerIp: "203.0.113.8",
      workDescription: "Need plumbing support",
      workDurationDays: 2,
      workDate: new Date("2026-04-12T00:00:00.000Z"),
    });

    const result = await flushHireOutbox();

    expect(result.processed).toBe(1);
    expect(result.remaining).toBe(0);
    expect(getQueuedHireCount()).toBe(0);
    expect(notificationSpy).toHaveBeenCalledWith("hire-1");
  });
});
