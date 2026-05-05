import { query } from "@/lib/db";
import type { Hero } from "@/types";
import AdminStatsForm from "@/components/admin/AdminStatsForm";

async function getPublishedHeroes(): Promise<Hero[]> {
  return query<Hero>("SELECT * FROM heroes WHERE is_published = true ORDER BY name ASC");
}

export default async function AdminStatsPage() {
  const heroes = await getPublishedHeroes();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-2">Estatísticas dos Heróis</h1>
      <p className="text-gray-500 text-sm mb-6">Atualize winrate, pickrate e tier de cada herói.</p>
      <AdminStatsForm heroes={heroes} />
    </div>
  );
}
