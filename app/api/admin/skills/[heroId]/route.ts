import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ heroId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { heroId } = await params;
  const skills = await query("SELECT * FROM skills WHERE hero_id=$1 ORDER BY sort_order ASC", [heroId]);
  return NextResponse.json(skills);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ heroId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { heroId } = await params;
  const { name, key, description, image_url, sort_order } = await request.json();

  const skill = await queryOne(
    `INSERT INTO skills (hero_id, name, key, description, image_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [heroId, name, key, description ?? null, image_url ?? null, sort_order ?? 0]
  );
  return NextResponse.json(skill, { status: 201 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ heroId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { heroId } = await params;
  const { id, name, key, description, image_url } = await request.json();

  const skill = await queryOne(
    "UPDATE skills SET name=$1, key=$2, description=$3, image_url=$4 WHERE id=$5 AND hero_id=$6 RETURNING *",
    [name, key, description, image_url, id, heroId]
  );
  return NextResponse.json(skill);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ heroId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { heroId } = await params;
  const { id } = await request.json();
  await query("DELETE FROM skills WHERE id=$1 AND hero_id=$2", [id, heroId]);
  return NextResponse.json({ success: true });
}
