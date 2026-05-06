"use client";

import { useState } from "react";
import Image from "next/image";
import { TrendingUp, TrendingDown, Clock, X } from "lucide-react";
import type { Hero } from "@/types";

type ChangeType = "buff" | "nerf" | "adjustment" | null;

const OPTIONS: { value: ChangeType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "buff",       label: "Buff",    icon: <TrendingUp size={14} />,   color: "border-green-500 text-green-400 bg-green-500/10" },
  { value: "nerf",       label: "Nerf",    icon: <TrendingDown size={14} />, color: "border-red-500 text-red-400 bg-red-500/10" },
  { value: "adjustment", label: "Ajuste",  icon: <Clock size={14} />,        color: "border-orange-500 text-orange-400 bg-orange-500/10" },
  { value: null,         label: "Limpar",  icon: <X size={14} />,            color: "border-dark-500 text-gray-500 hover:border-dark-400" },
];

interface Props {
  heroes: Hero[];
}

export default function IndicatorManager({ heroes }: Props) {
  const [indicators, setIndicators] = useState<Record<number, ChangeType>>(
    Object.fromEntries(heroes.map((h) => [h.id, h.change_type ?? null]))
  );
  const [saving, setSaving] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  async function setIndicator(heroId: number, value: ChangeType) {
    setSaving(heroId);
    await fetch(`/api/admin/heroes/${heroId}/indicator`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ change_type: value }),
    });
    setIndicators((prev) => ({ ...prev, [heroId]: value }));
    setSaving(null);
  }

  const filtered = heroes.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl space-y-4">
      <input
        type="text"
        placeholder="Buscar herói..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input w-64"
      />

      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] px-5 py-2.5 border-b border-dark-600 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          <span>Herói</span>
          <span>Indicador</span>
        </div>

        <div className="divide-y divide-dark-600 max-h-[600px] overflow-y-auto">
          {filtered.map((hero) => {
            const current = indicators[hero.id];
            return (
              <div key={hero.id} className="flex items-center justify-between px-5 py-3 gap-4">
                {/* Hero info */}
                <div className="flex items-center gap-3 min-w-0">
                  {hero.icon_url ? (
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-dark-500 shrink-0">
                      <Image src={hero.icon_url} alt={hero.name} fill sizes="36px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center text-sm font-black text-dark-400 shrink-0">
                      {hero.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{hero.name}</p>
                    <p className="text-[10px] text-gray-500">{hero.role.join(" / ")}</p>
                  </div>
                </div>

                {/* Options */}
                <div className="flex gap-1.5 shrink-0">
                  {OPTIONS.map((opt) => {
                    const isActive = current === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        onClick={() => setIndicator(hero.id, opt.value)}
                        disabled={saving === hero.id}
                        title={opt.label}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all disabled:opacity-50 ${
                          isActive ? opt.color : "border-dark-500 text-gray-600 hover:border-dark-400"
                        }`}
                      >
                        {opt.icon}
                        <span className="hidden sm:inline">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
