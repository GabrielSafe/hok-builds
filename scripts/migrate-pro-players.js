const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Creating pro_players table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS pro_players (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        slug        VARCHAR(100) UNIQUE NOT NULL,
        main_role   VARCHAR(50),
        avatar_url  TEXT,
        description TEXT,
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("Adding pro_player_id to builds...");
    await client.query(`
      ALTER TABLE builds
      ADD COLUMN IF NOT EXISTS pro_player_id INT REFERENCES pro_players(id) ON DELETE SET NULL
    `);

    console.log("Creating hero_counters table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS hero_counters (
        id              SERIAL PRIMARY KEY,
        hero_id         INT NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
        counter_hero_id INT NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
        type            VARCHAR(20) NOT NULL,
        UNIQUE(hero_id, counter_hero_id, type)
      )
    `);

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
