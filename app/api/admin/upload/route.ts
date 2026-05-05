import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const path = formData.get("path") as string;

  if (!file || !path) {
    return NextResponse.json({ error: "file e path obrigatórios" }, { status: 400 });
  }

  const allowedTypes = ["image/webp", "image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo inválido" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const url = getPublicUrl(path);
  return NextResponse.json({ url });
}
