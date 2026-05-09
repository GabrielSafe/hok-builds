import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, main_role, avatar_url, description, is_active } = await request.json();

  const player = await queryOne(
    `UPDATE pro_players SET name=$1, main_role=$2, avatar_url=$3, description=$4, is_active=$5
     WHERE id=$6 RETURNING *`,
    [name, main_role ?? null, avatar_url ?? null, description ?? null, is_active ?? true, id]
  );
  return NextResponse.json(player);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await query("DELETE FROM pro_players WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}
