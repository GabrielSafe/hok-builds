import type { Metadata } from "next";
import { query } from "@/lib/db";
import DraftTool from "@/components/esports/DraftTool";
import type { Hero } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Simulador de Draft — HOK Builds" };

export default async function DraftPage() {
  const heroes = await query<Hero>(
    `SELECT id, name, slug, role, icon_url FROM heroes WHERE is_published = true ORDER BY name ASC`
  );
  return <DraftTool heroes={heroes} />;
}
