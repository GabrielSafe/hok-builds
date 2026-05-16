import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const creators = await query(
    `SELECT id, name, slug, creator_type, main_role, avatar_url, description, twitch_url, youtube_url, twitter_url
     FROM creators
     WHERE is_active = true
     ORDER BY creator_type ASC, name ASC`
  );
  return NextResponse.json(creators);
}
