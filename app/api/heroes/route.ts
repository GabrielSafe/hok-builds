import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import type { Hero } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const page = parseInt(searchParams.get("page") ?? "1");
  const offset = (page - 1) * limit;

  let sql = `
    SELECT h.*, COALESCE(v.total_views, 0) AS total_views
    FROM heroes h
    LEFT JOIN hero_view_counts v ON v.hero_id = h.id
    WHERE h.is_published = true
  `;
  const params: unknown[] = [];
  let idx = 1;

  if (role) {
    sql += ` AND h.role = $${idx++}`;
    params.push(role);
  }

  if (search) {
    sql += ` AND h.name ILIKE $${idx++}`;
    params.push(`%${search}%`);
  }

  sql += ` ORDER BY h.name ASC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  const heroes = await query<Hero>(sql, params);
  return NextResponse.json(heroes);
}
