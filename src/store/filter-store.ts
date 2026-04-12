/**
 * Filter Store — Zustand
 * Manages worker search filters and preferences
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WorkerSearchFilters } from "@shram-sewa/shared";

interface FilterState {
  // Current filters
  filters: WorkerSearchFilters;

  // Convenience accessors (flat access)
  provinceId: number | undefined;
  districtId: number | undefined;
  jobCategory: number | undefined;

  // Recent selections (for quick access)
  recentProvinces: number[];
  recentDistricts: number[];
  recentJobCategories: number[];

  // Actions
  setFilter: <K extends keyof WorkerSearchFilters>(
    key: K,
    value: WorkerSearchFilters[K],
  ) => void;
  setFilters: (filters: Partial<WorkerSearchFilters>) => void;
  setProvinceId: (id: number | undefined) => void;
  setDistrictId: (id: number | undefined) => void;
  setJobCategory: (id: number | undefined) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  addRecentProvince: (id: number) => void;
  addRecentDistrict: (id: number) => void;
  addRecentJobCategory: (id: number) => void;
}

const defaultFilters: WorkerSearchFilters = {
  isAvailable: true,
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state
      filters: defaultFilters,
      recentProvinces: [],
      recentDistricts: [],
      recentJobCategories: [],

      // Convenience getters (computed from filters)
      get provinceId() {
        return get().filters.provinceId;
      },
      get districtId() {
        return get().filters.districtId;
      },
      get jobCategory() {
        return get().filters.jobCategoryId;
      },

      // Actions
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      setProvinceId: (id) =>
        set((state) => ({
          filters: { ...state.filters, provinceId: id },
        })),

      setDistrictId: (id) =>
        set((state) => ({
          filters: { ...state.filters, districtId: id },
        })),

      setJobCategory: (id) =>
        set((state) => ({
          filters: { ...state.filters, jobCategoryId: id },
        })),

      clearFilters: () => set({ filters: defaultFilters }),

      resetFilters: () => set({ filters: defaultFilters }),

      addRecentProvince: (id) =>
        set((state) => ({
          recentProvinces: [
            id,
            ...state.recentProvinces.filter((x) => x !== id),
          ].slice(0, 5),
        })),

      addRecentDistrict: (id) =>
        set((state) => ({
          recentDistricts: [
            id,
            ...state.recentDistricts.filter((x) => x !== id),
          ].slice(0, 10),
        })),

      addRecentJobCategory: (id) =>
        set((state) => ({
          recentJobCategories: [
            id,
            ...state.recentJobCategories.filter((x) => x !== id),
          ].slice(0, 5),
        })),
    }),
    {
      name: "shram-sewa-filters",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
