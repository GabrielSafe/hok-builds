import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { is_featured } = await request.json();

  await queryOne(
    `UPDATE heroes SET is_featured = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
    [is_featured, id]
  );

  return NextResponse.json({ success: true });
}
