// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const baseCorsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

type HireWorkerRequest = {
  workerId?: string;
  ipFingerprint?: string;
  workDescription?: string;
  agreedRateNpr?: number;
  workDate?: string;
  workDurationDays?: number;
  hireProvinceId?: number;
  hireDistrictId?: number;
  hireLocalUnitId?: number;
};

function jsonResponse(req: Request, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...withCorsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

function isLikelyIpAddress(value: string): boolean {
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(value) || ipv6.test(value);
}

function extractClientIp(req: Request): string | null {
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && isLikelyIpAddress(cfIp)) {
    return cfIp;
  }

  const forwardedFor = req.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const candidates = [forwardedFor, req.headers.get("x-real-ip")];

  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && isLikelyIpAddress(ip)) {
      return ip;
    }
  }

  return null;
}

function asOptionalInteger(
  value: unknown,
  min?: number,
  max?: number,
): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  if (typeof min === "number" && value < min) {
    return null;
  }

  if (typeof max === "number" && value > max) {
    return null;
  }

  return value;
}

function normalizeWorkDate(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const trimmed = value.trim();
  const yyyyMmDd = /^\d{4}-\d{2}-\d{2}$/;
  if (yyyyMmDd.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
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
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !callerUser) {
    return jsonResponse(req, 401, { error: "Unauthorized." });
  }

  let payload: HireWorkerRequest;

  try {
    payload = (await req.json()) as HireWorkerRequest;
  } catch {
    return jsonResponse(req, 400, { error: "Invalid JSON payload." });
  }

  if (!payload.workerId || typeof payload.workerId !== "string") {
    return jsonResponse(req, 400, { error: "workerId is required." });
  }

  const resolvedIp = extractClientIp(req);
  if (!resolvedIp) {
    return jsonResponse(req, 428, {
      error: "Unable to resolve client IP from request headers.",
    });
  }

  const workDurationDays =
    asOptionalInteger(payload.workDurationDays, 1, 365) ?? 1;
  const agreedRateNpr = asOptionalInteger(payload.agreedRateNpr, 500);
  const hireProvinceId = asOptionalInteger(payload.hireProvinceId, 1);
  const hireDistrictId = asOptionalInteger(payload.hireDistrictId, 1);
  const hireLocalUnitId = asOptionalInteger(payload.hireLocalUnitId, 1);
  const workDate = normalizeWorkDate(payload.workDate);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: workerProfile, error: workerError } = await admin
    .from("worker_profiles")
    .select("id")
    .eq("id", payload.workerId)
    .single();

  if (workerError || !workerProfile) {
    return jsonResponse(req, 404, { error: "Worker profile not found." });
  }

  const insertPayload = {
    worker_id: payload.workerId,
    hirer_id: callerUser.id,
    hirer_ip: resolvedIp,
    ip_fingerprint:
      typeof payload.ipFingerprint === "string" &&
      payload.ipFingerprint.length > 0
        ? payload.ipFingerprint
        : null,
    status: "pending",
    work_description:
      typeof payload.workDescription === "string" &&
      payload.workDescription.trim().length > 0
        ? payload.workDescription.trim()
        : null,
    agreed_rate_npr: agreedRateNpr,
    work_date: workDate,
    work_duration_days: workDurationDays,
    hire_province_id: hireProvinceId,
    hire_district_id: hireDistrictId,
    hire_local_unit_id: hireLocalUnitId,
  };

  const { data: hireRecord, error: insertError } = await admin
    .from("hire_records")
    .insert(insertPayload)
    .select("*")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return jsonResponse(req, 409, {
        error:
          "A non-cancelled hire request from this location already exists for this worker.",
      });
    }

    return jsonResponse(req, 500, {
      error: "Failed to create hire record.",
      details: insertError.message,
      code: insertError.code,
    });
  }

  return jsonResponse(req, 200, {
    hireRecord,
    resolvedIp,
  });
});
