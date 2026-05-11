import { query } from "@/lib/db";
import { formatRoles } from "@/lib/utils";
import Image from "next/image";
import BannerSelector from "@/components/admin/BannerSelector";
import BannerMediaManager from "@/components/admin/BannerMediaManager";
import type { Hero } from "@/types";

export const dynamic = "force-dynamic";

interface BannerMedia { id: number; url: string; type: string; title: string | null; sort_order: number; is_active: boolean; }

export default async function AdminBannerPage() {
  const [heroes, media] = await Promise.all([
    query<Hero>(`SELECT id, name, slug, role, icon_url, splash_url, is_featured FROM heroes WHERE is_published = true ORDER BY name ASC`),
    query<BannerMedia>(`SELECT * FROM banner_media ORDER BY sort_order ASC, created_at ASC`),
  ]);

  const featuredHeroes = heroes.filter((h) => h.is_featured);
  const featuredIds = featuredHeroes.map((h) => h.id);

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Banner da Home</h1>
        <p className="text-gray-500 text-sm">Gerencie o fundo e os heróis em destaque do banner principal.</p>
      </div>

      {/* ── Seção 1: Mídia de fundo ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-gold-500 rounded-sm" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Fundo do Banner</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Vídeos, GIFs e fotos que aparecem como background. Sem mídia cadastrada, usa o splash dos heróis.</p>
        <BannerMediaManager initialMedia={media} />
      </div>

      {/* ── Seção 2: Heróis em destaque ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-gold-500 rounded-sm" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Heróis em Destaque</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Heróis selecionados aparecem no carrossel. Se nenhum selecionado, mostra os 3 mais vistos.</p>

        {featuredHeroes.length > 0 && (
          <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden mb-4">
            <div className="px-5 py-3 border-b border-dark-600">
              <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Em Destaque ({featuredHeroes.length})</p>
            </div>
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
          </div>
        )}

        <BannerSelector heroes={heroes} featuredIds={featuredIds} />
      </div>
    </div>
  );
}
