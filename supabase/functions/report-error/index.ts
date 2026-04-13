// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const baseCorsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const sensitiveKeyPattern =
  /(token|password|secret|authorization|cookie|api[-_]?key)/i;
const maxReportsPerMinute = 30;

function getAllowedOrigins(): string[] {
  const configured = Deno.env.get("CORS_ALLOWED_ORIGINS") ?? "";
  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

function resolveCorsOrigin(req: Request): string {
  const origin = req.headers.get("origin")?.trim();
  if (!origin) {
    return "*";
  }

  const allowedOrigins = getAllowedOrigins();
  if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) {
    return "*";
  }

  return allowedOrigins.includes(origin) ? origin : "null";
}

function withCorsHeaders(
  req: Request,
  headers: Record<string, string> = {},
): Record<string, string> {
  return {
    ...baseCorsHeaders,
    ...headers,
    "Access-Control-Allow-Origin": resolveCorsOrigin(req),
    Vary: "Origin",
  };
}

function isBlockedByCors(req: Request): boolean {
  const origin = req.headers.get("origin")?.trim();
  return Boolean(origin) && resolveCorsOrigin(req) === "null";
}

type ReportRequest = {
  source?: "web" | "android" | "shared" | "edge";
  category?:
    | "runtime"
    | "mutation"
    | "query"
    | "auth"
    | "network"
    | "notification"
    | "unknown";
  level?: "error" | "warning" | "info";
  message?: string;
  stack?: string;
  context?: Record<string, unknown>;
};

function jsonResponse(
  req: Request,
  status: number,
  body: Record<string, unknown>,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...withCorsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function sanitizeContext(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) {
    return {};
  }

  const out: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (sensitiveKeyPattern.test(key)) {
      out[key] = "[REDACTED]";
      continue;
    }

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

function isLikelyIpAddress(value: string): boolean {
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(value) || ipv6.test(value);
}

function extractClientIp(req: Request): string | null {
  const forwardedFor = req.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const candidates = [
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-real-ip"),
    req.headers.get("x-client-ip"),
    forwardedFor,
  ];

  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && isLikelyIpAddress(ip)) {
      return ip;
    }
  }

  return null;
}

Deno.serve(async (req) => {
  if (isBlockedByCors(req)) {
    return new Response("Origin not allowed", {
      status: 403,
      headers: withCorsHeaders(req),
    });
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: withCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, 405, { error: "Method not allowed." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(req, 500, {
      error:
        "Missing SUPABASE_URL, SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY.",
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user: callerUser },
  } = await callerClient.auth.getUser();

  let payload: ReportRequest;

  try {
    payload = (await req.json()) as ReportRequest;
  } catch {
    return jsonResponse(req, 400, { error: "Invalid JSON payload." });
  }

  if (!callerUser) {
    return jsonResponse(req, 401, { error: "Unauthorized." });
  }

  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";

  if (!message) {
    return jsonResponse(req, 400, { error: "message is required." });
  }

  const level =
    payload.level === "warning" || payload.level === "info"
      ? payload.level
      : "error";

  const source =
    payload.source === "web" ||
    payload.source === "android" ||
    payload.source === "shared" ||
    payload.source === "edge"
      ? payload.source
      : "shared";

  const category =
    payload.category === "runtime" ||
    payload.category === "mutation" ||
    payload.category === "query" ||
    payload.category === "auth" ||
    payload.category === "network" ||
    payload.category === "notification" ||
    payload.category === "unknown"
      ? payload.category
      : "unknown";

  const ipAddress = extractClientIp(req);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const telemetryPayload = {
    source,
    category,
    level,
    message: truncate(message, 800),
    stack:
      typeof payload.stack === "string" && payload.stack.length > 0
        ? truncate(payload.stack, 8000)
        : null,
    context: sanitizeContext(payload.context),
    reported_at: new Date().toISOString(),
  };

  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  let recentQuery = admin
    .from("audit_log")
    .select("id", { count: "exact", head: true })
    .eq("table_name", "client_error_events")
    .eq("user_id", callerUser.id)
    .gte("created_at", oneMinuteAgo);

  if (ipAddress) {
    recentQuery = recentQuery.eq("ip_address", ipAddress);
  }

  const { count: recentCount, error: rateLimitError } = await recentQuery;
  if (rateLimitError) {
    return jsonResponse(req, 500, {
      error: "Failed to evaluate rate limit.",
      details: rateLimitError.message,
      code: rateLimitError.code,
    });
  }

  if ((recentCount ?? 0) >= maxReportsPerMinute) {
    return jsonResponse(req, 429, {
      error: "Too many reports. Please retry in one minute.",
    });
  }

  const { data, error } = await admin
    .from("audit_log")
    .insert({
      user_id: callerUser.id,
      action: `client_${level}:${category}`,
      table_name: "client_error_events",
      record_id: source,
      old_values: null,
      new_values: telemetryPayload,
      ip_address: ipAddress,
    })
    .select("id")
    .single();

  if (error) {
    return jsonResponse(req, 500, {
      error: "Failed to persist error report.",
      details: error.message,
      code: error.code,
    });
  }

  return jsonResponse(req, 200, {
    logged: true,
    id: data?.id,
  });
});
