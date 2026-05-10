const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Adding pro_player_id to hero_counters...");
    await client.query(`
      ALTER TABLE hero_counters
      ADD COLUMN IF NOT EXISTS pro_player_id INT REFERENCES pro_players(id) ON DELETE CASCADE
    `);

    console.log("Dropping old unique constraint...");
    await client.query(`
      ALTER TABLE hero_counters
      DROP CONSTRAINT IF EXISTS hero_counters_hero_id_counter_hero_id_type_key
    `);

    console.log("Creating new partial unique indexes...");
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS hero_counters_default_unique
      ON hero_counters (hero_id, counter_hero_id, type)
      WHERE pro_player_id IS NULL
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS hero_counters_player_unique
      ON hero_counters (hero_id, counter_hero_id, type, pro_player_id)
      WHERE pro_player_id IS NOT NULL
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
