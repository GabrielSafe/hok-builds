import { notFound } from "next/navigation";
import { queryOne, query } from "@/lib/db";
import BuildEditor from "@/components/admin/BuildEditor";

export const dynamic = "force-dynamic";

export default async function BuildEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const build = await queryOne<{ id: number; title: string; hero_id: number; patch_version: string | null }>(
    "SELECT * FROM builds WHERE id=$1", [id]
  );
  if (!build) notFound();

  const [items, arcana, spells, skills] = await Promise.all([
    query<{ id: number; name: string; image_url: string | null }>("SELECT id, name, image_url FROM items ORDER BY name ASC"),
    query<{ id: number; name: string; image_url: string | null; tier: number }>("SELECT id, name, image_url, tier FROM arcana ORDER BY tier ASC, name ASC"),
    query<{ id: number; name: string; image_url: string | null }>("SELECT id, name, image_url FROM spells ORDER BY name ASC"),
    query<{ id: number; name: string; key: string; image_url: string | null }>(
      "SELECT id, name, key, image_url FROM skills WHERE hero_id=$1 ORDER BY sort_order ASC", [build.hero_id]
    ),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-1">Editor de Build</h1>
      <p className="text-gray-500 text-sm mb-6">{build.title}</p>
      <BuildEditor
        buildId={build.id}
        availableItems={items}
        availableArcana={arcana}
        availableSpells={spells}
        availableSkills={skills}
      />
    </div>
  );
}
