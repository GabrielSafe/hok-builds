import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { verifyPassword, createToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 });
  }

  const admin = await queryOne<{ id: number; email: string; password_hash: string; name: string }>(
    "SELECT * FROM admins WHERE email = $1",
    [email]
  );

  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const token = await createToken({ id: admin.id, email: admin.email });
  const cookie = setSessionCookie(token);

  const response = NextResponse.json({ success: true, name: admin.name });
  response.cookies.set(cookie);
  return response;
}
