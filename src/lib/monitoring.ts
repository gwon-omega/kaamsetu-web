import {
  monitoringApi,
  type ReportClientErrorInput,
} from "@shram-sewa/shared/api";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

type WebErrorCategory = ReportClientErrorInput["category"];
type WebErrorLevel = ReportClientErrorInput["level"];

interface ReportWebErrorInput {
  category: WebErrorCategory;
  level?: WebErrorLevel;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

function canReportErrors(): boolean {
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

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error.trim();
  }

  return "Unknown error";
}

function normalizeErrorStack(error: unknown): string | undefined {
  if (error instanceof Error && typeof error.stack === "string") {
    return error.stack;
  }

  return undefined;
}

function normalizeContext(
  value: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!value) {
    return {};
  }

  const out: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (
      raw === null ||
      typeof raw === "string" ||
      typeof raw === "number" ||
      typeof raw === "boolean"
    ) {
      out[key] = raw;
      continue;
    }

    try {
      out[key] = JSON.parse(JSON.stringify(raw));
    } catch {
      out[key] = String(raw);
    }
  }

  return out;
}

export async function reportWebError(
  input: ReportWebErrorInput,
): Promise<void> {
  if (!canReportErrors()) {
    return;
  }

  try {
    await monitoringApi.reportClientError({
      source: "web",
      category: input.category,
      level: input.level ?? "error",
      message: input.message,
      stack: input.stack,
      context: normalizeContext(input.context),
    });
  } catch (error) {
    console.warn("Web monitoring dispatch failed:", error);
  }
}

export async function reportWebMutationFailure(
  scope: string,
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  await reportWebError({
    category: "mutation",
    level: "error",
    message: normalizeErrorMessage(error),
    stack: normalizeErrorStack(error),
    context: {
      scope,
      ...(context ?? {}),
    },
  });
}

let listenersBound = false;

export function setupWebGlobalErrorMonitoring(): () => void {
  if (typeof window === "undefined" || listenersBound) {
    return () => undefined;
  }

  const handleWindowError = (event: ErrorEvent) => {
    void reportWebError({
      category: "runtime",
      level: "error",
      message: event.message || "Unhandled window error",
      stack: normalizeErrorStack(event.error),
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    void reportWebError({
      category: "runtime",
      level: "error",
      message: normalizeErrorMessage(event.reason),
      stack: normalizeErrorStack(event.reason),
      context: {
        type: "unhandledrejection",
      },
    });
  };

  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
  listenersBound = true;

  return () => {
    window.removeEventListener("error", handleWindowError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    listenersBound = false;
  };
}
