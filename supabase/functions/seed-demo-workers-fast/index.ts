/**
 * Supabase Edge Function: seed-demo-workers-fast
 *
 * Seeds demo workers directly without creating auth users (faster for initial demo)
 * Protected by Service Role Key authentication
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Sample Nepali names
const nepaliFirstNames = [
  "Ram",
  "Sita",
  "Hari",
  "Gita",
  "Arjun",
  "Maya",
  "Ravi",
  "Anjali",
  "Priya",
  "Rohan",
];
const nepaliLastNames = [
  "Bahadur",
  "Sharma",
  "Poudel",
  "Rai",
  "Singh",
  "Thapa",
  "Joshi",
  "Adhikari",
  "Karki",
  "Ghimire",
];

function randomNepaliName() {
  const first =
    nepaliFirstNames[Math.floor(Math.random() * nepaliFirstNames.length)];
  const last =
    nepaliLastNames[Math.floor(Math.random() * nepaliLastNames.length)];
  return `${first} ${last}`;
}

async function seedDemoWorkers(client: any) {
  // Get available job categories and local units
  const { data: jobCategories } = await client
    .from("job_categories")
    .select("id")
    .limit(100);

  const { data: localUnits } = await client
    .from("local_units")
    .select("id, district_id")
    .limit(100);

  const { data: provinces } = await client.from("provinces").select("id");

  if (!jobCategories || !localUnits || !provinces) {
    throw new Error("Missing seed data");
  }

  console.log(`Creating 20 demo workers...`);

  // Create 20 demo users (without auth)
  const { data: users, error: userError } = await client
    .from("users")
    .insert(
      Array.from({ length: 20 }, (_, i) => ({
        full_name: randomNepaliName(),
        phone: `985${String(i).padStart(7, "0")}`,
        role: "worker",
        is_verified: true,
        is_active: true,
      })),
    )
    .select();

  if (userError) {
    console.error("User creation error:", userError);
    throw userError;
  }

  if (!users || users.length === 0) {
    throw new Error("No users created");
  }

  console.log(`Created ${users.length} demo users`);

  // Create worker profiles
  const workerProfiles = users.map((user: any, i: number) => ({
    user_id: user.id,
    job_category_id: jobCategories[i % jobCategories.length].id,
    province_id: provinces[i % provinces.length].id,
    district_id: localUnits[i % localUnits.length].district_id,
    local_unit_id: localUnits[i % localUnits.length].id,
    ward_no: Math.floor(Math.random() * 9) + 1,
    is_available: Math.random() > 0.2,
    is_approved: true,
    experience_yrs: Math.floor(Math.random() * 20),
    daily_rate_npr: 500 + Math.floor(Math.random() * 2000),
    about: `Available for work in ${localUnits[i % localUnits.length].id}`,
  }));

  const { error: profileError } = await client
    .from("worker_profiles")
    .insert(workerProfiles);

  if (profileError) {
    console.error("Worker profile error:", profileError);
    throw profileError;
  }

  console.log(`Created ${workerProfiles.length} worker profiles`);

  // Create 15 demo hirers
  console.log(`Creating 15 demo hirers...`);

  const { data: hirers, error: hirerError } = await client
    .from("users")
    .insert(
      Array.from({ length: 15 }, (_, i) => ({
        full_name: randomNepaliName() + " (Hirer)",
        phone: `984${String(i).padStart(7, "0")}`,
        role: "hirer",
        is_verified: true,
        is_active: true,
      })),
    )
    .select();

  if (hirerError) {
    console.error("Hirer creation error:", hirerError);
    throw hirerError;
  }

  console.log(`Created ${hirers?.length || 0} demo hirers`);

  return {
    workers: users.length,
    hirers: hirers?.length || 0,
  };
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const client = createAdminClient();

    console.log("Starting demo workers seeding...");
    const result = await seedDemoWorkers(client);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Demo workers and hirers seeded",
        seeded: result,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
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
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
