import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Eye, Shield, User, Ruler, Zap, MapPin, Users, Compass, BookOpen, Heart } from "lucide-react";
import ViewTracker from "@/components/hero/ViewTracker";
import HeroBuildSwitcher from "@/components/hero/HeroBuildSwitcher";
import HeroSkillsSection from "@/components/hero/HeroSkillsSection";
import RoleBadge from "@/components/ui/RoleBadge";
import DifficultyStars from "@/components/ui/DifficultyStars";
import { query, queryOne } from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import type { Hero, HeroStats, Skill, Build, HeroCounter } from "@/types";

export const dynamic = "force-dynamic";

type CounterHero = HeroCounter & { counter_hero_name: string; counter_hero_slug: string; counter_hero_icon: string | null };
type RichBuild = Build & { pro_player_name?: string | null; pro_player_avatar?: string | null; items: unknown[]; arcana: unknown[]; spells: unknown[]; skill_order: unknown[] };

async function fetchBuildDetails(buildId: number) {
  const [items, arcana, spells, skillOrder] = await Promise.all([
    query(`SELECT bi.sort_order, bi.phase, i.name AS item_name, i.image_url AS item_image_url, i.change_type AS item_change_type FROM build_items bi JOIN items i ON i.id=bi.item_id WHERE bi.build_id=$1 ORDER BY bi.sort_order ASC`, [buildId]),
    query(`SELECT ba.quantity, a.name AS arcana_name, a.image_url AS arcana_image_url, a.change_type AS arcana_change_type FROM build_arcana ba JOIN arcana a ON a.id=ba.arcana_id WHERE ba.build_id=$1`, [buildId]),
    query(`SELECT s.name AS spell_name, s.image_url AS spell_image_url, s.change_type AS spell_change_type FROM build_spells bs JOIN spells s ON s.id=bs.spell_id WHERE bs.build_id=$1`, [buildId]),
    query(`SELECT bso.sort_order, sk.name AS skill_name, sk.key AS skill_key, sk.image_url AS skill_image_url FROM build_skill_order bso JOIN skills sk ON sk.id=bso.skill_id WHERE bso.build_id=$1 ORDER BY bso.sort_order ASC`, [buildId]),
  ]);
  return { items, arcana, spells, skill_order: skillOrder };
}

async function getHeroData(slug: string) {
  const hero = await queryOne<Hero>(
    `SELECT h.*, COALESCE(v.total_views, 0) AS total_views
     FROM heroes h LEFT JOIN hero_view_counts v ON v.hero_id = h.id
     WHERE h.slug = $1 AND h.is_published = true`, [slug]
  );
  if (!hero) return null;

  const [stats, skills, buildsRaw, counters] = await Promise.all([
    queryOne<HeroStats>("SELECT * FROM hero_stats WHERE hero_id = $1", [hero.id]),
    query<Skill>("SELECT * FROM skills WHERE hero_id = $1 ORDER BY sort_order ASC", [hero.id]),
    query<Build & { pro_player_name?: string; pro_player_avatar?: string }>(
      `SELECT b.*, pp.name AS pro_player_name, pp.avatar_url AS pro_player_avatar
       FROM builds b LEFT JOIN pro_players pp ON pp.id = b.pro_player_id
       WHERE b.hero_id=$1 ORDER BY b.is_recommended DESC, pp.name ASC`, [hero.id]
    ),
    query<CounterHero>(
      `SELECT hc.*, h.name AS counter_hero_name, h.slug AS counter_hero_slug, h.icon_url AS counter_hero_icon
       FROM hero_counters hc JOIN heroes h ON h.id = hc.counter_hero_id
       WHERE hc.hero_id=$1`, [hero.id]
    ),
  ]);

  const allBuilds: RichBuild[] = await Promise.all(
    buildsRaw.map(async (b) => ({ ...b, ...(await fetchBuildDetails(b.id)) }))
  );

  return { hero, stats, skills, allBuilds, counters };
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

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: "#854D0E", text: "#FDE68A" },
  A: { bg: "#14532D", text: "#86EFAC" },
  B: { bg: "#1E3A5F", text: "#93C5FD" },
  C: { bg: "#27272A", text: "#A1A1AA" },
  D: { bg: "#7F1D1D", text: "#FCA5A5" },
};

export default async function HeroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getHeroData(slug);
  if (!data) notFound();

  const { hero, stats, skills, allBuilds, counters } = data;
  const tier = stats?.tier ?? "B";
  const tierStyle = TIER_COLORS[tier] ?? TIER_COLORS.B;

  return (
    <>
      <ViewTracker heroId={hero.id} />

      {/* Splash banner */}
      <div className="relative w-full h-56 md:h-72 overflow-hidden">
        {hero.splash_url ? (
          <Image src={hero.splash_url} alt={hero.name} fill priority sizes="100vw" className="object-cover object-top" />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(11,15,23,.2) 0%,rgba(11,15,23,.6) 60%,#0B0F17 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(11,15,23,.85),transparent 60%)" }} />
        <div className="absolute top-4 left-4">
          <Link href="/heroes" className="flex items-center gap-1 text-sm text-gray-300 hover:text-yellow-400 transition-colors rounded-lg px-3 py-1.5" style={{ background: "rgba(11,15,23,.7)" }}>
            <ChevronLeft size={16} /> Heróis
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-20">

        {/* ── Hero header ── */}
        <div className="rounded-xl p-5 mb-6" style={{ background: "linear-gradient(135deg,#1E293B,#1F1F23)", border: "1px solid #27272A", boxShadow: "0 4px 24px rgba(0,0,0,.5)" }}>
          <div className="flex flex-wrap items-start gap-5">
            {hero.icon_url && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ border: "2px solid rgba(250,204,21,.5)", boxShadow: "0 0 14px rgba(250,204,21,.25)" }}>
                <Image src={hero.icon_url} alt={hero.name} fill sizes="80px" className="object-cover" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">{hero.name}</h1>
                <span
                  className="font-display text-xs font-bold px-2.5 py-0.5 rounded"
                  style={{ background: tierStyle.bg, color: tierStyle.text, border: `1px solid ${tierStyle.text}40` }}
                >
                  TIER {tier}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <RoleBadge role={hero.role} size="md" />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-sans">Dificuldade</span>
                  <DifficultyStars value={hero.difficulty} />
                </div>
                {hero.total_views != null && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye size={12} className="text-yellow-400/60" />
                    {formatNumber(hero.total_views)} visualizações
                  </div>
                )}
              </div>
              {hero.description && (
                <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-2xl font-sans">{hero.description}</p>
              )}
            </div>
          </div>

          {/* Bio info */}
          {(hero.race || hero.height || hero.fighting_style || hero.origin_place || hero.faction || hero.lore_role) && (
            <div className="mt-4 pt-4 border-t border-dark-600 flex flex-wrap gap-x-6 gap-y-2">
              {hero.race && (
                <div className="flex items-center gap-2">
                  <User size={12} className="text-gold-400 shrink-0" />
                  <span className="text-xs text-gray-500">Raça</span>
                  <span className="text-xs text-white font-medium">{hero.race}</span>
                </div>
              )}
              {hero.height && (
                <div className="flex items-center gap-2">
                  <Ruler size={12} className="text-gold-400 shrink-0" />
                  <span className="text-xs text-gray-500">Altura</span>
                  <span className="text-xs text-white font-medium">{hero.height}</span>
                </div>
              )}
              {hero.fighting_style && (
                <div className="flex items-center gap-2">
                  <Zap size={12} className="text-gold-400 shrink-0" />
                  <span className="text-xs text-gray-500">Estilo</span>
                  <span className="text-xs text-white font-medium">{hero.fighting_style}</span>
                </div>
              )}
              {hero.origin_place && (
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-gold-400 shrink-0" />
                  <span className="text-xs text-gray-500">Origem</span>
                  <span className="text-xs text-white font-medium">{hero.origin_place}</span>
                </div>
              )}
              {hero.faction && (
                <div className="flex items-center gap-2">
                  <Users size={12} className="text-gold-400 shrink-0" />
                  <span className="text-xs text-gray-500">Facção</span>
                  <span className="text-xs text-white font-medium">{hero.faction}</span>
                </div>
              )}
              {hero.lore_role && (
                <div className="flex items-center gap-2">
                  <Compass size={12} className="text-gold-400 shrink-0" />
                  <span className="text-xs text-gray-500">Papel</span>
                  <span className="text-xs text-white font-medium">{hero.lore_role}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Build — 2/3 */}
          <div className="lg:col-span-2">
            {allBuilds.length > 0 ? (
              <HeroBuildSwitcher builds={allBuilds as Parameters<typeof HeroBuildSwitcher>[0]["builds"]} />
            ) : (
              <div className="rounded-xl p-10 text-center" style={{ background: "linear-gradient(135deg,#1E293B,#1F1F23)", border: "1px solid #27272A" }}>
                <Shield size={32} style={{ color: "#3F3F46", margin: "0 auto 12px" }} />
                <p className="font-heading font-semibold text-gray-400">Build em breve</p>
                <p className="text-sm text-gray-600 mt-1 font-sans">A build recomendada está sendo preparada.</p>
              </div>
            )}
          </div>

          {/* Sidebar — 1/3 */}
          <div className="space-y-4">
            {skills.length > 0 && <HeroSkillsSection skills={skills} />}

            {/* Counters */}
            {counters.length > 0 && (() => {
              const weakAgainst = counters.filter(c => c.type === "weak_against");
              const strongAgainst = counters.filter(c => c.type === "strong_against");
              return (
                <div className="rounded-xl overflow-hidden border border-dark-600" style={{ background: "linear-gradient(135deg,#1E293B,#1F1F23)" }}>
                  <div className="px-5 py-3 border-b border-dark-600">
                    <p className="section-label">Counters</p>
                  </div>
                  <div className="p-4 space-y-4">
                    {weakAgainst.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Pick Counter</p>
                        <div className="flex gap-3">
                          {weakAgainst.map(c => (
                            <a key={c.id} href={`/heroes/${c.counter_hero_slug}`} className="flex flex-col items-center gap-1 group">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-red-500/40 group-hover:border-red-400 transition-colors bg-dark-600">
                                {c.counter_hero_icon
                                  ? <Image src={c.counter_hero_icon} alt={c.counter_hero_name} width={48} height={48} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-xs font-black text-red-400">{c.counter_hero_name[0]}</div>
                                }
                              </div>
                              <span className="text-[9px] text-gray-500 text-center w-12 truncate">{c.counter_hero_name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {strongAgainst.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-2">Bom Contra</p>
                        <div className="flex gap-3">
                          {strongAgainst.map(c => (
                            <a key={c.id} href={`/heroes/${c.counter_hero_slug}`} className="flex flex-col items-center gap-1 group">
                              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-green-500/40 group-hover:border-green-400 transition-colors bg-dark-600">
                                {c.counter_hero_icon
                                  ? <Image src={c.counter_hero_icon} alt={c.counter_hero_name} width={48} height={48} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-xs font-black text-green-400">{c.counter_hero_name[0]}</div>
                                }
                              </div>
                              <span className="text-[9px] text-gray-500 text-center w-12 truncate">{c.counter_hero_name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Lore ── */}
        {hero.lore && (
          <div className="mt-6 rounded-xl overflow-hidden border border-dark-600" style={{ background: "linear-gradient(135deg,#1E293B,#1F1F23)" }}>
            <div className="px-5 py-3 border-b border-dark-600 flex items-center gap-2">
              <BookOpen size={14} className="text-gold-400" />
              <p className="section-label">Lore</p>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line font-sans">{hero.lore}</p>

              {hero.lore_credit && (
                <div className="mt-5 flex items-center gap-2.5 px-4 py-3 rounded-lg border border-gold-500/20 bg-gold-500/5">
                  <Heart size={13} className="text-gold-400 shrink-0" />
                  <p className="text-xs text-gray-400">
                    <span className="text-gold-400 font-semibold">{hero.lore_credit}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
