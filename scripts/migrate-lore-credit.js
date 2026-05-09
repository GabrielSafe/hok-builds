const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Adding lore_credit to heroes...");
    await client.query(`ALTER TABLE heroes ADD COLUMN IF NOT EXISTS lore_credit VARCHAR(200)`);
    console.log("Migration completed!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
