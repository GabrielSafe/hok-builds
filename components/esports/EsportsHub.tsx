"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Map, Users, ChevronRight } from "lucide-react";

const TEXT_SLIDES = [
  { title: "Prepare sua equipe", highlight: "para vencer" },
  { title: "Analise, planeje,", highlight: "domine o campo de batalha" },
  { title: "Ferramentas usadas", highlight: "pelos melhores coaches" },
  { title: "Estratégia começa", highlight: "antes da partida" },
];

interface Props {
  coachName: string | null;
}

export default function EsportsHub({ coachName }: Props) {
  const router = useRouter();
  const [textIdx, setTextIdx] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [lineWidth, setLineWidth] = useState(0);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Typewriter
  useEffect(() => {
    const full = TEXT_SLIDES[textIdx].title + " " + TEXT_SLIDES[textIdx].highlight;
    if (!isTyping) {
      const t = setTimeout(() => {
        setIsTyping(true);
        setTypedChars(0);
        setTextIdx(i => (i + 1) % TEXT_SLIDES.length);
      }, 3000);
      return () => clearTimeout(t);
    }
    if (typedChars >= full.length) { setIsTyping(false); return; }
    const t = setTimeout(() => setTypedChars(c => c + 1), 35);
    return () => clearTimeout(t);
  }, [isTyping, typedChars, textIdx]);

  // Cards entrance
  useEffect(() => {
    const t = setTimeout(() => setCardsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Separator line animation
  useEffect(() => {
    const t = setTimeout(() => setLineWidth(100), 800);
    return () => clearTimeout(t);
  }, []);

  async function logout() {
    await fetch("/api/esports/logout", { method: "POST" });
    router.push("/esports/login");
    router.refresh();
  }

  const slide = TEXT_SLIDES[textIdx];
  const titleFull = slide.title;
  const highlightFull = slide.highlight;
  const totalFull = titleFull + " " + highlightFull;
  const shown = totalFull.slice(0, typedChars);
  const titleShown = shown.slice(0, Math.min(typedChars, titleFull.length));
  const highlightShown = typedChars > titleFull.length
    ? shown.slice(titleFull.length + 1)
    : "";
  const cursorOnTitle = typedChars <= titleFull.length;

  return (
    <div className="min-h-[calc(100vh-56px)] relative overflow-hidden">

      {/* ── Fundo animado: grid + glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "linear-gradient(rgba(212,160,23,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,23,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }} />
        {/* Glow spots animados */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{ background: "radial-gradient(circle, rgba(212,160,23,0.4), transparent 70%)", animationDuration: "4s" }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)", animation: "pulse 6s ease-in-out infinite" }} />
        {/* Vinheta nas bordas */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(11,15,23,0.8) 100%)"
        }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-16">
          {coachName ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <span className="text-gold-400 font-black text-sm">{coachName[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Bem-vindo</p>
                <p className="text-sm font-bold text-white leading-tight">{coachName}</p>
              </div>
            </div>
          ) : <div />}

          <button onClick={logout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/10">
            <LogOut size={13} /> Sair
          </button>
        </div>

        {/* Hero text */}
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold text-gold-400 uppercase tracking-[0.3em] mb-5">E-Sports</p>

          <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-white leading-tight mb-2 min-h-[140px]">
            {titleShown}
            {cursorOnTitle && isTyping && <span className="text-gold-400 animate-pulse">|</span>}
            {titleShown.length >= titleFull.length && (
              <>
                <br />
                <span className="text-gold-400">
                  {highlightShown}
                  {!cursorOnTitle && isTyping && <span className="animate-pulse">|</span>}
                </span>
              </>
            )}
          </h1>

          {/* Separador animado */}
          <div className="flex items-center justify-center gap-3 my-6">
            <div className="h-px bg-gradient-to-r from-transparent to-gold-500/60 transition-all duration-1000 ease-out"
              style={{ width: `${lineWidth * 0.15}%` }} />
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <div className="h-px bg-gradient-to-l from-transparent to-gold-500/60 transition-all duration-1000 ease-out"
              style={{ width: `${lineWidth * 0.15}%` }} />
          </div>

          <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
            Simuladores profissionais para preparação e análise de partidas de Honor of Kings.
          </p>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">

          {/* Mapa */}
          <Link href="/esports/map"
            className={`group relative overflow-hidden rounded-2xl border border-dark-600 bg-dark-800/80 transition-all duration-700 hover:border-gold-500/60 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(212,160,23,0.2)] ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0ms" }}
          >
            {/* Map preview */}
            <div className="relative h-44 overflow-hidden">
              <Image src="/hok-map.png" alt="Mapa HOK" fill sizes="500px"
                className="object-cover object-center scale-110 group-hover:scale-125 transition-transform duration-700 brightness-50 group-hover:brightness-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/20 to-dark-800" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <Map size={28} className="text-gold-400" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="font-heading font-bold text-xl text-white mb-2 group-hover:text-gold-400 transition-colors">
                Simulador de Mapa
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Posicione campeões, desenhe rotas, marque objetivos e planeje estratégias no mapa do jogo.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-gold-400 uppercase tracking-wider">
                Acessar <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Draft */}
          <Link href="/esports/draft"
            className={`group relative overflow-hidden rounded-2xl border border-dark-600 bg-dark-800/80 transition-all duration-700 hover:border-gold-500/60 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(212,160,23,0.2)] ${cardsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "120ms" }}
          >
            {/* Draft preview */}
            <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-950 to-red-950">
              <div className="absolute inset-0 flex items-center justify-between px-8">
                {/* Blue picks preview */}
                <div className="flex flex-col gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-5 rounded bg-blue-800/60 border border-blue-700/40 transition-all`}
                      style={{ width: `${48 + i * 4}px`, transitionDelay: `${i * 80}ms` }} />
                  ))}
                </div>
                {/* Center */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                    <Users size={28} className="text-gold-400" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">VS</span>
                </div>
                {/* Red picks preview */}
                <div className="flex flex-col gap-1.5 items-end">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 rounded bg-red-800/60 border border-red-700/40"
                      style={{ width: `${48 + i * 4}px` }} />
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/20 to-dark-800" />
            </div>

            <div className="p-6">
              <h2 className="font-heading font-bold text-xl text-white mb-2 group-hover:text-gold-400 transition-colors">
                Simulador de Draft
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                4 bans por time em 2 fases, picks alternados no formato competitivo oficial do HoK.
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-gold-400 uppercase tracking-wider">
                Acessar <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
