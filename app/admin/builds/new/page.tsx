import { query } from "@/lib/db";
import type { Hero, ProPlayer } from "@/types";
import BuildForm from "@/components/admin/BuildForm";

export const dynamic = "force-dynamic";

export default async function NewBuildPage() {
  const [heroes, proPlayers] = await Promise.all([
    query<Hero>("SELECT id, name, slug FROM heroes WHERE is_published = true ORDER BY name ASC"),
    query<ProPlayer>("SELECT id, name, main_role, avatar_url FROM pro_players WHERE is_active = true ORDER BY name ASC"),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Nova Build</h1>
      <BuildForm heroes={heroes} proPlayers={proPlayers} />
    </div>
  );
}
