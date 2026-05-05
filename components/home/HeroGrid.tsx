"use client";

import { useState, useEffect, useCallback } from "react";
import HeroCard from "./HeroCard";
import type { Hero, HeroRole } from "@/types";
import { Search } from "lucide-react";

const ROLES: Array<{ label: string; value: HeroRole | "ALL" }> = [
  { label: "Todos", value: "ALL" },
  { label: "Tanque", value: "Tank" },
  { label: "Lutador", value: "Fighter" },
  { label: "Assassino", value: "Assassin" },
  { label: "Mago", value: "Mage" },
  { label: "Atirador", value: "Marksman" },
  { label: "Suporte", value: "Support" },
];

export default function HeroGrid() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [role, setRole] = useState<HeroRole | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (role !== "ALL") params.set("role", role);
    if (search.length >= 2) params.set("search", search);
    const res = await fetch(`/api/heroes?${params}`);
    const data = await res.json();
    setHeroes(data);
    setLoading(false);
  }, [role, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchHeroes, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchHeroes, search]);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-white mb-6">Todos os Heróis</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  role === r.value
                    ? "bg-gold-500 text-dark-900"
                    : "bg-dark-700 text-gray-400 hover:text-white border border-dark-500 hover:border-gold-500/50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-dark-700 border border-dark-500 rounded-lg px-3 py-1.5 focus-within:border-gold-500 transition-colors ml-auto">
            <Search size={14} className="text-gray-500" />
            <input
              type="text"
              placeholder="Filtrar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm outline-none w-32 placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-dark-700 animate-pulse" />
            ))}
          </div>
        ) : heroes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Nenhum herói encontrado.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {heroes.map((hero) => (
              <HeroCard key={hero.id} hero={hero} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
