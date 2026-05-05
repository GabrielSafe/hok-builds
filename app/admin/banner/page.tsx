import { query } from "@/lib/db";
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
  const featured = heroes.find((h) => h.is_featured);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold text-white mb-1">Banner da Home</h1>
      <p className="text-gray-500 text-sm mb-6">
        Escolha qual herói aparece no destaque principal da página inicial.
      </p>

      {/* Preview atual */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-dark-600">
          <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Destaque Atual</p>
        </div>
        {featured ? (
          <div className="flex items-center gap-4 p-5">
            {featured.splash_url && (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-dark-500 shrink-0">
                <Image src={featured.splash_url} alt={featured.name} fill sizes="128px" className="object-cover object-top" />
              </div>
            )}
            <div>
              <p className="font-bold text-white text-lg">{featured.name}</p>
              <p className="text-sm text-gray-500">{featured.role}</p>
              <span className="inline-block mt-1 text-xs bg-gold-500/20 text-gold-400 border border-gold-500/30 rounded px-2 py-0.5">
                Em destaque
              </span>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-500">
            Nenhum herói em destaque — será exibido o mais visto automaticamente.
          </div>
        )}
      </div>

      <BannerSelector heroes={heroes} currentFeaturedId={featured?.id ?? null} />
    </div>
  );
}
