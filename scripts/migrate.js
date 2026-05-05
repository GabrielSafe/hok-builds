const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const schema = `
-- Roles dos heróis
CREATE TYPE hero_role AS ENUM ('Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support');

-- Heróis
CREATE TABLE IF NOT EXISTS heroes (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  role        hero_role NOT NULL,
  difficulty  SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  description TEXT,
  lore        TEXT,
  icon_url    TEXT,
  splash_url  TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Itens
CREATE TABLE IF NOT EXISTS items (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  image_url   TEXT,
  description TEXT,
  stats       JSONB DEFAULT '{}',
  cost        INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Arcana
CREATE TABLE IF NOT EXISTS arcana (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  tier        SMALLINT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 3),
  image_url   TEXT,
  description TEXT,
  stats       JSONB DEFAULT '{}'
);

-- Feitiços
CREATE TABLE IF NOT EXISTS spells (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  image_url   TEXT,
  description TEXT
);

-- Habilidades dos heróis
CREATE TABLE IF NOT EXISTS skills (
  id          SERIAL PRIMARY KEY,
  hero_id     INTEGER NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  key         VARCHAR(10) NOT NULL,
  image_url   TEXT,
  description TEXT,
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

-- Builds
CREATE TABLE IF NOT EXISTS builds (
  id            SERIAL PRIMARY KEY,
  hero_id       INTEGER NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL DEFAULT 'Build Recomendada',
  description   TEXT,
  patch_version VARCHAR(20),
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Itens da build
CREATE TABLE IF NOT EXISTS build_items (
  id         SERIAL PRIMARY KEY,
  build_id   INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  item_id    INTEGER NOT NULL REFERENCES items(id),
  sort_order SMALLINT NOT NULL DEFAULT 0,
  phase      VARCHAR(20) DEFAULT 'core'
);

-- Arcana da build
CREATE TABLE IF NOT EXISTS build_arcana (
  id         SERIAL PRIMARY KEY,
  build_id   INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  arcana_id  INTEGER NOT NULL REFERENCES arcana(id),
  quantity   SMALLINT NOT NULL DEFAULT 10
);

-- Feitiços da build
CREATE TABLE IF NOT EXISTS build_spells (
  id         SERIAL PRIMARY KEY,
  build_id   INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  spell_id   INTEGER NOT NULL REFERENCES spells(id)
);

-- Ordem de habilidades da build
CREATE TABLE IF NOT EXISTS build_skill_order (
  id         SERIAL PRIMARY KEY,
  build_id   INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  skill_id   INTEGER NOT NULL REFERENCES skills(id),
  sort_order SMALLINT NOT NULL DEFAULT 0
);

-- Estatísticas dos heróis
CREATE TABLE IF NOT EXISTS hero_stats (
  id           SERIAL PRIMARY KEY,
  hero_id      INTEGER NOT NULL REFERENCES heroes(id) ON DELETE CASCADE UNIQUE,
  winrate      DECIMAL(5,2) DEFAULT 0,
  pickrate     DECIMAL(5,2) DEFAULT 0,
  banrate      DECIMAL(5,2) DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  tier         VARCHAR(5) DEFAULT 'B',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Views dos heróis
CREATE TABLE IF NOT EXISTS hero_views (
  id         SERIAL PRIMARY KEY,
  hero_id    INTEGER NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
  ip_hash    VARCHAR(64) NOT NULL,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para evitar spam de views (1 por IP por hora)
CREATE INDEX IF NOT EXISTS idx_hero_views_hero_ip ON hero_views (hero_id, ip_hash, viewed_at);

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- View agregada de views por herói
CREATE OR REPLACE VIEW hero_view_counts AS
SELECT hero_id, COUNT(*) AS total_views
FROM hero_views
GROUP BY hero_id;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER heroes_updated_at
  BEFORE UPDATE ON heroes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER builds_updated_at
  BEFORE UPDATE ON builds FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Running migrations...");
    await client.query(schema);
    console.log("✅ Migration complete.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
