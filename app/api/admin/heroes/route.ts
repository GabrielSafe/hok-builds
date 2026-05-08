import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function GET() {
  try {
    await requireAuth();
    const heroes = await query(
      "SELECT * FROM heroes ORDER BY name ASC"
    );
    return NextResponse.json(heroes);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { name, role, difficulty, description, lore, icon_url, splash_url, is_published, is_featured,
            race, height, fighting_style, origin_place, faction, lore_role } = body;

    if (!name || !role || !Array.isArray(role) || role.length === 0) {
      return NextResponse.json({ error: "name e role obrigatórios" }, { status: 400 });
    }

    const slug = slugify(name);

    if (is_featured) {
      await queryOne("UPDATE heroes SET is_featured = false WHERE is_featured = true", []);
    }

    const hero = await queryOne(
      `INSERT INTO heroes (name, slug, role, difficulty, description, lore, icon_url, splash_url, is_published, is_featured,
                           race, height, fighting_style, origin_place, faction, lore_role)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [name, slug, role, difficulty ?? 1, description, lore, icon_url, splash_url, is_published ?? false, is_featured ?? false,
       race ?? null, height ?? null, fighting_style ?? null, origin_place ?? null, faction ?? null, lore_role ?? null]
    );

    await query(
      "INSERT INTO hero_stats (hero_id) VALUES ($1) ON CONFLICT (hero_id) DO NOTHING",
      [(hero as { id: number }).id]
    );

    return NextResponse.json(hero, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
