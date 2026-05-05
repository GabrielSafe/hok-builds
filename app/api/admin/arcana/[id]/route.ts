import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, tier, image_url, description } = await request.json();
  const arcana = await queryOne(
    "UPDATE arcana SET name=$1, tier=$2, image_url=$3, description=$4 WHERE id=$5 RETURNING *",
    [name, tier ?? 1, image_url, description, id]
  );
  return NextResponse.json(arcana);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await query("DELETE FROM arcana WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}
