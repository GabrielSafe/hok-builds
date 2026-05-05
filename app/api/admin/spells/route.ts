import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const spells = await query("SELECT * FROM spells ORDER BY name ASC");
  return NextResponse.json(spells);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, image_url, description } = await request.json();
  if (!name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 });

  const slug = slugify(name);
  const spell = await queryOne(
    `INSERT INTO spells (name, slug, image_url, description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (slug) DO UPDATE SET name=$1, image_url=$3, description=$4
     RETURNING *`,
    [name, slug, image_url ?? null, description ?? null]
  );
  return NextResponse.json(spell, { status: 201 });
}
