import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await query(`
    CREATE TABLE IF NOT EXISTS arcana_attributes (
      id SERIAL PRIMARY KEY,
      arcana_id INTEGER NOT NULL REFERENCES arcana(id) ON DELETE CASCADE,
      stat_name VARCHAR(100) NOT NULL,
      value DECIMAL(10,4) NOT NULL,
      is_percent BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  return NextResponse.json({ success: true, message: "Tabela arcana_attributes criada" });
}
