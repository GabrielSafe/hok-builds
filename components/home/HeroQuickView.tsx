"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { HeroRole } from "@/types";

interface QuickHero {
  id: number;
  name: string;
  slug: string;
  role: HeroRole;
  difficulty: number;
  description: string | null;
  icon_url: string | null;
  splash_url: string | null;
  total_views?: number;
  stats?: {
    tier: string;
  } | null;
  build?: {
    items: Array<{ item_name: string; item_image_url: string | null }>;
    arcana: Array<{ arcana_name: string; arcana_image_url: string | null; quantity: number }>;
    spells: Array<{ spell_name: string; spell_image_url: string | null }>;
    skill_order: Array<{ skill_name: string; skill_key: string; skill_image_url: string | null }>;
  } | null;
}

const TIER_COLORS: Record<string, string> = {
  S: "text-yellow-400",
  A: "text-green-400",
  B: "text-blue-400",
  C: "text-gray-400",
  D: "text-red-400",
};

const ROLE_LABELS: Record<string, string> = {
  Tank: "Tanque", Fighter: "Lutador", Assassin: "Assassino",
  Mage: "Mago", Marksman: "Atirador", Support: "Suporte",
};

interface Props {
  heroId: number | null;
}

export default function HeroQuickView({ heroId }: Props) {
  const [hero, setHero] = useState<QuickHero | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!heroId) return;
    setLoading(true);
    fetch(`/api/heroes/${heroId}/quick`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setHero(data); setLoading(false); });
  }, [heroId]);

  if (!heroId || (!hero && !loading)) return null;

  if (loading || !hero) {
    return (
      <div className="rounded-xl border border-dark-600 bg-dark-700 p-4 h-40 animate-pulse" />
    );
  }

  const tierColor = TIER_COLORS[hero.stats?.tier ?? "B"] ?? "text-gray-400";

  return (
    <div className="rounded-xl border border-dark-600 bg-dark-800 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Hero info */}
        <div className="relative p-5 flex items-start gap-4 border-b lg:border-b-0 lg:border-r border-dark-600">
          {hero.splash_url && (
            <div className="absolute inset-0 overflow-hidden">
              <Image src={hero.splash_url} alt={hero.name} fill sizes="300px" className="object-cover object-top opacity-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-800/95 to-dark-800/80" />
            </div>
          )}
          <div className="relative z-10 flex items-start gap-3">
            {hero.icon_url && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gold-500/40 shrink-0">
                <Image src={hero.icon_url} alt={hero.name} fill sizes="64px" className="object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-black text-white">{hero.name}</h3>
              <p className="text-xs text-gray-400">{ROLE_LABELS[hero.role]}</p>
              <div className="flex gap-0.5 mt-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < hero.difficulty ? "bg-gold-400" : "bg-dark-500"}`} />
                ))}
              </div>
              {hero.description && (
                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2 max-w-[180px]">
                  {hero.description}
                </p>
              )}
              <Link
                href={`/heroes/${hero.slug}`}
                className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-dark-900 bg-gold-500 hover:bg-gold-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Ver Guia Completo <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Build */}
        <div className="lg:col-span-2 p-5 border-b lg:border-b-0 lg:border-r border-dark-600">
          {hero.build ? (
            <div className="space-y-4">
              {/* Items */}
              {(hero.build.items?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-2">Build Recomendada — Itens</p>
                  <div className="flex flex-wrap gap-1.5">
                    {hero.build.items.map((item, i) => (
                      <div key={i} className="group relative">
                        <div className="w-10 h-10 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                          {item.item_image_url
                            ? <Image src={item.item_image_url} alt={item.item_name} width={40} height={40} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">{item.item_name[0]}</div>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Arcana */}
                {(hero.build.arcana?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-2">Arcana</p>
                    <div className="flex flex-wrap gap-1.5 items-end">
                      {hero.build.arcana.slice(0, 3).map((a, i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          <div className="w-9 h-9 rounded-full border border-dark-500 overflow-hidden bg-dark-600">
                            {a.arcana_image_url
                              ? <Image src={a.arcana_image_url} alt={a.arcana_name} width={36} height={36} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">{a.arcana_name[0]}</div>
                            }
                          </div>
                          <span className="text-[9px] text-gray-500">{a.quantity}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spells */}
                {(hero.build.spells?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-2">Feitiços</p>
                    <div className="flex gap-1.5">
                      {hero.build.spells.map((s, i) => (
                        <div key={i} className="w-10 h-10 rounded-lg border border-dark-500 overflow-hidden bg-dark-600">
                          {s.spell_image_url
                            ? <Image src={s.spell_image_url} alt={s.spell_name} width={40} height={40} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">{s.spell_name[0]}</div>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              Build ainda não cadastrada
            </div>
          )}
        </div>

        {/* Stats + Skills */}
        <div className="p-5">
          {/* Skill order */}
          {(hero.build?.skill_order?.length ?? 0) > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-2">Habilidades</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {hero.build!.skill_order.map((s, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-lg border border-dark-500 overflow-hidden bg-dark-600">
                      {s.skill_image_url
                        ? <Image src={s.skill_image_url} alt={s.skill_name} width={32} height={32} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gold-400">{s.skill_key.toUpperCase()}</div>
                      }
                    </div>
                    {i < hero.build!.skill_order.length - 1 && <span className="text-gray-600 text-xs">›</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tier */}
          {hero.stats && (
            <div>
              <p className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-2">Tier</p>
              <div className="bg-dark-700 rounded-lg p-3 text-center w-16">
                <p className={`text-2xl font-black ${tierColor}`}>{hero.stats.tier}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
