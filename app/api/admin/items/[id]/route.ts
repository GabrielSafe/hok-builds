import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, image_url, description, cost } = await request.json();
  const item = await queryOne(
    "UPDATE items SET name=$1, image_url=$2, description=$3, cost=$4 WHERE id=$5 RETURNING *",
    [name, image_url, description, cost ?? 0, id]
  );
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await query("DELETE FROM items WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}
