/**
 * UI Store — Zustand
 * Manages UI state: theme, modals, toasts, sidebar
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
type Locale = "en" | "ne";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface UIState {
  // Theme
  theme: Theme;
  resolvedTheme: "light" | "dark";

  // Locale
  locale: Locale;

  // Sidebar (mobile)
  isSidebarOpen: boolean;

  // Modal
  activeModal: string | null;
  modalData: Record<string, unknown>;

  // Toasts
  toasts: Toast[];

  // Actions
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  toggleSidebar: () => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "system",
      resolvedTheme: "light",
      locale: "ne", // Default to Nepali
      isSidebarOpen: false,
      activeModal: null,
      modalData: {},
      toasts: [],

      // Actions
      setTheme: (theme) => {
        const resolved =
          theme === "system"
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
            : theme;
        set({ theme, resolvedTheme: resolved });
        document.documentElement.classList.toggle("dark", resolved === "dark");
      },

      setLocale: (locale) => set({ locale }),

      toggleLocale: () =>
        set((state) => ({ locale: state.locale === "en" ? "ne" : "en" })),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      openModal: (modalId, data = {}) =>
        set({
          activeModal: modalId,
          modalData: data,
        }),

      closeModal: () =>
        set({
          activeModal: null,
          modalData: {},
        }),

      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newToast = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto-remove after duration
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => get().removeToast(id), duration);
        }
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "shram-sewa-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
      }),
    },
  ),
);
