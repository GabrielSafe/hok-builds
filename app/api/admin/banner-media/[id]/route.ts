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
  const { title, is_active, sort_order } = await request.json();
  const item = await queryOne(
    `UPDATE banner_media SET title=$1, is_active=$2, sort_order=$3 WHERE id=$4 RETURNING *`,
    [title ?? null, is_active ?? true, sort_order ?? 0, id]
  );
  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await query("DELETE FROM banner_media WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}
