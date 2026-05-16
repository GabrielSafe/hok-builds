"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ROLE_LABELS } from "@/lib/utils";

interface QuickHero {
  id: number;
  name: string;
  slug: string;
  role: string[];
  difficulty: number;
  icon_url: string | null;
  stats?: { tier: string } | null;
  build?: {
    items: Array<{ item_name: string; item_image_url: string | null }>;
    spells: Array<{ spell_name: string; spell_image_url: string | null }>;
  } | null;
}

const TIER_COLORS: Record<string, string> = {
  S: "#FACC15", A: "#4ADE80", B: "#60A5FA", C: "#A1A1AA", D: "#F87171",
};


interface Props {
  heroId: number;
  rect: DOMRect;
}

const TOOLTIP_W = 280;

export default function HeroTooltip({ heroId, rect }: Props) {
  const [hero, setHero] = useState<QuickHero | null>(null);

  useEffect(() => {
    setHero(null);
    fetch(`/api/heroes/${heroId}/quick`)
      .then(r => r.ok ? r.json() : null)
      .then(setHero);
  }, [heroId]);

  // Posição: centralizado acima do card, ou abaixo se não couber
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1400;

  const cardCenterX = rect.left + rect.width / 2;
  const aboveCard = rect.top - 8; // topo do card com gap
  const showBelow = aboveCard < 220; // se não couber acima, mostra abaixo

  let left = cardCenterX - TOOLTIP_W / 2;
  left = Math.max(8, Math.min(left, viewportW - TOOLTIP_W - 8));

  const top = showBelow ? rect.bottom + 8 : undefined;
  const bottom = showBelow ? undefined : viewportH - rect.top + 8;

  const tier = hero?.stats?.tier ?? "B";
  const tierColor = TIER_COLORS[tier] ?? "#60A5FA";
  const items = hero?.build?.items?.slice(0, 5) ?? [];
  const spells = hero?.build?.spells ?? [];

  return (
    <div
      style={{
        position: "fixed",
        left,
        top: showBelow ? top : undefined,
        bottom: showBelow ? undefined : bottom,
        width: TOOLTIP_W,
        zIndex: 9999,
        pointerEvents: "none",
        animation: "hero-card-in 0.15s ease forwards",
      }}
    >
      {/* Arrow */}
      {!showBelow && (
        <div style={{
          position: "absolute", bottom: -6, left: cardCenterX - left - 6,
          width: 12, height: 12,
          background: "#1E293B",
          border: "1px solid #374151",
          transform: "rotate(45deg)",
          borderTop: "none", borderLeft: "none",
        }} />
      )}
      {showBelow && (
        <div style={{
          position: "absolute", top: -6, left: cardCenterX - left - 6,
          width: 12, height: 12,
          background: "#1E293B",
          border: "1px solid #374151",
          transform: "rotate(45deg)",
          borderBottom: "none", borderRight: "none",
        }} />
      )}

      {/* Card */}
      <div style={{
        background: "linear-gradient(135deg,#1E293B,#1C1F2A)",
        border: "1px solid #374151",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 16px 40px rgba(0,0,0,.7), 0 0 0 1px rgba(212,160,23,.1)",
      }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-3">
          {hero?.icon_url ? (
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-dark-500">
              <Image src={hero.icon_url} alt={hero?.name ?? ""} fill sizes="48px" className="object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-dark-600 animate-pulse shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            {hero ? (
              <>
                <p className="font-heading font-bold text-white text-sm truncate">{hero.name}</p>
                <p className="text-[10px] text-gray-400">{hero.role.map(r => ROLE_LABELS[r] ?? r).join(" / ")}</p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < (hero.difficulty ?? 0) ? "bg-gold-400" : "bg-dark-500"}`} />
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <div className="h-3 bg-dark-600 rounded animate-pulse w-24" />
                <div className="h-2 bg-dark-600 rounded animate-pulse w-16" />
              </div>
            )}
          </div>

          {/* Tier */}
          <div className="shrink-0 text-center">
            <p className="text-[9px] text-gray-500 uppercase">Tier</p>
            <p className="text-xl font-black" style={{ color: tierColor }}>{tier}</p>
          </div>
        </div>

        {/* Build preview */}
        {(items.length > 0 || spells.length > 0) && (
          <div className="px-3 pb-2 border-t border-dark-600 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {items.map((item, i) => (
                <div key={i} className="w-8 h-8 rounded-lg border border-dark-500 overflow-hidden bg-dark-600">
                  {item.item_image_url
                    ? <Image src={item.item_image_url} alt={item.item_name} width={32} height={32} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-600">{item.item_name[0]}</div>
                  }
                </div>
              ))}
              {spells.map((s, i) => (
                <div key={i} className="w-8 h-8 rounded-lg border border-green-700/40 overflow-hidden bg-dark-600">
                  {s.spell_image_url
                    ? <Image src={s.spell_image_url} alt={s.spell_name} width={32} height={32} className="w-full h-full object-cover" />
                    : null
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ pointerEvents: "auto" }}>
          <Link
            href={hero ? `/heroes/${hero.slug}` : "#"}
            className="flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-bold text-dark-900 bg-gold-500 hover:bg-gold-400 transition-colors w-full"
          >
            Ver Guia Completo <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
