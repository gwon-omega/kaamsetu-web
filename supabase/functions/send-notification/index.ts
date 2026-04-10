// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type NotificationEvent = "hire_request";

type DispatchRequest = {
  event: NotificationEvent;
  hireId: string;
};

type ExpoTicket = {
  status: "ok" | "error";
  id?: string;
  details?: {
    error?: string;
  };
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
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !callerUser) {
    return jsonResponse(401, { error: "Unauthorized." });
  }

  let payload: DispatchRequest;

  try {
    payload = (await req.json()) as DispatchRequest;
  } catch {
    return jsonResponse(400, { error: "Invalid JSON payload." });
  }

  if (payload.event !== "hire_request" || !payload.hireId) {
    return jsonResponse(400, {
      error: "Payload must include event='hire_request' and hireId.",
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: hireRecord, error: hireError } = await admin
    .from("hire_records")
    .select("id, worker_id, hirer_id, status")
    .eq("id", payload.hireId)
    .single();

  if (hireError || !hireRecord) {
    return jsonResponse(404, { error: "Hire record not found." });
  }

  if (hireRecord.hirer_id !== callerUser.id) {
    return jsonResponse(403, { error: "Forbidden." });
  }

  const { data: workerProfile, error: workerError } = await admin
    .from("worker_profiles")
    .select("user_id")
    .eq("id", hireRecord.worker_id)
    .single();

  if (workerError || !workerProfile) {
    return jsonResponse(404, { error: "Worker profile not found." });
  }

  const { data: hirerProfile } = await admin
    .from("users")
    .select("full_name")
    .eq("id", callerUser.id)
    .single();

  const hirerName =
    hirerProfile?.full_name && hirerProfile.full_name.trim().length > 0
      ? hirerProfile.full_name.trim()
      : "A hirer";

  const title = "New Hire Request";
  const body = `${hirerName} sent you a hire request.`;

  const { data: insertedNotification, error: notificationError } = await admin
    .from("notifications")
    .insert({
      user_id: workerProfile.user_id,
      hire_id: hireRecord.id,
      type: "hire_request",
      title,
      title_np: "नयाँ काम अनुरोध",
      body,
      body_np: `${hirerName} ले तपाईंलाई काम अनुरोध पठाउनुभयो।`,
      is_read: false,
      push_sent: false,
    })
    .select("id")
    .single();

  if (notificationError || !insertedNotification) {
    return jsonResponse(500, {
      error: "Failed to create notification record.",
    });
  }

  const { data: activeTokens, error: tokensError } = await admin
    .from("push_tokens")
    .select("token")
    .eq("user_id", workerProfile.user_id)
    .eq("is_active", true);

  if (tokensError) {
    return jsonResponse(500, { error: "Failed to read push tokens." });
  }

  const tokens = (activeTokens ?? [])
    .map((entry) => entry.token)
    .filter(
      (token): token is string => typeof token === "string" && token.length > 0,
    );

  if (tokens.length === 0) {
    return jsonResponse(200, {
      notificationId: insertedNotification.id,
      workerUserId: workerProfile.user_id,
      sentCount: 0,
      invalidTokenCount: 0,
    });
  }

  const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");

  const expoMessages = tokens.map((token) => ({
    to: token,
    title,
    body,
    sound: "default",
    priority: "high",
    channelId: "hire_urgent",
    ttl: 120,
    data: {
      type: "hire_request",
      hireId: hireRecord.id,
      notificationId: insertedNotification.id,
    },
  }));

  const expoHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (expoAccessToken) {
    expoHeaders.Authorization = `Bearer ${expoAccessToken}`;
  }

  const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: expoHeaders,
    body: JSON.stringify(expoMessages),
  });

  if (!expoResponse.ok) {
    return jsonResponse(502, {
      error: "Expo push API returned an error.",
      status: expoResponse.status,
    });
  }

  const expoPayload = (await expoResponse.json()) as {
    data?: ExpoTicket[];
  };

  const tickets = Array.isArray(expoPayload.data) ? expoPayload.data : [];

  let sentCount = 0;
  const invalidTokens: string[] = [];

  tickets.forEach((ticket, index) => {
    if (ticket.status === "ok") {
      sentCount += 1;
      return;
    }

    if (ticket.details?.error === "DeviceNotRegistered") {
      const token = tokens[index];
      if (token) {
        invalidTokens.push(token);
      }
    }
  });

  if (invalidTokens.length > 0) {
    await admin
      .from("push_tokens")
      .update({ is_active: false })
      .eq("user_id", workerProfile.user_id)
      .in("token", invalidTokens);
  }

  await admin
    .from("notifications")
    .update({
      push_sent: sentCount > 0,
      push_token: tokens[0] ?? null,
    })
    .eq("id", insertedNotification.id);

  return jsonResponse(200, {
    notificationId: insertedNotification.id,
    workerUserId: workerProfile.user_id,
    sentCount,
    invalidTokenCount: invalidTokens.length,
  });
});
