const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Adding bio fields to heroes...");
    await client.query(`ALTER TABLE heroes ADD COLUMN IF NOT EXISTS race VARCHAR(100)`);
    await client.query(`ALTER TABLE heroes ADD COLUMN IF NOT EXISTS height VARCHAR(30)`);
    await client.query(`ALTER TABLE heroes ADD COLUMN IF NOT EXISTS fighting_style VARCHAR(100)`);
    await client.query(`ALTER TABLE heroes ADD COLUMN IF NOT EXISTS origin_place VARCHAR(100)`);
    await client.query(`ALTER TABLE heroes ADD COLUMN IF NOT EXISTS faction VARCHAR(100)`);
    await client.query(`ALTER TABLE heroes ADD COLUMN IF NOT EXISTS lore_role VARCHAR(100)`);

    console.log("Adding tags to skills...");
    await client.query(`ALTER TABLE skills ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`);

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
