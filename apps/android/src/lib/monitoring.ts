import { monitoringApi } from "@shram-sewa/shared/api";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

type AndroidErrorCategory =
  | "runtime"
  | "mutation"
  | "query"
  | "auth"
  | "network"
  | "notification"
  | "unknown";

type AndroidErrorLevel = "error" | "warning" | "info";

type GlobalErrorHandler = (error: unknown, isFatal?: boolean) => void;

interface ReportAndroidErrorInput {
  category: AndroidErrorCategory;
  level?: AndroidErrorLevel;
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

export async function reportAndroidError(
  input: ReportAndroidErrorInput,
): Promise<void> {
  if (!canReportErrors()) {
    return;
  }

  try {
    await monitoringApi.reportClientError({
      source: "android",
      category: input.category,
      level: input.level ?? "error",
      message: input.message,
      stack: input.stack,
      context: normalizeContext(input.context),
    });
  } catch (error) {
    console.warn("Android monitoring dispatch failed:", error);
  }
}

export async function reportAndroidMutationFailure(
  scope: string,
  error: unknown,
  context?: Record<string, unknown>,
): Promise<void> {
  await reportAndroidError({
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

let globalHandlerBound = false;
let previousGlobalHandler: GlobalErrorHandler | null = null;

export function setupAndroidGlobalErrorMonitoring(): void {
  if (globalHandlerBound) {
    return;
  }

  const errorUtils = (
    globalThis as {
      ErrorUtils?: {
        getGlobalHandler?: () => GlobalErrorHandler;
        setGlobalHandler?: (handler: GlobalErrorHandler) => void;
      };
    }
  ).ErrorUtils;

  if (!errorUtils?.getGlobalHandler || !errorUtils?.setGlobalHandler) {
    return;
  }

  previousGlobalHandler = errorUtils.getGlobalHandler();

  errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    void reportAndroidError({
      category: "runtime",
      level: "error",
      message: normalizeErrorMessage(error),
      stack: normalizeErrorStack(error),
      context: {
        isFatal: Boolean(isFatal),
      },
    });

    if (previousGlobalHandler) {
      previousGlobalHandler(error, isFatal);
    }
  });

  globalHandlerBound = true;
}
