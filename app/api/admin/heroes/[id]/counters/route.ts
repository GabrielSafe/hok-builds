import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const counters = await query(
    `SELECT hc.*, h.name AS counter_hero_name, h.slug AS counter_hero_slug, h.icon_url AS counter_hero_icon
     FROM hero_counters hc
     JOIN heroes h ON h.id = hc.counter_hero_id
     WHERE hc.hero_id = $1
     ORDER BY hc.creator_id NULLS FIRST`,
    [id]
  );
  return NextResponse.json(counters);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { counter_hero_id, type, creator_id } = await request.json();

  const counter = await queryOne(
    `INSERT INTO hero_counters (hero_id, counter_hero_id, type, creator_id)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [id, counter_hero_id, type, creator_id ?? null]
  );
  return NextResponse.json(counter, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { counter_id } = await request.json();
  await query("DELETE FROM hero_counters WHERE id=$1 AND hero_id=$2", [counter_id, id]);
  return NextResponse.json({ success: true });
}
