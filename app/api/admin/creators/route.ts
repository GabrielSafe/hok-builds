import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const creators = await query("SELECT * FROM creators ORDER BY name ASC");
  return NextResponse.json(creators);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, creator_type, main_role, avatar_url, description, twitch_url, youtube_url, twitter_url } = await request.json();
  if (!name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 });

  const slug = slugify(name);
  const creator = await queryOne(
    `INSERT INTO creators (name, slug, creator_type, main_role, avatar_url, description, twitch_url, youtube_url, twitter_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [name, slug, creator_type ?? "pro_player", main_role ?? null, avatar_url ?? null, description ?? null, twitch_url ?? null, youtube_url ?? null, twitter_url ?? null]
  );
  return NextResponse.json(creator, { status: 201 });
}
