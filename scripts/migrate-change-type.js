const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Adding change_type column to heroes...");
    await client.query(
      `ALTER TABLE heroes ADD COLUMN IF NOT EXISTS change_type VARCHAR(20) DEFAULT NULL`
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
