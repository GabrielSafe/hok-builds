import { query } from "@/lib/db";
import { formatRoles } from "@/lib/utils";
import IndicatorManager, { type IndicatorEntity } from "@/components/admin/IndicatorManager";
import IndicatorTabs from "@/components/admin/IndicatorTabs";
import type { Hero, Item, Spell, Arcana } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminIndicatorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "heroes" } = await searchParams;

  const [heroes, items, spells, arcana] = await Promise.all([
    query<Hero>(`SELECT id, name, slug, role, icon_url, change_type FROM heroes WHERE is_published = true ORDER BY name ASC`),
    query<Item>(`SELECT id, name, image_url, cost, change_type FROM items ORDER BY name ASC`),
    query<Spell>(`SELECT id, name, image_url, change_type FROM spells ORDER BY name ASC`),
    query<Arcana>(`SELECT id, name, image_url, tier, change_type FROM arcana ORDER BY tier ASC, name ASC`),
  ]);

  const heroEntities = heroes.map((h) => ({
    id: h.id,
    name: h.name,
    image_url: h.icon_url,
    subtitle: formatRoles(h.role),
    change_type: h.change_type,
  }));

  const itemEntities = items.map((i) => ({
    id: i.id,
    name: i.name,
    image_url: i.image_url,
    subtitle: i.cost ? `${i.cost} ouro` : undefined,
    change_type: i.change_type,
  }));

  const spellEntities = spells.map((s) => ({
    id: s.id,
    name: s.name,
    image_url: s.image_url,
    change_type: s.change_type,
  }));

  const arcanaEntities = arcana.map((a) => ({
    id: a.id,
    name: a.name,
    image_url: a.image_url,
    subtitle: `Tier ${a.tier}`,
    change_type: a.change_type,
  }));

  const TABS = [
    { key: "heroes",  label: "Heróis",   count: heroes.length },
    { key: "items",   label: "Itens",    count: items.length },
    { key: "spells",  label: "Feitiços", count: spells.length },
    { key: "arcana",  label: "Arcanas",  count: arcana.length },
  ];

  const entityMap: Record<string, { entities: IndicatorEntity[]; apiPath: string }> = {
    heroes: { entities: heroEntities, apiPath: "heroes" },
    items:  { entities: itemEntities, apiPath: "items" },
    spells: { entities: spellEntities, apiPath: "spells" },
    arcana: { entities: arcanaEntities, apiPath: "arcana" },
  };

  const active = entityMap[tab] ?? entityMap.heroes;

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-white mb-1">Indicadores de Patch</h1>
      <p className="text-gray-500 text-sm mb-6">
        Defina buff, nerf ou ajuste para heróis, itens, feitiços e arcanas do patch atual.
      </p>

      <IndicatorTabs tabs={TABS} activeTab={tab} />

      <div className="mt-5">
        <IndicatorManager entities={active.entities} apiPath={active.apiPath} />
      </div>
    </div>
  );
}
