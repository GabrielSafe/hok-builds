"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Eye, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { TankIcon, FighterIcon, AssassinIcon, MageIcon, MarksmanIcon, SupportIcon, JungleIcon } from "./RoleIcons";
import { formatNumber } from "@/lib/utils";
import type { Hero, HeroRole } from "@/types";

const ROLES: Array<{ label: string; value: HeroRole | "ALL"; icon: React.ReactNode }> = [
  { label: "Todos", value: "ALL", icon: null },
  { label: "Tanque", value: "Tank", icon: <TankIcon size={14} /> },
  { label: "Lutador", value: "Fighter", icon: <FighterIcon size={14} /> },
  { label: "Assassino", value: "Assassin", icon: <AssassinIcon size={14} /> },
  { label: "Mago", value: "Mage", icon: <MageIcon size={14} /> },
  { label: "Atirador", value: "Marksman", icon: <MarksmanIcon size={14} /> },
  { label: "Suporte", value: "Support", icon: <SupportIcon size={14} /> },
  { label: "Selva", value: "Jungle", icon: <JungleIcon size={14} /> },
];

const SORT_OPTIONS = [
  { label: "A - Z", value: "az" },
  { label: "Z - A", value: "za" },
  { label: "Mais Vistos", value: "views" },
];

interface Props {
  onHeroHover?: (hero: Hero | null, rect?: DOMRect) => void;
}

export default function HeroGrid({ onHeroHover }: Props) {
  const [allHeroes, setAllHeroes] = useState<Hero[]>([]);
  const [role, setRole] = useState<HeroRole | "ALL">("ALL");
  const [sort, setSort] = useState("az");
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  // Carrega todos os heróis uma única vez
  useEffect(() => {
    fetch("/api/heroes?limit=200")
      .then(r => r.json())
      .then((data: Hero[]) => { setAllHeroes(data); setLoading(false); });
  }, []);

  // Filtra e ordena no browser — sem nova requisição
  const heroes = useMemo(() => {
    let data = role === "ALL" ? allHeroes : allHeroes.filter(h => h.role.includes(role as HeroRole));
    if (sort === "za") data = [...data].sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "views") data = [...data].sort((a, b) => (b.total_views ?? 0) - (a.total_views ?? 0));
    else data = [...data].sort((a, b) => a.name.localeCompare(b.name));
    return data;
  }, [allHeroes, role, sort]);

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-gold-500 rounded-sm" />
        <h2 className="font-heading font-bold text-sm text-white uppercase tracking-widest">Todos os Heróis</h2>
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1 min-w-0 scrollbar-hide">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold tracking-wide transition-all shrink-0 ${
                role === r.value
                  ? "bg-gold-500 text-dark-900"
                  : "bg-dark-700 text-gray-400 hover:text-white border border-dark-600 hover:border-dark-400"
              }`}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-gray-300 hover:border-dark-400 transition-colors"
          >
            {SORT_OPTIONS.find((s) => s.value === sort)?.label}
            <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 bg-dark-700 border border-dark-600 rounded-lg overflow-hidden shadow-xl z-20 min-w-[120px]">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setSort(s.value); setSortOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-dark-600 transition-colors ${
                    sort === s.value ? "text-gold-400" : "text-gray-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-dark-700 animate-pulse" />
          ))}
        </div>
      ) : heroes.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">Nenhum herói encontrado.</div>
      ) : (
        <div key={`${role}-${sort}`} className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {heroes.map((hero, index) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              index={index}
              onHover={onHeroHover}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroCard({ hero, index, onHover }: { hero: Hero; index: number; onHover?: (h: Hero | null, rect?: DOMRect) => void }) {
  return (
    <Link
      href={`/heroes/${hero.slug}`}
      className="hero-card-animate group block"
      style={{ animationDelay: `${Math.min(index * 25, 400)}ms` }}
      onMouseEnter={(e) => onHover?.(hero, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative overflow-hidden rounded-xl border-2 border-transparent bg-dark-700 transition-all duration-200 group-hover:border-gold-500 group-hover:shadow-[0_0_16px_rgba(212,160,23,0.35)]">
        <div className="relative aspect-square">
          {hero.icon_url ? (
            <Image
              src={hero.icon_url}
              alt={hero.name}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-600 to-dark-500 flex items-center justify-center">
              <span className="text-xl font-black text-dark-400">{hero.name[0]}</span>
            </div>
          )}

          {hero.change_type === "buff" && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <TrendingUp size={11} className="text-white" strokeWidth={3} />
            </div>
          )}
          {hero.change_type === "nerf" && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
              <TrendingDown size={11} className="text-white" strokeWidth={3} />
            </div>
          )}
          {hero.change_type === "adjustment" && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
              <Clock size={11} className="text-white" strokeWidth={3} />
            </div>
          )}
        </div>
        <div className="px-1 pb-1.5 pt-1">
          <p className="text-[11px] font-semibold text-gray-300 truncate text-center leading-tight group-hover:text-gold-400 transition-colors">
            {hero.name}
          </p>
        </div>
      </div>
    </Link>
  );
}
