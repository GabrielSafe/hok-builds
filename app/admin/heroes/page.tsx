import Link from "next/link";
import { query } from "@/lib/db";
import type { Hero } from "@/types";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import RoleBadge from "@/components/ui/RoleBadge";

async function getAllHeroes(): Promise<Hero[]> {
  return query<Hero>(
    `SELECT h.*, COALESCE(v.total_views, 0) AS total_views
     FROM heroes h LEFT JOIN hero_view_counts v ON v.hero_id = h.id
     ORDER BY h.name ASC`
  );
}

export default async function AdminHeroesPage() {
  const heroes = await getAllHeroes();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Heróis</h1>
        <Link
          href="/admin/heroes/new"
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Novo Herói
        </Link>
      </div>

      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-600 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Herói</th>
              <th className="px-4 py-3">Função</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-600">
            {heroes.map((hero) => (
              <tr key={hero.id} className="hover:bg-dark-600/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {hero.icon_url ? (
                      <img src={hero.icon_url} alt={hero.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-dark-500 flex items-center justify-center text-xs font-bold text-gold-400">
                        {hero.name[0]}
                      </div>
                    )}
                    <span className="font-medium text-white">{hero.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={hero.role} />
                </td>
                <td className="px-4 py-3 text-gray-400">{hero.total_views ?? 0}</td>
                <td className="px-4 py-3">
                  {hero.is_published ? (
                    <span className="flex items-center gap-1 text-green-400 text-xs">
                      <Eye size={12} /> Publicado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <EyeOff size={12} /> Rascunho
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/heroes/${hero.id}`}
                    className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <Pencil size={12} />
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {heroes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum herói cadastrado ainda.{" "}
            <Link href="/admin/heroes/new" className="text-gold-400 hover:underline">
              Criar o primeiro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
