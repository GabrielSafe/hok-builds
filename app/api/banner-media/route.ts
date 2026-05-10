import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const media = await query(
    "SELECT * FROM banner_media WHERE is_active = true ORDER BY sort_order ASC, created_at ASC"
  );
  return NextResponse.json(media);
}
