import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ heroId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { heroId } = await params;
  const { tier } = await request.json();

  const stats = await queryOne(
    `INSERT INTO hero_stats (hero_id, tier, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (hero_id) DO UPDATE SET tier=$2, updated_at=NOW()
     RETURNING *`,
    [heroId, tier]
  );

  return NextResponse.json(stats);
}
