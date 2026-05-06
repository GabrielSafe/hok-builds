import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, Eye, Shield } from "lucide-react";
import ViewTracker from "@/components/hero/ViewTracker";
import HeroBuildSection from "@/components/hero/HeroBuildSection";
import HeroSkillsSection from "@/components/hero/HeroSkillsSection";
import RoleBadge from "@/components/ui/RoleBadge";
import DifficultyStars from "@/components/ui/DifficultyStars";
import { query, queryOne } from "@/lib/db";
import { formatNumber } from "@/lib/utils";
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
      query(
        `SELECT bi.sort_order, bi.phase, i.name AS item_name, i.image_url AS item_image_url, i.slug AS item_slug
         FROM build_items bi JOIN items i ON i.id = bi.item_id
         WHERE bi.build_id = $1 ORDER BY bi.sort_order ASC`,
        [build.id]
      ),
      query(
        `SELECT ba.quantity, a.name AS arcana_name, a.image_url AS arcana_image_url, a.tier AS arcana_tier
         FROM build_arcana ba JOIN arcana a ON a.id = ba.arcana_id
         WHERE ba.build_id = $1`,
        [build.id]
      ),
      query(
        `SELECT s.name AS spell_name, s.image_url AS spell_image_url
         FROM build_spells bs JOIN spells s ON s.id = bs.spell_id
         WHERE bs.build_id = $1`,
        [build.id]
      ),
      query(
        `SELECT bso.sort_order, sk.name AS skill_name, sk.key AS skill_key, sk.image_url AS skill_image_url
         FROM build_skill_order bso JOIN skills sk ON sk.id = bso.skill_id
         WHERE bso.build_id = $1 ORDER BY bso.sort_order ASC`,
        [build.id]
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

  const { hero, stats, skills, build } = data;
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
        <div className="rounded-xl p-5 mb-6 flex flex-wrap items-center gap-5" style={{ background: "linear-gradient(135deg,#1E293B,#1F1F23)", border: "1px solid #27272A", boxShadow: "0 4px 24px rgba(0,0,0,.5)" }}>
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

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Build — 2/3 */}
          <div className="lg:col-span-2">
            {build ? (
              <HeroBuildSection build={build as Build} />
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

          </div>
        </div>
      </div>
    </>
  );
}
