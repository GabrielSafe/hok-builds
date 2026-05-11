const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Creating coach_keys table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS coach_keys (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        key_value  VARCHAR(64) UNIQUE NOT NULL,
        is_active  BOOLEAN DEFAULT true,
        last_used  TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
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
