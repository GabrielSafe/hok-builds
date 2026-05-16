"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { Hero, Creator } from "@/types";

interface Counter {
  id: number;
  counter_hero_id: number;
  counter_hero_name: string;
  counter_hero_slug: string;
  counter_hero_icon: string | null;
  type: "strong_against" | "weak_against";
  creator_id: number | null;
}

interface Props {
  heroId: number;
  allHeroes: Hero[];
  proPlayers: Creator[];
}

const SECTIONS = [
  { type: "weak_against" as const, label: "Pick Counter", sublabel: "Heróis bons CONTRA este", color: "text-red-400" },
  { type: "strong_against" as const, label: "Bom Contra", sublabel: "Heróis que este BATE BEM", color: "text-green-400" },
];

export default function CountersEditor({ heroId, allHeroes, proPlayers }: Props) {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [search, setSearch] = useState<Record<string, string>>({ weak_against: "", strong_against: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadCounters(); }, []);

  async function loadCounters() {
    const res = await fetch(`/api/admin/heroes/${heroId}/counters`);
    setCounters(await res.json());
  }

  const activeCounters = counters.filter(c =>
    selectedPlayerId === null ? c.creator_id === null : c.creator_id === selectedPlayerId
  );

  async function addCounter(counter_hero_id: number, type: "strong_against" | "weak_against") {
    const existing = activeCounters.filter(c => c.type === type);
    if (existing.length >= 2) return;
    setSaving(true);
    await fetch(`/api/admin/heroes/${heroId}/counters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counter_hero_id, type, creator_id: selectedPlayerId }),
    });
    await loadCounters();
    setSearch(prev => ({ ...prev, [type]: "" }));
    setSaving(false);
  }

  async function removeCounter(counter_id: number) {
    await fetch(`/api/admin/heroes/${heroId}/counters`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counter_id }),
    });
    setCounters(prev => prev.filter(c => c.id !== counter_id));
  }

  function getFiltered(type: string) {
    const q = search[type]?.toLowerCase() ?? "";
    const usedIds = activeCounters.map(c => c.counter_hero_id);
    return allHeroes
      .filter(h => h.id !== heroId && !usedIds.includes(h.id) && h.name.toLowerCase().includes(q))
      .slice(0, 5);
  }

  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-dark-600">
        <p className="section-label">Counters</p>
      </div>

      {/* Player tabs */}
      <div className="flex gap-1 px-5 pt-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setSelectedPlayerId(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${selectedPlayerId === null ? "bg-gold-500 text-dark-900" : "bg-dark-600 text-gray-400 hover:text-white"}`}
        >
          Padrão
        </button>
        {proPlayers.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlayerId(p.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${selectedPlayerId === p.id ? "bg-gold-500 text-dark-900" : "bg-dark-600 text-gray-400 hover:text-white"}`}
          >
            {p.avatar_url && <Image src={p.avatar_url} alt={p.name} width={16} height={16} className="w-4 h-4 rounded-full object-cover" />}
            {p.name}
          </button>
        ))}
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {SECTIONS.map(section => {
          const sectionCounters = activeCounters.filter(c => c.type === section.type);
          const filtered = getFiltered(section.type);
          const canAdd = sectionCounters.length < 2;

          return (
            <div key={section.type}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${section.color}`}>{section.label}</p>
              <p className="text-[10px] text-gray-500 mb-3">{section.sublabel}</p>

              <div className="flex gap-2 mb-3 min-h-[56px]">
                {sectionCounters.map(c => (
                  <div key={c.id} className="relative group">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-dark-500 bg-dark-600">
                      {c.counter_hero_icon
                        ? <Image src={c.counter_hero_icon} alt={c.counter_hero_name} width={56} height={56} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xs font-black text-gold-400">{c.counter_hero_name[0]}</div>
                      }
                    </div>
                    <p className="text-[9px] text-gray-500 text-center mt-0.5 truncate w-14">{c.counter_hero_name}</p>
                    <button
                      onClick={() => removeCounter(c.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={8} className="text-white" />
                    </button>
                  </div>
                ))}
                {Array.from({ length: 2 - sectionCounters.length }).map((_, i) => (
                  <div key={i} className="w-14 h-14 rounded-xl border-2 border-dashed border-dark-500 bg-dark-600/30" />
                ))}
              </div>

              {canAdd && (
                <div className="relative">
                  <input
                    type="text"
                    value={search[section.type]}
                    onChange={e => setSearch(prev => ({ ...prev, [section.type]: e.target.value }))}
                    placeholder="Buscar herói..."
                    className="input text-xs"
                    disabled={saving}
                  />
                  {search[section.type] && filtered.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-dark-600 border border-dark-500 rounded-lg overflow-hidden shadow-xl z-20">
                      {filtered.map(h => (
                        <button key={h.id} type="button" onClick={() => addCounter(h.id, section.type)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-dark-500 transition-colors text-left">
                          {h.icon_url && <Image src={h.icon_url} alt={h.name} width={24} height={24} className="w-6 h-6 rounded object-cover" />}
                          <span className="text-xs text-white">{h.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!canAdd && <p className="text-[10px] text-gray-600">Máximo de 2 atingido</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
