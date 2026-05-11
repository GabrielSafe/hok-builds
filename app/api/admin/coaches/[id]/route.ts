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
  const { is_active } = await request.json();
  const coach = await queryOne(
    `UPDATE coach_keys SET is_active=$1 WHERE id=$2 RETURNING *`,
    [is_active, id]
  );
  return NextResponse.json(coach);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await query("DELETE FROM coach_keys WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}
