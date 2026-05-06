const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Adding change_type to items...");
    await client.query(`ALTER TABLE items ADD COLUMN IF NOT EXISTS change_type VARCHAR(20) DEFAULT NULL`);

    console.log("Adding change_type to spells...");
    await client.query(`ALTER TABLE spells ADD COLUMN IF NOT EXISTS change_type VARCHAR(20) DEFAULT NULL`);

    console.log("Adding change_type to arcana...");
    await client.query(`ALTER TABLE arcana ADD COLUMN IF NOT EXISTS change_type VARCHAR(20) DEFAULT NULL`);

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
