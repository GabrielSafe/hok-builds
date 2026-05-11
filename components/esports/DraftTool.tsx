"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { RotateCcw, Undo2, Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Hero } from "@/types";
import { formatRoles } from "@/lib/utils";

type Team = "blue" | "red";
type Phase = "ban" | "pick";

// Sequência oficial HOK competitivo — 18 passos
const SEQ: Array<{ team: Team; phase: Phase; label: string }> = [
  // Fase 1 — Bans (4)
  { team: "blue", phase: "ban",  label: "Fase 1 — Bans" },  // 0
  { team: "red",  phase: "ban",  label: "Fase 1 — Bans" },  // 1
  { team: "blue", phase: "ban",  label: "Fase 1 — Bans" },  // 2
  { team: "red",  phase: "ban",  label: "Fase 1 — Bans" },  // 3
  // Fase 1 — Picks (6)
  { team: "blue", phase: "pick", label: "Fase 1 — Picks" }, // 4  (Blue 1st pick)
  { team: "red",  phase: "pick", label: "Fase 1 — Picks" }, // 5
  { team: "red",  phase: "pick", label: "Fase 1 — Picks" }, // 6  (Red 2 seguidos)
  { team: "blue", phase: "pick", label: "Fase 1 — Picks" }, // 7
  { team: "blue", phase: "pick", label: "Fase 1 — Picks" }, // 8  (Blue 2 seguidos)
  { team: "red",  phase: "pick", label: "Fase 1 — Picks" }, // 9  (Red 3º pick)
  // Fase 2 — Bans (4)
  { team: "red",  phase: "ban",  label: "Fase 2 — Bans" },  // 10 (Red bana primeiro)
  { team: "blue", phase: "ban",  label: "Fase 2 — Bans" },  // 11
  { team: "red",  phase: "ban",  label: "Fase 2 — Bans" },  // 12
  { team: "blue", phase: "ban",  label: "Fase 2 — Bans" },  // 13
  // Fase 2 — Picks (4)
  { team: "red",  phase: "pick", label: "Fase 2 — Picks" }, // 14 (Red 4º pick)
  { team: "blue", phase: "pick", label: "Fase 2 — Picks" }, // 15
  { team: "blue", phase: "pick", label: "Fase 2 — Picks" }, // 16 (Blue last picks)
  { team: "red",  phase: "pick", label: "Fase 2 — Picks" }, // 17 (Red last pick)
];

// Índices por time
const BLUE_BAN_IDX  = SEQ.reduce<number[]>((a, s, i) => s.team === "blue" && s.phase === "ban"  ? [...a, i] : a, []);
const RED_BAN_IDX   = SEQ.reduce<number[]>((a, s, i) => s.team === "red"  && s.phase === "ban"  ? [...a, i] : a, []);
const BLUE_PICK_IDX = SEQ.reduce<number[]>((a, s, i) => s.team === "blue" && s.phase === "pick" ? [...a, i] : a, []);
const RED_PICK_IDX  = SEQ.reduce<number[]>((a, s, i) => s.team === "red"  && s.phase === "pick" ? [...a, i] : a, []);

const ROLE_LABELS: Record<string, string> = {
  Tank: "Tanque", Fighter: "Lutador", Assassin: "Assassino",
  Mage: "Mago", Marksman: "Atirador", Support: "Suporte", Jungle: "Selva",
};
const ROLES = ["ALL", "Tank", "Fighter", "Assassin", "Mage", "Marksman", "Support", "Jungle"];

function slotIndex(step: number, team: Team, phase: Phase) {
  let c = 0;
  for (let i = 0; i < step; i++)
    if (SEQ[i].team === team && SEQ[i].phase === phase) c++;
  return c;
}

interface Props { heroes: Hero[]; }

export default function DraftTool({ heroes }: Props) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/esports/logout", { method: "POST" });
    router.push("/esports/login");
    router.refresh();
  }
  const [slots, setSlots] = useState<(Hero | null)[]>(Array(18).fill(null));
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");

  const usedIds = new Set(slots.filter(Boolean).map(h => h!.id));
  const cur = step < 18 ? SEQ[step] : null;
  const done = step >= 18;

  const blueBans  = BLUE_BAN_IDX.map(i => slots[i] ?? null);   // 4 slots
  const redBans   = RED_BAN_IDX.map(i => slots[i] ?? null);    // 4 slots
  const bluePicks = BLUE_PICK_IDX.map(i => slots[i] ?? null);  // 5 slots
  const redPicks  = RED_PICK_IDX.map(i => slots[i] ?? null);   // 5 slots

  const filtered = useMemo(() => heroes.filter(h =>
    (role === "ALL" || h.role.includes(role as any)) &&
    h.name.toLowerCase().includes(search.toLowerCase())
  ), [heroes, role, search]);

  function select(hero: Hero) {
    if (done || usedIds.has(hero.id)) return;
    const next = [...slots]; next[step] = hero;
    setSlots(next); setStep(s => s + 1);
  }

  function undo() {
    if (step === 0) return;
    const next = [...slots]; next[step - 1] = null;
    setSlots(next); setStep(s => s - 1);
  }

  function reset() { setSlots(Array(18).fill(null)); setStep(0); setSearch(""); }

  const activeIdx = cur ? slotIndex(step, cur.team, cur.phase) : -1;
  const phaseLabel = cur?.label ?? (done ? "Draft Concluído" : "");

  return (
    <div className="flex flex-col overflow-hidden select-none"
      style={{ height: "calc(100vh - 56px)", background: "linear-gradient(180deg,#0c1525 0%,#0B0F17 100%)" }}>

      {/* ── Top bar: bans + controls ── */}
      <div className="flex items-center px-4 py-2.5 border-b border-dark-700 gap-4 shrink-0 bg-dark-900/80">

        {/* Blue bans */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <BanSlot key={i} hero={blueBans[i]} team="blue"
              isActive={!done && cur?.team === "blue" && cur?.phase === "ban" && activeIdx === i} />
          ))}
        </div>

        {/* Center: title + turn */}
        <div className="flex-1 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Simulador de Draft</p>
          {!done && cur && (
            <>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">{phaseLabel}</p>
              <p className={`text-sm font-black ${cur.team === "blue" ? "text-blue-400" : "text-red-400"}`}>
                {cur.team === "blue" ? "▶ TIME AZUL" : "TIME VERMELHO ◀"} — {cur.phase === "ban" ? "BAN" : "PICK"}
              </p>
            </>
          )}
          {done && <p className="text-sm font-black text-green-400">✓ Draft Concluído</p>}
        </div>

        {/* Red bans */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <BanSlot key={i} hero={redBans[i]} team="red"
              isActive={!done && cur?.team === "red" && cur?.phase === "ban" && activeIdx === i} />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-1.5 ml-2 items-center">
          <button onClick={undo} disabled={step === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] text-gray-400 hover:text-white hover:bg-dark-700 disabled:opacity-30 transition-colors">
            <Undo2 size={12} /> Desfazer
          </button>
          <button onClick={reset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
            <RotateCcw size={12} /> Reiniciar
          </button>
          <div className="w-px h-4 bg-dark-600 mx-1" />
          <button onClick={logout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] text-gray-600 hover:text-red-400 hover:bg-red-900/10 transition-colors">
            <LogOut size={12} /> Sair
          </button>
        </div>
      </div>

      {/* ── Main: picks | grid | picks ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Blue picks */}
        <div className="w-52 flex flex-col border-r border-dark-700/50 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <PickSlot key={i} hero={bluePicks[i]} team="blue" pos={i + 1}
              isActive={!done && cur?.team === "blue" && cur?.phase === "pick" && activeIdx === i} />
          ))}
        </div>

        {/* Center: hero grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="px-3 py-2 border-b border-dark-700 space-y-2 shrink-0 bg-dark-900/40">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar herói..."
                className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder:text-gray-700 outline-none focus:border-gold-500/40" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {ROLES.map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${role === r ? "bg-gold-500 text-dark-900" : "bg-dark-700 text-gray-500 hover:text-white"}`}>
                  {r === "ALL" ? "Todos" : (ROLE_LABELS[r] ?? r)}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
              {filtered.map(hero => {
                const used = usedIds.has(hero.id);
                const banned = used && slots.findIndex(h => h?.id === hero.id) < 10;
                return (
                  <button key={hero.id} onClick={() => select(hero)} disabled={used || done}
                    className={`flex flex-col items-center gap-0.5 group transition-all ${used ? "opacity-30 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}>
                    <div className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors ${used ? "border-transparent" : "border-transparent group-hover:border-gold-500"}`}>
                      {hero.icon_url
                        ? <Image src={hero.icon_url} alt={hero.name} fill sizes="80px" className="object-cover" />
                        : <div className="w-full h-full bg-dark-700 flex items-center justify-center text-xs font-black text-gold-400">{hero.name[0]}</div>
                      }
                      {banned && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-red-400 font-black text-xl">✕</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-500 truncate w-full text-center leading-none">{hero.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress */}
          <div className="px-3 py-2 border-t border-dark-700 shrink-0">
            <div className="flex gap-0.5">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${
                  i < step
                    ? SEQ[i].team === "blue"
                      ? SEQ[i].phase === "ban" ? "bg-blue-800" : "bg-blue-400"
                      : SEQ[i].phase === "ban" ? "bg-red-800" : "bg-red-400"
                    : i === step ? "bg-gold-400 animate-pulse" : "bg-dark-600"
                }`} />
              ))}
            </div>
            <p className="text-[9px] text-gray-600 text-center mt-1">
              {Math.min(step, 18)}/18 — {cur?.label ?? "Concluído"}
            </p>
          </div>
        </div>

        {/* Red picks */}
        <div className="w-52 flex flex-col border-l border-dark-700/50 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <PickSlot key={i} hero={redPicks[i]} team="red" pos={i + 1}
              isActive={!done && cur?.team === "red" && cur?.phase === "pick" && activeIdx === i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Ban slot ────────────────────────────────────────────────
function BanSlot({ hero, team, isActive }: { hero: Hero | null; team: Team; isActive: boolean }) {
  const isBlue = team === "blue";
  return (
    <div className={`relative rounded-xl overflow-hidden border-2 transition-all ${
      isActive
        ? "border-gold-400 shadow-[0_0_16px_rgba(250,204,21,0.7)] scale-110 w-16 h-16"
        : hero
          ? isBlue ? "border-blue-800 w-14 h-14" : "border-red-800 w-14 h-14"
          : isBlue ? "border-blue-900/50 border-dashed w-14 h-14" : "border-red-900/50 border-dashed w-14 h-14"
    }`}>
      {hero ? (
        <>
          {hero.icon_url && (
            <Image src={hero.icon_url} alt={hero.name} fill sizes="64px"
              className="object-cover grayscale brightness-40" />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/50">
            <span className="text-red-400 font-black text-xl drop-shadow-lg">✕</span>
            <span className="text-[8px] text-gray-400 font-semibold truncate px-1 text-center leading-tight">{hero.name}</span>
          </div>
        </>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${
          isActive ? "bg-gold-500/10" : isBlue ? "bg-blue-950/30" : "bg-red-950/30"
        }`}>
          {isActive && <span className="text-gold-400 text-lg animate-pulse">?</span>}
        </div>
      )}
    </div>
  );
}

// ── Pick slot ───────────────────────────────────────────────
function PickSlot({ hero, team, pos, isActive }: { hero: Hero | null; team: Team; pos: number; isActive: boolean }) {
  const isBlue = team === "blue";

  return (
    <div className={`flex-1 relative overflow-hidden border-b border-dark-700/40 transition-all ${
      isActive ? isBlue
        ? "shadow-[inset_4px_0_0_#3B82F6] bg-blue-950/30"
        : "shadow-[inset_-4px_0_0_#EF4444] bg-red-950/30"
      : ""
    }`}>
      {hero ? (
        <>
          {/* Background: splash art ou ícone (sem blur) */}
          {hero.splash_url ? (
            <Image src={hero.splash_url} alt={hero.name} fill sizes="210px"
              className={`object-cover ${isBlue ? "object-left-top" : "object-right-top"}`} />
          ) : hero.icon_url ? (
            <Image src={hero.icon_url} alt={hero.name} fill sizes="210px"
              className="object-cover object-center scale-125" />
          ) : null}

          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{
            background: isBlue
              ? "linear-gradient(to right, rgba(11,15,23,0.9) 0%, rgba(11,15,23,0.4) 60%, transparent 100%)"
              : "linear-gradient(to left, rgba(11,15,23,0.9) 0%, rgba(11,15,23,0.4) 60%, transparent 100%)",
          }} />

          {/* Info */}
          <div className={`absolute bottom-0 ${isBlue ? "left-0 pl-3" : "right-0 pr-3"} pb-2`}>
            <p className="text-white font-heading font-bold text-sm leading-tight drop-shadow">{hero.name}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{formatRoles(hero.role)}</p>
          </div>

          {/* Position number */}
          <div className={`absolute top-1.5 ${isBlue ? "left-2" : "right-2"}`}>
            <span className={`text-[9px] font-black ${isBlue ? "text-blue-400" : "text-red-400"} opacity-60`}>{pos}</span>
          </div>
        </>
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center gap-1 ${
          isActive
            ? isBlue ? "bg-blue-900/20" : "bg-red-900/20"
            : "bg-dark-800/20"
        }`}>
          <span className={`text-2xl font-black opacity-20 ${isBlue ? "text-blue-400" : "text-red-400"}`}>{pos}</span>
          {isActive && (
            <span className={`text-[9px] font-bold uppercase tracking-wider animate-pulse ${isBlue ? "text-blue-400" : "text-red-400"}`}>
              {isBlue ? "← pick" : "pick →"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
