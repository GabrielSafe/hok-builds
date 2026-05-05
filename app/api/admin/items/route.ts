import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await query("SELECT * FROM items ORDER BY name ASC");
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, image_url, description, cost } = await request.json();
  if (!name) return NextResponse.json({ error: "name obrigatório" }, { status: 400 });

  const slug = slugify(name);
  const item = await queryOne(
    `INSERT INTO items (name, slug, image_url, description, cost)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE SET name=$1, image_url=$3, description=$4, cost=$5
     RETURNING *`,
    [name, slug, image_url ?? null, description ?? null, cost ?? 0]
  );
  return NextResponse.json(item, { status: 201 });
}
