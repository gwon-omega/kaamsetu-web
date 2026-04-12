/**
 * TanStack Query configuration
 */

import { MutationCache, QueryClient } from "@tanstack/react-query";
import { reportWebMutationFailure } from "./monitoring";

const mutationCache = new MutationCache({
  onError: (error, variables, _context, mutation) => {
    void reportWebMutationFailure("react-query", error, {
      mutationKey: mutation.options.mutationKey,
      variables,
    });
  },
});

export const queryClient = new QueryClient({
  mutationCache,
  defaultOptions: {
    queries: {
      // Stale time: data is fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Cache time: keep in cache for 30 minutes
      gcTime: 30 * 60 * 1000,

      // Retry failed queries twice
      retry: 2,

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Avoid unnecessary traffic on focus changes.
      refetchOnWindowFocus: false,

      // Refetch once when connectivity is restored.
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Query key factory for type-safe query keys
 */
export const queryKeys = {
  // Workers
  workers: {
    all: ["workers"] as const,
    search: (filters: Record<string, unknown>) =>
      ["workers", "search", filters] as const,
    detail: (id: string) => ["workers", "detail", id] as const,
  },

  // Geodata
  geodata: {
    provinces: ["geodata", "provinces"] as const,
    districts: (provinceId: number) =>
      ["geodata", "districts", provinceId] as const,
    localUnits: (districtId: number) =>
      ["geodata", "localUnits", districtId] as const,
  },

  // Job categories
  jobCategories: {
    all: ["jobCategories"] as const,
  },

  // Hire records
  hires: {
    all: ["hires"] as const,
    byWorker: (workerId: string) => ["hires", "worker", workerId] as const,
    byHirer: (hirerId: string) => ["hires", "hirer", hirerId] as const,
    detail: (id: string) => ["hires", "detail", id] as const,
  },

  // Notifications
  notifications: {
    all: (userId: string) => ["notifications", "all", userId] as const,
    unread: (userId: string) => ["notifications", "unread", userId] as const,
  },

  // User
  user: {
    me: ["user", "me"] as const,
    profile: (id: string) => ["user", "profile", id] as const,
  },
};
