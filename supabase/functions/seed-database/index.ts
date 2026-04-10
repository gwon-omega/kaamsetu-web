/**
 * Supabase Edge Function: seed-database
 *
 * Executes database seeding operations
 * Protected by Service Role Key authentication
 *
 * Usage:
 * curl -X POST https://PROJECT.functions.supabase.co/seed-database \
 *   -H "Authorization: Bearer SERVICE_ROLE_KEY" \
 *   -H "Content-Type: application/json" \
 *   -d '{"action":"seed"}'
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

async function seedProvinces(client: any) {
  const provinces = [
    {
      id: 1,
      name_en: "Koshi Pradesh",
      name_np: "कोशी प्रदेश",
      color_hex: "#FF6B6B",
    },
    {
      id: 2,
      name_en: "Madhesh Pradesh",
      name_np: "मधेश प्रदेश",
      color_hex: "#4ECDC4",
    },
    {
      id: 3,
      name_en: "Bagmati Pradesh",
      name_np: "बागमती प्रदेश",
      color_hex: "#45B7D1",
    },
    {
      id: 4,
      name_en: "Gandaki Pradesh",
      name_np: "गण्डकी प्रदेश",
      color_hex: "#96CEB4",
    },
    {
      id: 5,
      name_en: "Lumbini Pradesh",
      name_np: "लुम्बिनी प्रदेश",
      color_hex: "#FFEAA7",
    },
    {
      id: 6,
      name_en: "Karnali Pradesh",
      name_np: "कर्णाली प्रदेश",
      color_hex: "#DDA0DD",
    },
    {
      id: 7,
      name_en: "Sudurpashchim Pradesh",
      name_np: "सुदूरपश्चिम प्रदेश",
      color_hex: "#F0E68C",
    },
  ];

  const { error } = await client
    .from("provinces")
    .upsert(provinces, { onConflict: "id" });

  if (error) throw new Error(`Province seeding failed: ${error.message}`);

  return provinces.length;
}

async function seedJobCategories(client: any) {
  const categories = [
    {
      slug: "gardener",
      name_en: "Gardener",
      name_np: "बागवान",
      icon: "🌱",
      description: "Garden maintenance and landscaping",
    },
    {
      slug: "mason",
      name_en: "Mason",
      name_np: "मिस्त्री",
      icon: "🧱",
      description: "Construction and masonry work",
    },
    {
      slug: "carpenter",
      name_en: "Carpenter",
      name_np: "बढई",
      icon: "🔨",
      description: "Carpentry and woodwork",
    },
    {
      slug: "plumber",
      name_en: "Plumber",
      name_np: "नल-जल कामदार",
      icon: "🔧",
      description: "Plumbing services",
    },
    {
      slug: "electrician",
      name_en: "Electrician",
      name_np: "विद्युत्कामदार",
      icon: "⚡",
      description: "Electrical installation and repair",
    },
    {
      slug: "laborer",
      name_en: "General Laborer",
      name_np: "सामान्य श्रमिक",
      icon: "💪",
      description: "General labor and construction",
    },
  ];

  const { error } = await client
    .from("job_categories")
    .upsert(categories, { onConflict: "slug" });

  if (error) throw new Error(`Job category seeding failed: ${error.message}`);

  return categories.length;
}

async function seedAdminAccount(client: any) {
  // Create admin user via auth
  const { data: admin, error: authError } = await client.auth.admin.createUser({
    email: "admin@shramsewa.com.np",
    password: "projectsewa",
    email_confirm: true,
    user_metadata: {
      full_name: "Admin",
      role: "admin",
    },
  });

  if (authError && !authError.message.includes("duplicate key"))
    throw new Error(`Admin user creation failed: ${authError.message}`);

  if (admin?.user) {
    // Ensure user profile
    const { error: profileError } = await client.from("public.users").upsert(
      {
        id: admin.user.id,
        full_name: "Admin",
        role: "admin",
        is_verified: true,
        is_active: true,
      },
      { onConflict: "id" },
    );

    if (profileError)
      console.warn("Admin profile update warning:", profileError.message);
  }

  return 1;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
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

    // Seed operations
    console.log("Starting database seeding...");

    let totalSeeded = 0;

    // Seed provinces
    const provinceCount = await seedProvinces(client);
    totalSeeded += provinceCount;
    console.log(`✓ Seeded ${provinceCount} provinces`);

    // Seed job categories
    const categoryCount = await seedJobCategories(client);
    totalSeeded += categoryCount;
    console.log(`✓ Seeded ${categoryCount} job categories`);

    // Seed admin account
    const adminCount = await seedAdminAccount(client);
    totalSeeded += adminCount;
    console.log(`✓ Created admin account`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Database seeding completed",
        seeded: {
          provinces: provinceCount,
          job_categories: categoryCount,
          admin_account: adminCount,
        },
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
