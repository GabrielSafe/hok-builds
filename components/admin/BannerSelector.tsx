"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Hero } from "@/types";

interface Props {
  heroes: Hero[];
  featuredIds: number[];
}

export default function BannerSelector({ heroes, featuredIds: initial }: Props) {
  const [featuredIds, setFeaturedIds] = useState<Set<number>>(new Set(initial));
  const [saving, setSaving] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  async function toggleFeatured(hero: Hero) {
    const isCurrently = featuredIds.has(hero.id);
    setSaving(hero.id);
    setSuccess(false);

    await fetch(`/api/admin/heroes/${hero.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...hero, is_featured: !isCurrently }),
    });

    setFeaturedIds((prev) => {
      const next = new Set(prev);
      if (isCurrently) next.delete(hero.id);
      else next.add(hero.id);
      return next;
    });

    setSaving(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
        <p className="text-xs font-bold text-white uppercase tracking-wider">
          Selecionar Heróis
        </p>
        <p className="text-xs text-gray-500">
          {featuredIds.size} selecionado{featuredIds.size !== 1 ? "s" : ""} — clique para ativar/desativar
        </p>
      </div>

      {success && (
        <div className="px-5 py-2 bg-green-900/30 border-b border-green-800 text-xs text-green-400">
          Banner atualizado com sucesso!
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 max-h-[480px] overflow-y-auto">
        {heroes.map((hero) => {
          const isFeatured = featuredIds.has(hero.id);
          const isSaving = saving === hero.id;
          return (
            <button
              key={hero.id}
              onClick={() => toggleFeatured(hero)}
              disabled={isSaving}
              className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                isFeatured
                  ? "border-gold-500 shadow-[0_0_12px_rgba(212,160,23,0.4)]"
                  : "border-dark-500 hover:border-gold-500/50"
              } ${isSaving ? "opacity-50" : ""}`}
            >
              <div className="relative h-24 bg-dark-600">
                {hero.splash_url ? (
                  <Image
                    src={hero.splash_url}
                    alt={hero.name}
                    fill
                    sizes="200px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-black text-dark-500">
                    {hero.name[0]}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
              </div>

              <div className="p-2 bg-dark-700">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white truncate">{hero.name}</p>
                  {isFeatured && <Star size={12} className="text-gold-400 shrink-0 fill-gold-400" />}
                </div>
                <p className="text-[10px] text-gray-500">{hero.role}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
