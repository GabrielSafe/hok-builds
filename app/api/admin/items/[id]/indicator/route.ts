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
  const { change_type } = await request.json();

  await queryOne(
    `UPDATE items SET change_type = $1 WHERE id = $2 RETURNING id`,
    [change_type ?? null, id]
  );

  return NextResponse.json({ success: true });
}
