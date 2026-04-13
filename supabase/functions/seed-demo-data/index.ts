/**
 * Supabase Edge Function: seed-demo-data
 *
 * Seeds 100 demo hirers and 100 demo workers across all provinces
 * Protected by Service Role Key authentication
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { faker } from "https://esm.sh/@faker-js/faker@8.4.1";

const baseCorsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
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

const createAdminClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
};

async function seedDemoData(client: any) {
  const demoPassword = Deno.env.get("DEMO_SEED_PASSWORD");
  if (!demoPassword || demoPassword.length < 12) {
    throw new Error("DEMO_SEED_PASSWORD must be configured and at least 12 chars.");
  }

  // Get provinces and local units for distribution
  const { data: provinces } = await client
    .from("provinces")
    .select("id")
    .limit(100);

  const { data: localUnits } = await client
    .from("local_units")
    .select("id, district_id")
    .limit(100);

  const { data: jobCategories } = await client
    .from("job_categories")
    .select("id")
    .limit(100);

  if (!provinces || !localUnits || !jobCategories) {
    throw new Error(
      "Missing seed data (provinces, local_units, or categories)",
    );
  }

  const provinceIds = provinces.map((p: any) => p.id);
  const jobCategoryIds = jobCategories.map((j: any) => j.id);

  console.log(`Creating 100 demo hirers...`);

  // Create 100 hirers
  const hirers = [];
  for (let i = 0; i < 100; i++) {
    const email = `hirer${i + 1}@shramsewa.com.np`;

    // Create auth user
    const { data: user, error: userError } = await client.auth.admin.createUser(
      {
        email,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          full_name: faker.person.fullName(),
        },
      },
    );

    if (userError && !userError.message.includes("duplicate key")) {
      console.warn(`Hirer ${i + 1} creation failed:`, userError.message);
      continue;
    }

    if (user?.user) {
      // Create user profile
      await client.from("public.users").upsert(
        {
          id: user.user.id,
          phone: `984${String(i).padStart(7, "0")}`,
          full_name: faker.person.fullName(),
          role: "hirer",
          is_verified: true,
          is_active: true,
        },
        { onConflict: "id" },
      );

      hirers.push(user.user.id);
    }
  }

  console.log(`Created ${hirers.length} hirers`);
  console.log(`Creating 100 demo workers...`);

  // Create 100 workers
  let workerCount = 0;
  for (let i = 0; i < 100; i++) {
    const email = `worker${i + 1}@shramsewa.com.np`;
    const provinceId = provinceIds[i % provinceIds.length];
    const localUnit = localUnits[i % localUnits.length];
    const jobCategoryId = jobCategoryIds[i % jobCategoryIds.length];

    // Create auth user
    const { data: user, error: userError } = await client.auth.admin.createUser(
      {
        email,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          full_name: faker.person.fullName(),
        },
      },
    );

    if (userError && !userError.message.includes("duplicate key")) {
      console.warn(`Worker ${i + 1} creation failed:`, userError.message);
      continue;
    }

    if (user?.user) {
      // Create user profile
      const { data: userProfile } = await client
        .from("public.users")
        .upsert(
          {
            id: user.user.id,
            phone: `985${String(i).padStart(7, "0")}`,
            full_name: faker.person.fullName(),
            role: "worker",
            is_verified: true,
            is_active: true,
          },
          { onConflict: "id" },
        )
        .select()
        .single();

      if (userProfile) {
        // Create worker profile
        await client.from("worker_profiles").insert({
          user_id: user.user.id,
          job_category_id: jobCategoryId,
          province_id: provinceId,
          district_id: localUnit.district_id,
          local_unit_id: localUnit.id,
          ward_no: Math.floor(Math.random() * 9) + 1,
          is_available: Math.random() > 0.2, // 80% available
          is_approved: true,
          experience_yrs: Math.floor(Math.random() * 20),
          daily_rate_npr: 500 + Math.floor(Math.random() * 2000),
          about: faker.lorem.sentence(),
        });

        workerCount++;
      }
    }
  }

  console.log(`Created ${workerCount} workers`);

  return {
    hirers: hirers.length,
    workers: workerCount,
  };
}

Deno.serve(async (req) => {
  if (isBlockedByCors(req)) {
    return new Response("Origin not allowed", {
      status: 403,
      headers: withCorsHeaders(req),
    });
  }

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: withCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: {
        ...withCorsHeaders(req),
        "Content-Type": "application/json",
      },
    });
  }

  try {
    if (Deno.env.get("ALLOW_DEMO_SEEDING") !== "true") {
      return new Response(
        JSON.stringify({ error: "Demo seeding is disabled in this environment." }),
        {
          status: 403,
          headers: {
            ...withCorsHeaders(req),
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!authHeader || !serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization" }),
        {
          status: 401,
          headers: {
            ...withCorsHeaders(req),
            "Content-Type": "application/json",
          },
        },
      );
    }

    const client = createAdminClient();

    console.log("Starting demo data seeding...");
    const result = await seedDemoData(client);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo data seeding completed",
        seeded: result,
      }),
      {
        status: 200,
        headers: {
          ...withCorsHeaders(req),
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Seeding error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...withCorsHeaders(req),
          "Content-Type": "application/json",
        },
      },
    );
  }
});
