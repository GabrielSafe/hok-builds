import { query } from "@/lib/db";
import type { Hero } from "@/types";
import BuildForm from "@/components/admin/BuildForm";

async function getHeroes(): Promise<Hero[]> {
  return query<Hero>("SELECT id, name, slug FROM heroes WHERE is_published = true ORDER BY name ASC");
}

export default async function NewBuildPage() {
  const heroes = await getHeroes();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Nova Build</h1>
      <BuildForm heroes={heroes} />
    </div>
  );
}
