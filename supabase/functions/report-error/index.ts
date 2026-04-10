// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse(500, {
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
    return jsonResponse(400, { error: "Invalid JSON payload." });
  }

  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";

  if (!message) {
    return jsonResponse(400, { error: "message is required." });
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

  const { data, error } = await admin
    .from("audit_log")
    .insert({
      user_id: callerUser?.id ?? null,
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
    return jsonResponse(500, {
      error: "Failed to persist error report.",
      details: error.message,
      code: error.code,
    });
  }

  return jsonResponse(200, {
    logged: true,
    id: data?.id,
  });
});
