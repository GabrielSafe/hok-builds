import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const arcana = await query("SELECT * FROM arcana ORDER BY tier ASC, name ASC");
  return NextResponse.json(arcana);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, tier, image_url, description } = await request.json();
  if (!name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 });

  const slug = slugify(name);
  const arcana = await queryOne(
    `INSERT INTO arcana (name, slug, tier, image_url, description)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE SET name=$1, tier=$3, image_url=$4, description=$5
     RETURNING *`,
    [name, slug, tier ?? 1, image_url ?? null, description ?? null]
  );
  return NextResponse.json(arcana, { status: 201 });
}
