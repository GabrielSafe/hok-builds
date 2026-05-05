import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { name, role, difficulty, description, lore, icon_url, splash_url, is_published, is_featured } = body;

    if (is_featured) {
      await query("UPDATE heroes SET is_featured = false WHERE is_featured = true AND id != $1", [id]);
    }

    const hero = await queryOne(
      `UPDATE heroes SET name=$1, role=$2, difficulty=$3, description=$4, lore=$5,
       icon_url=$6, splash_url=$7, is_published=$8, is_featured=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [name, role, difficulty, description, lore, icon_url, splash_url, is_published, is_featured ?? false, id]
    );

    if (!hero) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(hero);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    await query("DELETE FROM heroes WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "Unauthorized") return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
