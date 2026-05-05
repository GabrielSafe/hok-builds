import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { hero_id, title, description, patch_version, is_recommended } = await request.json();

  if (!hero_id) {
    return NextResponse.json({ error: "hero_id obrigatório" }, { status: 400 });
  }

  if (is_recommended) {
    await queryOne(
      "UPDATE builds SET is_recommended = false WHERE hero_id = $1",
      [hero_id]
    );
  }

  const build = await queryOne(
    `INSERT INTO builds (hero_id, title, description, patch_version, is_recommended)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [hero_id, title ?? "Build Recomendada", description, patch_version, is_recommended ?? false]
  );

  return NextResponse.json(build, { status: 201 });
}
