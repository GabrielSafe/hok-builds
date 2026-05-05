import { query } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tier List",
  description: "Ranking dos melhores heróis de Honor of Kings por tier.",
};

interface TierHero {
  id: number;
  name: string;
  slug: string;
  role: string;
  icon_url: string | null;
  tier: string;
  winrate: number;
}

const TIER_ORDER = ["S", "A", "B", "C", "D"];
const TIER_LABELS: Record<string, string> = {
  S: "Ótimo",
  A: "Muito Bom",
  B: "Bom",
  C: "Regular",
  D: "Fraco",
};
const TIER_COLORS: Record<string, string> = {
  S: "text-gold-400 border-gold-500 bg-yellow-900/20",
  A: "text-green-400 border-green-500 bg-green-900/20",
  B: "text-blue-400 border-blue-500 bg-blue-900/20",
  C: "text-gray-400 border-gray-500 bg-gray-900/20",
  D: "text-red-400 border-red-500 bg-red-900/20",
};

async function getTierList(): Promise<TierHero[]> {
  return query<TierHero>(
    `SELECT h.id, h.name, h.slug, h.role, h.icon_url,
            COALESCE(s.tier, 'B') AS tier,
            COALESCE(s.winrate, 0) AS winrate
     FROM heroes h
     LEFT JOIN hero_stats s ON s.hero_id = h.id
     WHERE h.is_published = true
     ORDER BY
       CASE COALESCE(s.tier, 'B') WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 WHEN 'C' THEN 4 ELSE 5 END,
       s.winrate DESC NULLS LAST`
  );
}

export default async function TierListPage() {
  const heroes = await getTierList();

  const grouped = TIER_ORDER.reduce<Record<string, TierHero[]>>((acc, tier) => {
    acc[tier] = heroes.filter((h) => h.tier === tier);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-2">Tier List</h1>
      <p className="text-gray-500 text-sm mb-8">Ranking dos heróis baseado em winrate e performance.</p>

      <div className="space-y-4">
        {TIER_ORDER.map((tier) => {
          const list = grouped[tier];
          if (!list?.length) return null;
          return (
            <div key={tier} className="flex gap-4 bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
              <div className={`flex items-center justify-center w-16 shrink-0 border-r border-dark-600 ${TIER_COLORS[tier]}`}>
                <div className="text-center">
                  <p className={`text-2xl font-black border-2 w-10 h-10 flex items-center justify-center rounded mx-auto ${TIER_COLORS[tier]}`}>
                    {tier}
                  </p>
                  <p className="text-[9px] mt-1 opacity-70">{TIER_LABELS[tier]}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 p-3">
                {list.map((hero) => (
                  <Link
                    key={hero.id}
                    href={`/heroes/${hero.slug}`}
                    className="group flex flex-col items-center gap-1 w-16 hover:scale-105 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-lg border border-dark-500 overflow-hidden group-hover:border-gold-500/60 transition-colors">
                      {hero.icon_url ? (
                        <Image src={hero.icon_url} alt={hero.name} width={48} height={48} className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-dark-600 flex items-center justify-center text-xs font-bold text-gold-400">
                          {hero.name[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-gold-400 transition-colors text-center leading-tight">
                      {hero.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
