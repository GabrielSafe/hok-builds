import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

function parseDevice(ua: string): string {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) {
    const model = ua.match(/Android[^;]*;\s*([^)]+)\)/)?.[1]?.trim();
    return model ? model.split(" ").slice(0, 3).join(" ") : "Android";
  }
  if (/Windows/.test(ua)) return "Windows";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Linux/.test(ua)) return "Linux";
  return "Desktop";
}

function parseBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
  return "Other";
}

const SKIP = /^\/_next\/|^\/favicon|\.ico$|\.png$|\.jpg$|\.svg$|\.webp$|\.woff/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth ──────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("hok_admin_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // ── Request logging ─────────────────────────────────────
  if (!SKIP.test(pathname)) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const ua = request.headers.get("user-agent") ?? "";
    const device = parseDevice(ua);
    const browser = parseBrowser(ua);
    const method = request.method;

    const now = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

    console.log(`[${now}] ${method} ${pathname} | IP: ${ip} | ${device} | ${browser}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
