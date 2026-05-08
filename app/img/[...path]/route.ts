import { NextRequest, NextResponse } from "next/server";

const SUPABASE_BASE = "https://shebnxyhiguhzosxeftm.supabase.co/storage/v1/object/public/hok-assets";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = `${SUPABASE_BASE}/${path.join("/")}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (!res.ok) return new NextResponse(null, { status: 404 });

  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/webp";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
