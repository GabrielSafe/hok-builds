import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { Plus, Pencil, Settings } from "lucide-react";

interface BuildRow {
  id: number;
  title: string;
  hero_name: string;
  hero_slug: string;
  is_recommended: boolean;
  patch_version: string | null;
}

async function getBuilds(): Promise<BuildRow[]> {
  return query<BuildRow>(
    `SELECT b.id, b.title, b.is_recommended, b.patch_version,
            h.name AS hero_name, h.slug AS hero_slug
     FROM builds b JOIN heroes h ON h.id = b.hero_id
     ORDER BY h.name ASC, b.is_recommended DESC`
  );
}

export default async function AdminBuildsPage() {
  const builds = await getBuilds();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Builds</h1>
        <Link
          href="/admin/builds/new"
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nova Build
        </Link>
      </div>

      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-600 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Herói</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Patch</th>
              <th className="px-4 py-3">Recomendada</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {builds.map((b) => (
              <tr key={b.id} className="hover:bg-dark-600/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{b.hero_name}</td>
                <td className="px-4 py-3 text-gray-300">{b.title}</td>
                <td className="px-4 py-3 text-gray-500">{b.patch_version ?? "—"}</td>
                <td className="px-4 py-3">
                  {b.is_recommended ? (
                    <span className="text-xs text-gold-400 font-semibold">Sim</span>
                  ) : (
                    <span className="text-xs text-gray-600">Não</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/builds/${b.id}`} className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300">
                      <Settings size={12} />
                      Editor
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {builds.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma build criada ainda.
          </div>
        )}
      </div>
    </div>
  );
}
