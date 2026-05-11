"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, ChevronRight, Lock, RotateCcw } from "lucide-react";
import DraftTool from "./DraftTool";
import type { Hero } from "@/types";

type Format = "md1" | "md3" | "md5" | "md7";
type Phase = "setup" | "draft" | "between" | "complete";

interface GameResult {
  game: number;
  winner: "blue" | "red" | null;
  pickedIds: number[];
}

interface Props { heroes: Hero[]; }

const FORMAT_INFO: Record<Format, { label: string; max: number; winsNeeded: number; desc: string }> = {
  md1: { label: "MD1", max: 1, winsNeeded: 1, desc: "Partida única" },
  md3: { label: "MD3", max: 3, winsNeeded: 2, desc: "Melhor de 3" },
  md5: { label: "MD5", max: 5, winsNeeded: 3, desc: "Melhor de 5" },
  md7: { label: "MD7", max: 7, winsNeeded: 4, desc: "Melhor de 7" },
};

export default function DraftSeries({ heroes }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [format, setFormat] = useState<Format>("md3");
  const [teamNames, setTeamNames] = useState({ blue: "", red: "" });
  const [currentGame, setCurrentGame] = useState(1);
  const [globalBanned, setGlobalBanned] = useState<number[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [lastPickedIds, setLastPickedIds] = useState<number[]>([]);
  const [pendingWinner, setPendingWinner] = useState<"blue" | "red" | null>(null);

  const info = FORMAT_INFO[format];
  const blueWins = results.filter(r => r.winner === "blue").length;
  const redWins = results.filter(r => r.winner === "red").length;
  const blueTeam = teamNames.blue || "Time Azul";
  const redTeam = teamNames.red || "Time Vermelho";

  function startSeries() {
    setPhase("draft");
    setCurrentGame(1);
    setGlobalBanned([]);
    setResults([]);
  }

  function onGameComplete(pickedIds: number[]) {
    setLastPickedIds(pickedIds);
    if (format === "md1") {
      // MD1: vai direto para complete
      const r: GameResult = { game: 1, winner: null, pickedIds };
      setResults([r]);
      setPhase("complete");
    } else {
      setPhase("between");
    }
  }

  function confirmGame() {
    const r: GameResult = {
      game: currentGame,
      winner: pendingWinner,
      pickedIds: lastPickedIds,
    };
    const newResults = [...results, r];
    const newGlobal = [...globalBanned, ...lastPickedIds];
    const newBlueWins = newResults.filter(x => x.winner === "blue").length;
    const newRedWins = newResults.filter(x => x.winner === "red").length;

    setResults(newResults);
    setGlobalBanned(newGlobal);
    setPendingWinner(null);

    const seriesOver =
      newBlueWins >= info.winsNeeded ||
      newRedWins >= info.winsNeeded ||
      currentGame >= info.max;

    if (seriesOver) {
      setPhase("complete");
    } else {
      setCurrentGame(g => g + 1);
      setPhase("draft");
    }
  }

  function restart() {
    setPhase("setup");
    setCurrentGame(1);
    setGlobalBanned([]);
    setResults([]);
    setLastPickedIds([]);
    setPendingWinner(null);
  }

  // ── SETUP ────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4"
        style={{ background: "radial-gradient(ellipse at center top, rgba(212,160,23,0.05), transparent 60%)" }}>
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <Trophy size={40} className="text-gold-400 mx-auto mb-4" />
            <h1 className="font-heading font-extrabold text-4xl text-white mb-2">Simulador de Draft</h1>
            <p className="text-gray-500">Configure a série antes de começar</p>
          </div>

          {/* Formato */}
          <div className="mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Formato da Série</p>
            <div className="grid grid-cols-4 gap-3">
              {(["md1", "md3", "md5", "md7"] as Format[]).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    format === f
                      ? "border-gold-500 bg-gold-500/10 text-gold-400"
                      : "border-dark-600 bg-dark-700 text-gray-400 hover:border-dark-400"
                  }`}>
                  <p className="font-heading font-extrabold text-2xl">{FORMAT_INFO[f].label}</p>
                  <p className="text-[10px] mt-1 opacity-70">{FORMAT_INFO[f].desc}</p>
                </button>
              ))}
            </div>
            {format !== "md1" && (
              <p className="text-xs text-gray-600 mt-2 text-center">
                Heróis pickados em partidas anteriores ficam bloqueados nas próximas — Bans Globais
              </p>
            )}
          </div>

          {/* Nomes dos times */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-2">Time Azul</label>
              <input type="text" value={teamNames.blue}
                onChange={e => setTeamNames(p => ({ ...p, blue: e.target.value }))}
                placeholder="Ex: Team Alpha"
                className="w-full bg-dark-700 border-2 border-blue-900/50 focus:border-blue-500/60 rounded-xl px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-700" />
            </div>
            <div>
              <label className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-2">Time Vermelho</label>
              <input type="text" value={teamNames.red}
                onChange={e => setTeamNames(p => ({ ...p, red: e.target.value }))}
                placeholder="Ex: Team Beta"
                className="w-full bg-dark-700 border-2 border-red-900/50 focus:border-red-500/60 rounded-xl px-4 py-3 text-white outline-none transition-colors placeholder:text-gray-700" />
            </div>
          </div>

          <button onClick={startSeries}
            className="w-full bg-gold-500 hover:bg-gold-400 text-dark-900 font-heading font-extrabold text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            Iniciar {FORMAT_INFO[format].label} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // ── DRAFT ────────────────────────────────────────────────
  if (phase === "draft") {
    return (
      <DraftTool
        heroes={heroes}
        teamNames={{ blue: blueTeam, red: redTeam }}
        globalBanned={globalBanned}
        currentGame={currentGame}
        totalGames={info.max}
        score={{ blue: blueWins, red: redWins }}
        onComplete={onGameComplete}
        onRestart={restart}
      />
    );
  }

  // ── ENTRE PARTIDAS ───────────────────────────────────────
  if (phase === "between") {
    const globalHeroes = heroes.filter(h => [...globalBanned, ...lastPickedIds].includes(h.id));
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl space-y-6">

          {/* Placar */}
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Partida {currentGame} concluída</p>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-black text-blue-400">{blueWins}</p>
                <p className="text-sm text-gray-400 mt-1">{blueTeam}</p>
              </div>
              <p className="text-2xl text-gray-600 font-bold">×</p>
              <div className="text-center">
                <p className="text-4xl font-black text-red-400">{redWins}</p>
                <p className="text-sm text-gray-400 mt-1">{redTeam}</p>
              </div>
            </div>
          </div>

          {/* Quem venceu? */}
          <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quem venceu a partida {currentGame}?</p>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setPendingWinner("blue")}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  pendingWinner === "blue" ? "border-blue-500 bg-blue-900/20 text-blue-400" : "border-dark-500 text-gray-500 hover:border-blue-700"
                }`}>{blueTeam}</button>
              <button onClick={() => setPendingWinner(null)}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  pendingWinner === null ? "border-gray-500 bg-dark-600 text-gray-300" : "border-dark-500 text-gray-600 hover:border-gray-600"
                }`}>Não registrar</button>
              <button onClick={() => setPendingWinner("red")}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  pendingWinner === "red" ? "border-red-500 bg-red-900/20 text-red-400" : "border-dark-500 text-gray-500 hover:border-red-700"
                }`}>{redTeam}</button>
            </div>
          </div>

          {/* Global bans da próxima partida */}
          {globalHeroes.length > 0 && (
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-orange-400" />
                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Bloqueados na próxima partida ({globalHeroes.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {globalHeroes.map(h => (
                  <div key={h.id} className="flex items-center gap-1.5 bg-dark-600 border border-dark-500 rounded-lg px-2 py-1">
                    {h.icon_url && (
                      <div className="relative w-6 h-6 rounded overflow-hidden shrink-0">
                        <Image src={h.icon_url} alt={h.name} fill sizes="24px" className="object-cover grayscale" />
                      </div>
                    )}
                    <span className="text-[10px] text-gray-400">{h.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={confirmGame}
            className="w-full bg-gold-500 hover:bg-gold-400 text-dark-900 font-heading font-extrabold text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            Partida {currentGame + 1} — Próximo Draft <ChevronRight size={20} />
          </button>

          <button onClick={restart} className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-400 transition-colors py-2">
            <RotateCcw size={14} /> Reiniciar série
          </button>
        </div>
      </div>
    );
  }

  // ── SÉRIE CONCLUÍDA ──────────────────────────────────────
  const seriesWinner = blueWins > redWins ? blueTeam : redWins > blueWins ? redTeam : null;
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center space-y-6">
        <Trophy size={56} className="text-gold-400 mx-auto" />
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Série concluída</p>
          {seriesWinner ? (
            <>
              <h2 className="font-heading font-extrabold text-3xl text-white mb-1">{seriesWinner}</h2>
              <p className="text-gray-400">venceu a série {FORMAT_INFO[format].label}</p>
            </>
          ) : (
            <h2 className="font-heading font-extrabold text-3xl text-white">Série finalizada</h2>
          )}
        </div>
        <div className="flex items-center justify-center gap-8 bg-dark-700 border border-dark-600 rounded-xl py-6">
          <div>
            <p className="text-5xl font-black text-blue-400">{blueWins}</p>
            <p className="text-sm text-gray-400 mt-1">{blueTeam}</p>
          </div>
          <p className="text-3xl text-gray-600 font-bold">×</p>
          <div>
            <p className="text-5xl font-black text-red-400">{redWins}</p>
            <p className="text-sm text-gray-400 mt-1">{redTeam}</p>
          </div>
        </div>
        <button onClick={restart}
          className="w-full bg-gold-500 hover:bg-gold-400 text-dark-900 font-heading font-extrabold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
          <RotateCcw size={18} /> Nova Série
        </button>
      </div>
    </div>
  );
}
