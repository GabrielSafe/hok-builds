import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "hok-esports-secret");

export async function POST(request: NextRequest) {
  const { key } = await request.json();
  if (!key) return NextResponse.json({ error: "Chave obrigatória" }, { status: 400 });

  const coach = await queryOne<{ id: number; name: string }>(
    `SELECT id, name FROM coach_keys WHERE key_value = $1 AND is_active = true`,
    [key.trim()]
  );

  if (!coach) return NextResponse.json({ error: "Chave inválida ou inativa" }, { status: 401 });

  // Update last_used
  await queryOne(`UPDATE coach_keys SET last_used = NOW() WHERE id = $1`, [coach.id]);

  const token = await new SignJWT({ coachId: coach.id, name: coach.name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  const res = NextResponse.json({ ok: true, name: coach.name });
  res.cookies.set("esports_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
