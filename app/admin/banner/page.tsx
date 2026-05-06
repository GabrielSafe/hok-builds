import { query } from "@/lib/db";
import { formatRoles } from "@/lib/utils";
import Image from "next/image";
import BannerSelector from "@/components/admin/BannerSelector";
import type { Hero } from "@/types";

export const dynamic = "force-dynamic";

async function getHeroes() {
  return query<Hero>(
    `SELECT id, name, slug, role, icon_url, splash_url, is_featured
     FROM heroes WHERE is_published = true ORDER BY name ASC`
  );
}

export default async function AdminBannerPage() {
  const heroes = await getHeroes();
  const featuredHeroes = heroes.filter((h) => h.is_featured);
  const featuredIds = featuredHeroes.map((h) => h.id);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold text-white mb-1">Banner da Home</h1>
      <p className="text-gray-500 text-sm mb-6">
        Escolha quais heróis aparecem no carrossel de destaque da página inicial.
      </p>

      {/* Preview atual */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-dark-600">
          <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">
            Em Destaque ({featuredHeroes.length})
          </p>
        </div>
        {featuredHeroes.length > 0 ? (
          <div className="flex flex-wrap gap-4 p-5">
            {featuredHeroes.map((hero) => (
              <div key={hero.id} className="flex items-center gap-3">
                {hero.splash_url && (
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-gold-500/40 shrink-0">
                    <Image src={hero.splash_url} alt={hero.name} fill sizes="96px" className="object-cover object-top" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-white text-sm">{hero.name}</p>
                  <p className="text-xs text-gray-500">{formatRoles(hero.role)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-500">
            Nenhum herói em destaque — serão exibidos os 3 mais vistos automaticamente.
          </div>
        )}
      </div>

      <BannerSelector heroes={heroes} featuredIds={featuredIds} />
    </div>
  );
}
