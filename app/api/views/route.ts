import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { hashIp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { heroId } = await request.json();

  if (!heroId) {
    return NextResponse.json({ error: "heroId required" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const ipHash = hashIp(ip);

  const recentView = await queryOne(
    `SELECT id FROM hero_views
     WHERE hero_id = $1 AND ip_hash = $2 AND viewed_at > NOW() - INTERVAL '1 hour'`,
    [heroId, ipHash]
  );

  if (!recentView) {
    await query(
      "INSERT INTO hero_views (hero_id, ip_hash) VALUES ($1, $2)",
      [heroId, ipHash]
    );
  }

  const countRow = await queryOne<{ total_views: string }>(
    "SELECT COALESCE(COUNT(*), 0) AS total_views FROM hero_views WHERE hero_id = $1",
    [heroId]
  );

  return NextResponse.json({ total_views: parseInt(countRow?.total_views ?? "0") });
}
