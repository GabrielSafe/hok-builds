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
  const { winrate, pickrate, banrate, games_played, tier } = await request.json();

  const stats = await queryOne(
    `INSERT INTO hero_stats (hero_id, winrate, pickrate, banrate, games_played, tier, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (hero_id) DO UPDATE SET
       winrate=$2, pickrate=$3, banrate=$4, games_played=$5, tier=$6, updated_at=NOW()
     RETURNING *`,
    [heroId, winrate, pickrate, banrate, games_played, tier]
  );

  return NextResponse.json(stats);
}
