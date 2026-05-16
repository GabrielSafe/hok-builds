import { query } from "@/lib/db";
import type { Hero, Creator } from "@/types";
import BuildForm from "@/components/admin/BuildForm";

export const dynamic = "force-dynamic";

export default async function NewBuildPage() {
  const [heroes, creators] = await Promise.all([
    query<Hero>("SELECT id, name, slug FROM heroes WHERE is_published = true ORDER BY name ASC"),
    query<Creator>("SELECT id, name, creator_type, main_role, avatar_url FROM creators WHERE is_active = true ORDER BY name ASC"),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Nova Build</h1>
      <BuildForm heroes={heroes} creators={creators} />
    </div>
  );
}
