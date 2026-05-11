"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { RotateCcw, Undo2, Search, Shield, Sword } from "lucide-react";
import type { Hero } from "@/types";
import { formatRoles } from "@/lib/utils";

// Sequência: 10 bans alternados, depois 10 picks alternados
// 0=ban azul, 1=ban verm, ... 9=ban verm, 10=pick azul, 11=pick verm, ...
type Team = "blue" | "red";
type Phase = "ban" | "pick";
type SlotType = "ban" | "pick";

interface Slot { team: Team; phase: Phase; hero: Hero | null; }

function buildSequence(): Array<{ team: Team; phase: Phase }> {
  const seq: Array<{ team: Team; phase: Phase }> = [];
  for (let i = 0; i < 10; i++) seq.push({ team: i % 2 === 0 ? "blue" : "red", phase: "ban" });
  for (let i = 0; i < 10; i++) seq.push({ team: i % 2 === 0 ? "blue" : "red", phase: "pick" });
  return seq;
}

const SEQUENCE = buildSequence();

const ROLE_LABELS: Record<string, string> = {
  Tank: "Tanque", Fighter: "Lutador", Assassin: "Assassino",
  Mage: "Mago", Marksman: "Atirador", Support: "Suporte", Jungle: "Selva",
};

interface Props { heroes: Hero[]; }

export default function DraftTool({ heroes }: Props) {
  const [slots, setSlots] = useState<(Hero | null)[]>(Array(20).fill(null));
  const [step, setStep]   = useState(0); // 0-19, 20 = done
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const usedIds = new Set(slots.filter(Boolean).map(h => h!.id));

  const current = step < 20 ? SEQUENCE[step] : null;
  const isDone  = step >= 20;

  const blueBans  = slots.slice(0, 10).filter((_, i) => SEQUENCE[i].team === "blue").slice(0, 5);
  const redBans   = slots.slice(0, 10).filter((_, i) => SEQUENCE[i].team === "red").slice(0, 5);
  const bluePicks = slots.slice(10, 20).filter((_, i) => SEQUENCE[i + 10].team === "blue").slice(0, 5);
  const redPicks  = slots.slice(10, 20).filter((_, i) => SEQUENCE[i + 10].team === "red").slice(0, 5);

  const filtered = useMemo(() => {
    return heroes.filter(h => {
      const matchRole = roleFilter === "ALL" || h.role.includes(roleFilter as any);
      const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [heroes, roleFilter, search]);

  function selectHero(hero: Hero) {
    if (step >= 20) return;
    if (usedIds.has(hero.id)) return;
    const next = [...slots];
    next[step] = hero;
    setSlots(next);
    setStep(s => s + 1);
  }

  function undo() {
    if (step === 0) return;
    const next = [...slots];
    next[step - 1] = null;
    setSlots(next);
    setStep(s => s - 1);
  }

  function reset() {
    setSlots(Array(20).fill(null));
    setStep(0);
    setSearch("");
  }

  const roles = ["ALL", "Tank", "Fighter", "Assassin", "Mage", "Marksman", "Support", "Jungle"];

  return (
    <div style={{ height: "calc(100vh - 56px)" }} className="flex flex-col overflow-hidden bg-dark-900">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-3 bg-dark-800 border-b border-dark-600 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="font-heading font-bold text-white text-sm">Simulador de Draft</h1>
          {current && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              current.team === "blue" ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                                     : "bg-red-600/20 text-red-400 border border-red-500/40"
            }`}>
              {current.team === "blue" ? "Time Azul" : "Time Vermelho"} — {current.phase === "ban" ? "BAN" : "PICK"}
            </span>
          )}
          {isDone && <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-600/20 text-green-400 border border-green-500/40">Draft Concluído</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={undo} disabled={step === 0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-dark-700 disabled:opacity-30 transition-colors">
            <Undo2 size={13} /> Desfazer
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
            <RotateCcw size={13} /> Reiniciar
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Time Azul ── */}
        <TeamPanel
          team="blue"
          bans={blueBans}
          picks={bluePicks}
          isActive={current?.team === "blue"}
          currentPhase={current?.phase}
        />

        {/* ── Centro: grid de heróis ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filtros */}
          <div className="px-4 py-3 border-b border-dark-700 space-y-2 shrink-0 bg-dark-800/50">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar herói..."
                className="w-full bg-dark-700 border border-dark-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-gray-600 outline-none focus:border-gold-500/50"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {roles.map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                    roleFilter === r ? "bg-gold-500 text-dark-900" : "bg-dark-700 text-gray-400 hover:text-white"
                  }`}
                >
                  {r === "ALL" ? "Todos" : (ROLE_LABELS[r] ?? r)}
                </button>
              ))}
            </div>
          </div>

          {/* Hero grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
              {filtered.map(hero => {
                const used = usedIds.has(hero.id);
                const isBanned = used && slots.findIndex(h => h?.id === hero.id) < 10;
                return (
                  <button
                    key={hero.id}
                    onClick={() => selectHero(hero)}
                    disabled={used || isDone}
                    className={`relative flex flex-col items-center gap-1 group transition-all ${
                      used ? "opacity-30 cursor-not-allowed" : "hover:scale-105 cursor-pointer"
                    }`}
                  >
                    <div className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      used ? "border-transparent" : "border-transparent group-hover:border-gold-500"
                    }`}>
                      {hero.icon_url
                        ? <Image src={hero.icon_url} alt={hero.name} fill sizes="60px" className="object-cover" />
                        : <div className="w-full h-full bg-dark-600 flex items-center justify-center text-xs font-black text-gold-400">{hero.name[0]}</div>
                      }
                      {isBanned && (
                        <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                          <span className="text-red-400 font-black text-lg">✕</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 truncate w-full text-center leading-tight">{hero.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-4 py-2 border-t border-dark-700 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Bans</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`h-1.5 w-5 rounded-full ${
                    i < step && i < 10 ? (SEQUENCE[i].team === "blue" ? "bg-blue-500" : "bg-red-500") : "bg-dark-600"
                  }`} />
                ))}
              </div>
              <span className="text-[10px] text-gray-500">Picks</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={`h-1.5 w-5 rounded-full ${
                    i + 10 < step ? (SEQUENCE[i + 10].team === "blue" ? "bg-blue-500" : "bg-red-500") : "bg-dark-600"
                  }`} />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 ml-auto">{Math.min(step, 20)}/20</span>
            </div>
          </div>
        </div>

        {/* ── Time Vermelho ── */}
        <TeamPanel
          team="red"
          bans={redBans}
          picks={redPicks}
          isActive={current?.team === "red"}
          currentPhase={current?.phase}
        />
      </div>
    </div>
  );
}

function TeamPanel({ team, bans, picks, isActive, currentPhase }: {
  team: Team;
  bans: (Hero | null)[];
  picks: (Hero | null)[];
  isActive: boolean;
  currentPhase?: Phase;
}) {
  const isBlue = team === "blue";
  const color  = isBlue ? "blue" : "red";
  const label  = isBlue ? "Time Azul" : "Time Vermelho";

  return (
    <div className={`w-48 flex flex-col border-dark-600 shrink-0 transition-all ${
      isBlue ? "border-r" : "border-l"
    } ${isActive ? (isBlue ? "bg-blue-950/20" : "bg-red-950/20") : "bg-dark-800/30"}`}>

      {/* Header */}
      <div className={`px-4 py-3 border-b border-dark-600 flex items-center gap-2 ${isActive ? "bg-dark-700/50" : ""}`}>
        <div className={`w-2 h-2 rounded-full ${isBlue ? "bg-blue-500" : "bg-red-500"} ${isActive ? "animate-pulse" : ""}`} />
        <span className={`text-xs font-bold ${isBlue ? "text-blue-400" : "text-red-400"}`}>{label}</span>
      </div>

      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Bans */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Shield size={10} className="text-gray-500" />
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Bans</span>
            {isActive && currentPhase === "ban" && <span className="text-[9px] text-gold-400 font-bold animate-pulse">← vez</span>}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const hero = bans[i] ?? null;
              return (
                <div key={i} className={`aspect-square rounded border ${hero ? "border-red-700/50" : "border-dark-600 border-dashed"} overflow-hidden`}>
                  {hero ? (
                    <div className="relative w-full h-full">
                      {hero.icon_url && <Image src={hero.icon_url} alt={hero.name} fill sizes="36px" className="object-cover grayscale opacity-60" />}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-red-400 font-black text-sm">✕</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-dark-700/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Picks */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sword size={10} className="text-gray-500" />
            <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Picks</span>
            {isActive && currentPhase === "pick" && <span className="text-[9px] text-gold-400 font-bold animate-pulse">← vez</span>}
          </div>
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const hero = picks[i] ?? null;
              return (
                <div key={i} className={`flex items-center gap-2 p-1.5 rounded-lg border ${
                  hero ? (isBlue ? "border-blue-700/50 bg-blue-900/10" : "border-red-700/50 bg-red-900/10") : "border-dark-600 border-dashed"
                }`}>
                  <div className={`w-8 h-8 rounded overflow-hidden shrink-0 border ${
                    hero ? (isBlue ? "border-blue-600/50" : "border-red-600/50") : "border-dark-600"
                  }`}>
                    {hero?.icon_url
                      ? <Image src={hero.icon_url} alt={hero.name} width={32} height={32} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-dark-700/50" />
                    }
                  </div>
                  <div className="min-w-0">
                    {hero ? (
                      <>
                        <p className="text-[10px] font-bold text-white truncate leading-tight">{hero.name}</p>
                        <p className="text-[9px] text-gray-500 truncate">{formatRoles(hero.role)}</p>
                      </>
                    ) : (
                      <p className="text-[9px] text-gray-600">—</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
