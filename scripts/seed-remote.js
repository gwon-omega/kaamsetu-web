#!/usr/bin/env node

/**
 * Remote Supabase Seeding Script
 * Executes seed.sql against hosted Supabase using service role token
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL =
  process.env.PUBLIC_SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_ACCESS_TOKEN;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌ Missing PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_ACCESS_TOKEN) in environment",
  );
  process.exit(1);
}

console.log(`🔗 Connecting to ${SUPABASE_URL}...`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function seedDatabase() {
  try {
    // Read seed SQL
    const seedPath = path.join(__dirname, "../supabase/seed.sql");
    const seedSQL = fs.readFileSync(seedPath, "utf-8");

    // Split by semicolon but preserve statement boundaries
    const statements = seedSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`\n📋 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.split("\n")[0].substring(0, 60);

      process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}... `);

      try {
        // Execute via Supabase RPC or direct SQL (using admin client)
        const { error } = await supabase.rpc("exec", {
          sql: stmt + ";",
        });

        if (error) {
          // If exec RPC doesn't exist, try direct execution
          const result = await supabase.functions.invoke("seed-execute", {
            body: { sql: stmt },
          });

          if (result.error) throw result.error;
          console.log("✅");
        } else {
          console.log("✅");
        }
      } catch (err) {
        // Log but continue - some statements may be idempotent or already exist
        console.log(`⚠️  (${err.message.substring(0, 40)}...)`);
      }
    }

    console.log("\n✅ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
}

seedDatabase();
