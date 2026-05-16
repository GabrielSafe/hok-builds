import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import EsportsHub from "@/components/esports/EsportsHub";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "E-Sports — HOK Builds" };

export default async function EsportsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("esports_token")?.value;
  let coachName: string | null = null;

  if (token) {
    const payload = await verifyToken(token);
    if (payload && typeof payload === "object" && "name" in payload) {
      coachName = payload.name as string;
    }
  }

  return <EsportsHub coachName={coachName} />;
}
