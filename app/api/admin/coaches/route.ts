import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) key += "-";
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key; // ex: ABCD-EFGH-IJKL
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const coaches = await query("SELECT * FROM coach_keys ORDER BY created_at DESC");
  return NextResponse.json(coaches);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 });

  const key_value = generateKey();
  const coach = await queryOne(
    `INSERT INTO coach_keys (name, key_value) VALUES ($1, $2) RETURNING *`,
    [name, key_value]
  );
  return NextResponse.json(coach, { status: 201 });
}
