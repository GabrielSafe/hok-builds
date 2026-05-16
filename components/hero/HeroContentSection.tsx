"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, Shield } from "lucide-react";
import HeroBuildSection from "@/components/hero/HeroBuildSection";
import type { Build, CreatorType } from "@/types";
import Link from "next/link";

interface RichBuild extends Build {
  creator_name?: string | null;
  creator_avatar?: string | null;
  creator_type?: CreatorType | null;
}

interface CounterHero {
  id: number;
  counter_hero_name: string;
  counter_hero_slug: string;
  counter_hero_icon: string | null;
  type: "strong_against" | "weak_against";
  creator_id: number | null;
}

interface Props {
  builds: RichBuild[];
  counters: CounterHero[];
  skills: React.ReactNode;
}

const TYPE_BADGE: Record<CreatorType, { label: string; color: string }> = {
  pro_player: { label: "Pro Player", color: "text-gold-400 bg-gold-500/10" },
  streamer:   { label: "Streamer",   color: "text-purple-400 bg-purple-500/10" },
  coach:      { label: "Coach",      color: "text-blue-400 bg-blue-500/10" },
};

export default function HeroContentSection({ builds, counters, skills }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(builds[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  const selected = builds.find(b => b.id === selectedId) ?? builds[0] ?? null;
  const selectedCreatorId = selected?.creator_id ?? null;
  const isCreatorBuild = !!selectedCreatorId;

  const activeCounters = counters.filter(c =>
    selectedCreatorId === null ? c.creator_id === null : c.creator_id === selectedCreatorId
  );
  const weakAgainst = activeCounters.filter(c => c.type === "weak_against");
  const strongAgainst = activeCounters.filter(c => c.type === "strong_against");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Build — 2/3 */}
      <div className="lg:col-span-2">
        {builds.length > 1 && (
          <div className="relative mb-4">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dark-600 bg-dark-700 hover:border-gold-500/50 transition-colors text-sm w-full max-w-xs"
            >
              {isCreatorBuild && selected?.creator_avatar && (
                <Image src={selected.creator_avatar} alt={selected.creator_name ?? ""} width={24} height={24} className="w-6 h-6 rounded-full object-cover shrink-0" />
              )}
              <span className="text-white font-semibold">
                {isCreatorBuild ? selected?.creator_name : "Build Padrão"}
              </span>
              {isCreatorBuild && selected?.creator_type && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TYPE_BADGE[selected.creator_type].color}`}>
                  {TYPE_BADGE[selected.creator_type].label}
                </span>
              )}
              <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute top-full mt-1 left-0 min-w-[240px] bg-dark-700 border border-dark-600 rounded-xl overflow-hidden shadow-2xl z-20">
                {builds.map(b => {
                  const isCreator = !!b.creator_id;
                  const isActive = b.id === selectedId;
                  const badge = b.creator_type ? TYPE_BADGE[b.creator_type] : null;
                  return (
                    <button key={b.id} onClick={() => { setSelectedId(b.id); setOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isActive ? "bg-gold-500/10 border-l-2 border-gold-500" : "hover:bg-dark-600"}`}
                    >
                      {isCreator && b.creator_avatar ? (
                        <Image src={b.creator_avatar} alt={b.creator_name ?? ""} width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-dark-600 border border-dark-500 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-gold-400">STD</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className={`text-sm font-semibold ${isActive ? "text-gold-400" : "text-white"}`}>
                            {isCreator ? b.creator_name : "Build Padrão"}
                          </p>
                          {badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
                              {badge.label}
                            </span>
                          )}
                        </div>
                        {b.patch_version && <p className="text-[10px] text-gray-500">Patch {b.patch_version}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selected ? (
          <HeroBuildSection build={selected as Build} />
        ) : (
          <div className="rounded-xl p-10 text-center" style={{ background: "linear-gradient(135deg,#1E293B,#1F1F23)", border: "1px solid #27272A" }}>
            <Shield size={32} style={{ color: "#3F3F46", margin: "0 auto 12px" }} />
            <p className="font-heading font-semibold text-gray-400">Build em breve</p>
          </div>
        )}
      </div>

      {/* Sidebar — 1/3 */}
      <div className="space-y-4">
        {skills}

        {activeCounters.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-dark-600" style={{ background: "linear-gradient(135deg,#1E293B,#1F1F23)" }}>
            <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
              <p className="section-label">Counters</p>
              {isCreatorBuild && (
                <span className="text-[10px] text-gold-400 font-semibold">
                  Visão de {selected?.creator_name}
                </span>
              )}
            </div>
            <div className="p-4 space-y-4">
              {weakAgainst.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">Pick Counter</p>
                  <div className="flex gap-3">
                    {weakAgainst.map(c => (
                      <Link key={c.id} href={`/heroes/${c.counter_hero_slug}`} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-red-500/40 group-hover:border-red-400 transition-colors bg-dark-600">
                          {c.counter_hero_icon
                            ? <Image src={c.counter_hero_icon} alt={c.counter_hero_name} width={48} height={48} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xs font-black text-red-400">{c.counter_hero_name[0]}</div>
                          }
                        </div>
                        <span className="text-[9px] text-gray-500 text-center w-12 truncate">{c.counter_hero_name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {strongAgainst.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-2">Bom Contra</p>
                  <div className="flex gap-3">
                    {strongAgainst.map(c => (
                      <Link key={c.id} href={`/heroes/${c.counter_hero_slug}`} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-green-500/40 group-hover:border-green-400 transition-colors bg-dark-600">
                          {c.counter_hero_icon
                            ? <Image src={c.counter_hero_icon} alt={c.counter_hero_name} width={48} height={48} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xs font-black text-green-400">{c.counter_hero_name[0]}</div>
                          }
                        </div>
                        <span className="text-[9px] text-gray-500 text-center w-12 truncate">{c.counter_hero_name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
