/**
 * Hire State Machine — Zustand-based
 * Manages the complete hire request flow with state transitions
 *
 * State Flow:
 * IDLE → PENDING → ACCEPTED/REJECTED → COMPLETED
 */

import { create } from "zustand";
import type { HireRecord } from "@shram-sewa/shared";
import { isSupabaseConfigured } from "../lib";
import {
  createIpFingerprint,
  hasHireIpLock,
  resolveClientIpAddress,
  setHireIpLock,
} from "../lib";

export type HireStatus =
  | "idle"
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export interface HireState {
  // Current hire context
  currentHire: HireRecord | null;
  status: HireStatus;

  // Worker being hired
  workerId: string | null;
  workerName: string | null;

  // Hirer info
  hirerId: string | null;

  // Work details
  workDescription: string;
  agreedRate: number | null;
  workDate: Date | null;
  workDurationDays: number;

  // Error state
  error: string | null;
  errorStatus: number | null;

  // Security context
  hirerIp: string | null;
  ipFingerprint: string | null;
  securityContextStatus: "idle" | "collecting" | "verified" | "failed";

  // Transition history (for debugging/analytics)
  transitionLog: Array<{
    from: HireStatus;
    to: HireStatus;
    timestamp: Date;
    reason?: string;
  }>;

  // Internal helper (used by actions)
  _logTransition: (from: HireStatus, to: HireStatus, reason?: string) => void;

  // State machine actions
  initiateHire: (
    workerId: string,
    workerName: string,
    details: {
      workDescription: string;
      agreedRate?: number;
      workDate?: Date;
      workDurationDays?: number;
    },
  ) => void;

  confirmHire: () => Promise<boolean>;
  acceptHire: () => Promise<void>;
  rejectHire: (reason?: string) => Promise<void>;
  completeHire: () => Promise<void>;
  cancelHire: (reason?: string) => void;
  resetHire: () => void;

  // Derived state
  canTransitionTo: (newStatus: HireStatus) => boolean;
  isPending: () => boolean;
  isCompleted: () => boolean;
  canRate: () => boolean;
}

const validTransitions: Record<HireStatus, HireStatus[]> = {
  idle: ["pending"],
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["completed", "cancelled"],
  rejected: ["idle"], // Can try again
  completed: ["idle"], // Can hire again (same worker, different IP)
  cancelled: ["idle"],
};

export const useHireStore = create<HireState>((set, get) => ({
  // Initial state
  currentHire: null,
  status: "idle",
  workerId: null,
  workerName: null,
  hirerId: null,
  workDescription: "",
  agreedRate: null,
  workDate: null,
  workDurationDays: 1,
  error: null,
  errorStatus: null,
  hirerIp: null,
  ipFingerprint: null,
  securityContextStatus: "idle",
  transitionLog: [],

  // Helper to log transitions
  _logTransition: (from: HireStatus, to: HireStatus, reason?: string) => {
    set((state) => ({
      transitionLog: [
        ...state.transitionLog,
        {
          from,
          to,
          timestamp: new Date(),
          reason,
        },
      ],
    }));
  },

  // Check if transition is valid
  canTransitionTo: (newStatus: HireStatus) => {
    const currentStatus = get().status;
    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  },

  // State queries
  isPending: () => get().status === "pending",
  isCompleted: () => get().status === "completed",
  canRate: () => get().status === "completed" && get().currentHire !== null,

  // Action: Initiate hire (IDLE → PENDING)
  initiateHire: (workerId, workerName, details) => {
    const state = get();
    if (!state.canTransitionTo("pending")) {
      set({
        error: "Cannot initiate hire from current state",
        errorStatus: 409,
      });
      return;
    }

    set({
      status: "pending",
      workerId,
      workerName,
      workDescription: details.workDescription,
      agreedRate: details.agreedRate ?? null,
      workDate: details.workDate ?? null,
      workDurationDays: details.workDurationDays ?? 1,
      error: null,
      errorStatus: null,
      hirerIp: null,
      ipFingerprint: null,
      securityContextStatus: "idle",
    });

    // Log transition
    get()._logTransition("idle", "pending", "User initiated hire");
  },

  // Action: Confirm hire (send to backend)
  confirmHire: async () => {
    const state = get();
    if (state.status !== "pending") {
      set({
        status: "idle",
        error: "Cannot confirm hire unless status is pending",
        errorStatus: 409,
      });
      return false;
    }

    if (!state.workerId) {
      set({
        status: "idle",
        error: "Worker identity is missing. Please try again.",
        errorStatus: 400,
      });
      get()._logTransition("pending", "idle", "Missing worker ID");
      return false;
    }

    set({
      error: null,
      errorStatus: null,
      securityContextStatus: "collecting",
    });

    const ipFingerprint = createIpFingerprint();
    const hirerIp = await resolveClientIpAddress();

    if (hirerIp && hasHireIpLock(state.workerId, hirerIp)) {
      set({
        status: "idle",
        hirerIp,
        ipFingerprint,
        securityContextStatus: "failed",
        error:
          "This worker has already been requested from your current IP location. Use a different location or contact support.",
        errorStatus: 409,
      });
      get()._logTransition(
        "pending",
        "idle",
        "IP-based duplicate hire blocked",
      );
      return false;
    }

    if (hirerIp) {
      setHireIpLock(state.workerId, hirerIp, ipFingerprint);
    }

    set({
      hirerIp: hirerIp ?? null,
      ipFingerprint,
      securityContextStatus: "verified",
    });

    if (!isSupabaseConfigured()) {
      set({
        status: "idle",
        securityContextStatus: "verified",
        error: "Hiring is unavailable until Supabase is configured.",
        errorStatus: 503,
      });
      get()._logTransition("pending", "idle", "Supabase not configured");
      return false;
    }

    // Integration note: when backend edge function is wired, create the
    // record here and keep status as pending only on successful persistence.
    set({
      status: "idle",
      securityContextStatus: "verified",
      error:
        "Hire API is not integrated yet. Connect edge functions before enabling this flow.",
      errorStatus: 501,
    });
    get()._logTransition("pending", "idle", "Hire API not integrated");
    return false;
  },

  // Action: Worker accepts hire (PENDING → ACCEPTED)
  acceptHire: async () => {
    const state = get();
    if (!state.canTransitionTo("accepted")) {
      set({
        error: "Cannot accept hire from current state",
        errorStatus: 409,
      });
      return;
    }

    set({
      error:
        "Hire status update API is not integrated yet. Cannot accept request.",
      errorStatus: 501,
    });
  },

  // Action: Worker rejects hire (PENDING → REJECTED)
  rejectHire: async (reason) => {
    const state = get();
    if (!state.canTransitionTo("rejected")) {
      set({
        error: "Cannot reject hire from current state",
        errorStatus: 409,
      });
      return;
    }

    set({
      error:
        "Hire status update API is not integrated yet. Cannot reject request.",
      errorStatus: 501,
    });
    if (reason) {
      get()._logTransition("pending", "pending", reason);
    }
  },

  // Action: Complete work (ACCEPTED → COMPLETED)
  completeHire: async () => {
    const state = get();
    if (!state.canTransitionTo("completed")) {
      set({
        error: "Cannot complete hire from current state",
        errorStatus: 409,
      });
      return;
    }

    set({
      error:
        "Hire status update API is not integrated yet. Cannot complete request.",
      errorStatus: 501,
    });
  },

  // Action: Cancel hire (any non-completed → CANCELLED)
  cancelHire: (reason) => {
    const state = get();
    if (!state.canTransitionTo("cancelled")) {
      set({
        error: "Cannot cancel hire from current state",
        errorStatus: 409,
      });
      return;
    }

    set({
      status: "cancelled",
      error: null,
      errorStatus: null,
    });

    get()._logTransition(state.status, "cancelled", reason ?? "Hire cancelled");
  },

  // Action: Reset to idle (start over)
  resetHire: () => {
    const state = get();
    set({
      currentHire: null,
      status: "idle",
      workerId: null,
      workerName: null,
      workDescription: "",
      agreedRate: null,
      workDate: null,
      workDurationDays: 1,
      error: null,
      errorStatus: null,
      hirerIp: null,
      ipFingerprint: null,
      securityContextStatus: "idle",
    });

    get()._logTransition(state.status, "idle", "Reset to idle");
  },
}));
