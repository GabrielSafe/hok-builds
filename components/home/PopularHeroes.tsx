import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";
import { query } from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import type { Hero } from "@/types";

async function getPopularHeroes(): Promise<Hero[]> {
  return query<Hero>(
    `SELECT h.*, COALESCE(v.total_views, 0) AS total_views
     FROM heroes h
     LEFT JOIN hero_view_counts v ON v.hero_id = h.id
     WHERE h.is_published = true
     ORDER BY total_views DESC LIMIT 5`
  );
}

export default async function PopularHeroes() {
  const heroes = await getPopularHeroes();

  if (heroes.length === 0) return null;

  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600">
        <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">Heróis Mais Populares</h3>
        <Link href="/heroes" className="text-xs text-gray-500 hover:text-gold-400 transition-colors">
          Ver Todos
        </Link>
      </div>

      <div className="divide-y divide-dark-600">
        {heroes.map((hero, index) => (
          <Link
            key={hero.id}
            href={`/heroes/${hero.slug}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-dark-600 transition-colors group"
          >
            <span className="text-lg font-black text-dark-500 w-5 text-center">{index + 1}</span>

            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-dark-500 group-hover:border-gold-500/50 transition-colors shrink-0">
              {hero.icon_url ? (
                <Image src={hero.icon_url} alt={hero.name} fill sizes="40px" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-dark-500 flex items-center justify-center text-xs font-bold text-gold-400">
                  {hero.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-gold-400 transition-colors">
                {hero.name}
              </p>
              <p className="text-xs text-gray-500">{hero.role}</p>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
              <Eye size={12} className="text-gold-400/60" />
              {formatNumber(hero.total_views ?? 0)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
