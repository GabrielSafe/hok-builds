import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Eye, Shield } from "lucide-react";
import ViewTracker from "@/components/hero/ViewTracker";
import RoleBadge from "@/components/ui/RoleBadge";
import DifficultyStars from "@/components/ui/DifficultyStars";
import { query, queryOne } from "@/lib/db";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { Hero, HeroStats, Skill, Build } from "@/types";

export const dynamic = "force-dynamic";

async function getHeroData(slug: string) {
  const hero = await queryOne<Hero>(
    `SELECT h.*, COALESCE(v.total_views, 0) AS total_views
     FROM heroes h
     LEFT JOIN hero_view_counts v ON v.hero_id = h.id
     WHERE h.slug = $1 AND h.is_published = true`,
    [slug]
  );
  if (!hero) return null;

  const [stats, skills, build] = await Promise.all([
    queryOne<HeroStats>("SELECT * FROM hero_stats WHERE hero_id = $1", [hero.id]),
    query<Skill>("SELECT * FROM skills WHERE hero_id = $1 ORDER BY sort_order ASC", [hero.id]),
    queryOne<Build>("SELECT * FROM builds WHERE hero_id = $1 AND is_recommended = true LIMIT 1", [hero.id]),
  ]);

  let buildData = null;
  if (build) {
    const [items, arcana, spells, skillOrder] = await Promise.all([
      query<{ item_name: string; item_image_url: string; item_slug: string; sort_order: number; phase: string }>(
        `SELECT bi.sort_order, bi.phase, i.name AS item_name, i.image_url AS item_image_url, i.slug AS item_slug
         FROM build_items bi JOIN items i ON i.id = bi.item_id
         WHERE bi.build_id = $1 ORDER BY bi.sort_order ASC`, [build.id]
      ),
      query<{ arcana_name: string; arcana_image_url: string; arcana_tier: number; quantity: number }>(
        `SELECT ba.quantity, a.name AS arcana_name, a.image_url AS arcana_image_url, a.tier AS arcana_tier
         FROM build_arcana ba JOIN arcana a ON a.id = ba.arcana_id
         WHERE ba.build_id = $1`, [build.id]
      ),
      query<{ spell_name: string; spell_image_url: string }>(
        `SELECT s.name AS spell_name, s.image_url AS spell_image_url
         FROM build_spells bs JOIN spells s ON s.id = bs.spell_id
         WHERE bs.build_id = $1`, [build.id]
      ),
      query<{ skill_name: string; skill_key: string; skill_image_url: string | null; sort_order: number }>(
        `SELECT bso.sort_order, sk.name AS skill_name, sk.key AS skill_key, sk.image_url AS skill_image_url
         FROM build_skill_order bso JOIN skills sk ON sk.id = bso.skill_id
         WHERE bso.build_id = $1 ORDER BY bso.sort_order ASC`, [build.id]
      ),
    ]);
    buildData = { ...build, items, arcana, spells, skill_order: skillOrder };
  }

  return { hero, stats, skills, build: buildData };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getHeroData(slug);
  if (!data) return { title: "Herói não encontrado" };
  return {
    title: `${data.hero.name} — Build e Guia`,
    description: data.hero.description ?? `Build recomendada e guia de ${data.hero.name} em Honor of Kings.`,
    openGraph: { images: data.hero.splash_url ? [{ url: data.hero.splash_url }] : [] },
  };
}

const TIER_COLORS: Record<string, string> = {
  S: "bg-yellow-500 text-black",
  A: "bg-green-500 text-black",
  B: "bg-blue-500 text-white",
  C: "bg-gray-500 text-white",
  D: "bg-red-600 text-white",
};

export default async function HeroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getHeroData(slug);
  if (!data) notFound();

  const { hero, stats, skills, build } = data;

  const coreItems = build?.items?.filter((i) => i.phase === "core") ?? [];
  const startItems = build?.items?.filter((i) => i.phase === "start") ?? [];
  const allItems = build?.items ?? [];

  return (
    <>
      <ViewTracker heroId={hero.id} />

      {/* Hero Banner */}
      <div className="relative w-full h-56 md:h-72 overflow-hidden">
        {hero.splash_url ? (
          <Image src={hero.splash_url} alt={hero.name} fill priority sizes="100vw" className="object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/20 via-dark-900/50 to-dark-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 via-transparent to-transparent" />

        <div className="absolute top-4 left-4">
          <Link href="/heroes" className="flex items-center gap-1 text-sm text-gray-300 hover:text-gold-400 transition-colors bg-dark-900/60 rounded-lg px-3 py-1.5">
            <ChevronLeft size={16} /> Heróis
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-20">
        {/* Hero header card */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5 mb-6 flex flex-wrap items-center gap-5">
          {hero.icon_url && (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gold-500/60 shrink-0">
              <Image src={hero.icon_url} alt={hero.name} fill sizes="80px" className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white">{hero.name}</h1>
              {stats?.tier && (
                <span className={`text-xs font-black px-2 py-0.5 rounded ${TIER_COLORS[stats.tier] ?? "bg-gray-600 text-white"}`}>
                  TIER {stats.tier}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <RoleBadge role={hero.role} size="md" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Dificuldade</span>
                <DifficultyStars value={hero.difficulty} />
              </div>
              {hero.total_views != null && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Eye size={12} className="text-gold-400/60" />
                  {formatNumber(hero.total_views)} visualizações
                </div>
              )}
            </div>
            {hero.description && (
              <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-2xl">{hero.description}</p>
            )}
          </div>

          {/* Stats row */}
          {stats && (
            <div className="flex gap-4 shrink-0">
              {[
                { label: "Win Rate", value: formatPercent(stats.winrate), color: "text-green-400" },
                { label: "Pick Rate", value: formatPercent(stats.pickrate), color: "text-blue-400" },
                { label: "Ban Rate", value: formatPercent(stats.banrate), color: "text-red-400" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Build */}
            {build ? (
              <>
                {/* Items */}
                <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gold-400 uppercase tracking-wider">
                      Build de Itens
                    </h2>
                    {build.patch_version && (
                      <span className="text-xs text-gray-500 bg-dark-600 px-2 py-0.5 rounded">
                        Patch {build.patch_version}
                      </span>
                    )}
                  </div>
                  <div className="p-5 space-y-5">
                    {startItems.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Item Inicial</p>
                        <div className="flex flex-wrap gap-3">
                          {startItems.map((item, i) => <ItemIcon key={i} name={item.item_name} imageUrl={item.item_image_url} />)}
                        </div>
                      </div>
                    )}
                    {coreItems.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Itens Principais</p>
                        <div className="flex flex-wrap gap-3">
                          {coreItems.map((item, i) => <ItemIcon key={i} name={item.item_name} imageUrl={item.item_image_url} />)}
                        </div>
                      </div>
                    )}
                    {startItems.length === 0 && coreItems.length === 0 && allItems.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {allItems.map((item, i) => <ItemIcon key={i} name={item.item_name} imageUrl={item.item_image_url} />)}
                      </div>
                    )}
                    {allItems.length === 0 && (
                      <p className="text-sm text-gray-500">Itens ainda não cadastrados para esta build.</p>
                    )}
                  </div>
                </div>

                {/* Arcana + Spells */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(build.arcana?.length ?? 0) > 0 && (
                    <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
                      <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">Arcana</p>
                      <div className="flex flex-wrap gap-3">
                        {(build.arcana as Array<{ arcana_name: string; arcana_image_url: string; arcana_tier: number; quantity: number }>).map((a, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-11 h-11 rounded-full border-2 border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                              {a.arcana_image_url
                                ? <Image src={a.arcana_image_url} alt={a.arcana_name} width={44} height={44} className="object-cover w-full h-full" />
                                : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold-400">{a.arcana_name[0]}</div>
                              }
                            </div>
                            <span className="text-xs text-gray-400">{a.quantity}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(build.spells?.length ?? 0) > 0 && (
                    <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
                      <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">Feitiços</p>
                      <div className="flex gap-3">
                        {(build.spells as Array<{ spell_name: string; spell_image_url: string }>).map((s, i) => (
                          <ItemIcon key={i} name={s.spell_name} imageUrl={s.spell_image_url} size={56} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Skill Order */}
                {(build.skill_order?.length ?? 0) > 0 && (
                  <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
                    <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">Ordem de Habilidades</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(build.skill_order as Array<{ skill_name: string; skill_key: string; skill_image_url: string | null; sort_order: number }>).map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                              {s.skill_image_url
                                ? <Image src={s.skill_image_url} alt={s.skill_name} width={40} height={40} className="object-cover w-full h-full" />
                                : <div className="w-full h-full flex items-center justify-center text-xs font-black text-gold-400">{s.skill_key.toUpperCase()}</div>
                              }
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold">{s.skill_key.toUpperCase()}</span>
                          </div>
                          {i < (build.skill_order?.length ?? 0) - 1 && <span className="text-gray-600 text-lg">›</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-dark-700 border border-dark-600 rounded-xl p-10 text-center">
                <Shield size={32} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400 font-semibold">Build em breve</p>
                <p className="text-gray-600 text-sm mt-1">A build recomendada está sendo preparada.</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-dark-600">
                  <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Habilidades</p>
                </div>
                <div className="divide-y divide-dark-600">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 shrink-0">
                        {skill.image_url
                          ? <Image src={skill.image_url} alt={skill.name} width={40} height={40} className="object-cover w-full h-full" />
                          : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold-400">{skill.key.toUpperCase()}</div>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{skill.name}</p>
                        {skill.description && <p className="text-xs text-gray-500 leading-relaxed mt-0.5 line-clamp-2">{skill.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats card */}
            {stats && (
              <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
                <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">Estatísticas</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Win Rate", value: formatPercent(stats.winrate), color: "text-green-400" },
                    { label: "Pick Rate", value: formatPercent(stats.pickrate), color: "text-blue-400" },
                    { label: "Ban Rate", value: formatPercent(stats.banrate), color: "text-red-400" },
                    { label: "Partidas", value: formatNumber(stats.games_played), color: "text-white" },
                  ].map((s) => (
                    <div key={s.label} className="bg-dark-600 rounded-lg p-3 text-center">
                      <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ItemIcon({ name, imageUrl, size = 48 }: { name: string; imageUrl: string | null; size?: number }) {
  return (
    <div className="group relative flex flex-col items-center gap-1">
      <div
        style={{ width: size, height: size }}
        className="rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors shrink-0"
      >
        {imageUrl
          ? <Image src={imageUrl} alt={name} width={size} height={size} className="object-cover w-full h-full" />
          : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">{name[0]}</div>
        }
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-dark-900 border border-dark-500 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        {name}
      </div>
    </div>
  );
}
