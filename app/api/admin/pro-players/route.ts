import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const players = await query("SELECT * FROM pro_players ORDER BY name ASC");
  return NextResponse.json(players);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, main_role, avatar_url, description } = await request.json();
  if (!name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 });

  const slug = slugify(name);
  const player = await queryOne(
    `INSERT INTO pro_players (name, slug, main_role, avatar_url, description)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, slug, main_role ?? null, avatar_url ?? null, description ?? null]
  );
  return NextResponse.json(player, { status: 201 });
}
