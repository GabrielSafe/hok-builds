import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const attrs = await query(
    "SELECT * FROM arcana_attributes WHERE arcana_id=$1 ORDER BY id ASC",
    [id]
  );
  return NextResponse.json(attrs);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { stat_name, value, is_percent } = await request.json();
  if (!stat_name || value === undefined) {
    return NextResponse.json({ error: "stat_name e value são obrigatórios" }, { status: 400 });
  }
  const attr = await queryOne(
    "INSERT INTO arcana_attributes (arcana_id, stat_name, value, is_percent) VALUES ($1,$2,$3,$4) RETURNING *",
    [id, stat_name, value, is_percent ?? true]
  );
  return NextResponse.json(attr, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { attr_id } = await request.json();
  await query("DELETE FROM arcana_attributes WHERE id=$1 AND arcana_id=$2", [attr_id, id]);
  return NextResponse.json({ success: true });
}
