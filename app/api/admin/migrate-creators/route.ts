import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await query(`ALTER TABLE pro_players RENAME TO creators`);
  await query(`ALTER TABLE creators ADD COLUMN IF NOT EXISTS creator_type VARCHAR(20) NOT NULL DEFAULT 'pro_player'`);
  await query(`ALTER TABLE creators ADD COLUMN IF NOT EXISTS twitch_url VARCHAR(255)`);
  await query(`ALTER TABLE creators ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255)`);
  await query(`ALTER TABLE creators ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255)`);
  await query(`ALTER TABLE builds RENAME COLUMN pro_player_id TO creator_id`);
  await query(`ALTER TABLE hero_counters RENAME COLUMN pro_player_id TO creator_id`);

  return NextResponse.json({ success: true, message: "Migration concluída" });
}
