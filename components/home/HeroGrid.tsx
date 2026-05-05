"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Eye } from "lucide-react";
import { TankIcon, FighterIcon, AssassinIcon, MageIcon, MarksmanIcon, SupportIcon } from "./RoleIcons";
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
];

const SORT_OPTIONS = [
  { label: "A - Z", value: "az" },
  { label: "Z - A", value: "za" },
  { label: "Mais Vistos", value: "views" },
];

interface Props {
  onHeroHover?: (hero: Hero | null) => void;
}

export default function HeroGrid({ onHeroHover }: Props) {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [role, setRole] = useState<HeroRole | "ALL">("ALL");
  const [sort, setSort] = useState("az");
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (role !== "ALL") params.set("role", role);
    params.set("limit", "100");
    const res = await fetch(`/api/heroes?${params}`);
    let data: Hero[] = await res.json();

    if (sort === "za") data = [...data].sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "views") data = [...data].sort((a, b) => (b.total_views ?? 0) - (a.total_views ?? 0));

    setHeroes(data);
    setLoading(false);
  }, [role, sort]);

  useEffect(() => { fetchHeroes(); }, [fetchHeroes]);

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-gold-500 rounded-sm" />
        <h2 className="font-heading font-bold text-sm text-white uppercase tracking-widest">Todos os Heróis</h2>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold tracking-wide transition-all ${
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
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {heroes.map((hero) => (
            <HeroCard
              key={hero.id}
              hero={hero}
              onHover={onHeroHover}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroCard({ hero, onHover }: { hero: Hero; onHover?: (h: Hero | null) => void }) {
  return (
    <Link
      href={`/heroes/${hero.slug}`}
      className="group block"
      onMouseEnter={() => onHover?.(hero)}
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
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
