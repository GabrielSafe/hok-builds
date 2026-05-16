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
  const { name, creator_type, main_role, avatar_url, description, is_active, twitch_url, youtube_url, twitter_url } = await request.json();

  const creator = await queryOne(
    `UPDATE creators SET name=$1, creator_type=$2, main_role=$3, avatar_url=$4, description=$5, is_active=$6, twitch_url=$7, youtube_url=$8, twitter_url=$9
     WHERE id=$10 RETURNING *`,
    [name, creator_type ?? "pro_player", main_role ?? null, avatar_url ?? null, description ?? null, is_active ?? true, twitch_url ?? null, youtube_url ?? null, twitter_url ?? null, id]
  );
  return NextResponse.json(creator);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await query("DELETE FROM creators WHERE id=$1", [id]);
  return NextResponse.json({ success: true });
}
