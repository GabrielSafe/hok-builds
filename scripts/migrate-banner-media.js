const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Creating banner_media table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS banner_media (
        id         SERIAL PRIMARY KEY,
        url        TEXT NOT NULL,
        type       VARCHAR(10) NOT NULL,
        title      VARCHAR(100),
        sort_order INT DEFAULT 0,
        is_active  BOOLEAN DEFAULT true,
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
