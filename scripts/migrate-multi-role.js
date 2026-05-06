require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Step 1: Adding Jungle to hero_role enum...");
    await client.query("ALTER TYPE hero_role ADD VALUE IF NOT EXISTS 'Jungle'");

    console.log("Step 2: Converting role column to text[]...");
    await client.query(
      `ALTER TABLE heroes ALTER COLUMN role TYPE text[] USING ARRAY[role::text]`
    );

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
