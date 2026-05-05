/**
 * Cria o primeiro usuário admin.
 * Uso: node scripts/create-admin.js email@exemplo.com suaSenha NomeSeu
 */
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.error("Uso: node scripts/create-admin.js EMAIL SENHA [NOME]");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const hash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO admins (email, password_hash, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2",
      [email, hash, name ?? "Admin"]
    );
    console.log(`✅ Admin criado/atualizado: ${email}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
