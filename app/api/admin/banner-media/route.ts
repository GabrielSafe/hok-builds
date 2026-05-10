import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const media = await query("SELECT * FROM banner_media ORDER BY sort_order ASC, created_at ASC");
  return NextResponse.json(media);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, type, title } = await request.json();
  if (!url || !type) return NextResponse.json({ error: "url e type obrigatórios" }, { status: 400 });

  const count = await queryOne<{ count: string }>("SELECT COUNT(*) FROM banner_media");
  const sort_order = parseInt(count?.count ?? "0");

  const item = await queryOne(
    `INSERT INTO banner_media (url, type, title, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
    [url, type, title ?? null, sort_order]
  );
  return NextResponse.json(item, { status: 201 });
}
