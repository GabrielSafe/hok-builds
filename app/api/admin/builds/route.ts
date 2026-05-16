import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const builds = await query(
    `SELECT b.*, h.name AS hero_name, c.name AS creator_name
     FROM builds b
     JOIN heroes h ON h.id = b.hero_id
     LEFT JOIN creators c ON c.id = b.creator_id
     ORDER BY h.name ASC, b.is_recommended DESC`
  );
  return NextResponse.json(builds);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { hero_id, title, description, patch_version, is_recommended, creator_id } = await request.json();

  if (!hero_id) return NextResponse.json({ error: "hero_id obrigatório" }, { status: 400 });

  if (is_recommended && !creator_id) {
    await queryOne("UPDATE builds SET is_recommended = false WHERE hero_id = $1 AND creator_id IS NULL", [hero_id]);
  }

  const build = await queryOne(
    `INSERT INTO builds (hero_id, title, description, patch_version, is_recommended, creator_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [hero_id, title ?? "Build Recomendada", description, patch_version, is_recommended ?? false, creator_id ?? null]
  );

  return NextResponse.json(build, { status: 201 });
}
