"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import BannerMediaBackground, { useBannerMedia } from "./BannerMediaBackground";
import type { Hero } from "@/types";
import type { ReactNode } from "react";

interface Props {
  heroes: Hero[];
  children?: ReactNode;
}

const TEXT_SLIDES = [
  {
    label: "Guias & Builds",
    titlePlain: "Guias e builds para todos os heróis de Honor of Kings",
    titleJSX: <>Guias e builds para todos os heróis de <span className="text-gold-400">Honor of Kings</span></>,
    subtitle: "As melhores builds, arcana, feitiços e dicas para você dominar o campo de batalha!",
  },
  {
    label: "Guias & Builds",
    titlePlain: "Vença mais. Suba de elo. Domine Honor of Kings.",
    titleJSX: <>Vença mais. Suba de elo. <span className="text-gold-400">Domine Honor of Kings.</span></>,
    subtitle: "Builds otimizadas, tier list atualizada e guias de pro players para cada herói.",
  },
  {
    label: "Pro Players",
    titlePlain: "Builds de Pro Players Para Cada Herói",
    titleJSX: <>Builds de Pro Players<br />Para Cada <span className="text-gold-400">Herói</span></>,
    subtitle: "A única referência com insights reais dos melhores do Brasil — cada item, cada arcana, explicado.",
  },
  {
    label: "Estratégia",
    titlePlain: "Domine o Campo de Batalha com as Melhores Builds",
    titleJSX: <>Domine o Campo de Batalha<br />com as <span className="text-gold-400">Melhores Builds</span></>,
    subtitle: "Guias completos, arcana otimizada e estratégias testadas pelos pro players para subir de elo.",
  },
  {
    label: "HOK Brasil",
    titlePlain: "A Referência de Builds para Honor of Kings no Brasil",
    titleJSX: <>A Referência de Builds<br />para <span className="text-gold-400">Honor of Kings no Brasil</span></>,
    subtitle: "Tier list atualizada, builds por campeão e guias completos para dominar cada partida.",
  },
];

export default function HeroBannerCarousel({ heroes, children }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const bannerMedia = useBannerMedia();
  const hasMedia = bannerMedia.length > 0;

  // Text slide state
  const [textIndex, setTextIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(TEXT_SLIDES[0].titlePlain.length);
  const [isTyping, setIsTyping] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(true);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setFading(true);
      setTimeout(() => { setCurrent(index); setFading(false); }, 300);
    }, [current]
  );

  const goToText = useCallback((i: number) => {
    setSubtitleVisible(false);
    setTypedChars(0);
    setIsTyping(true);
    setTextIndex(i);
  }, []);

  // Typing effect
  useEffect(() => {
    if (!isTyping) return;
    const title = TEXT_SLIDES[textIndex].titlePlain;
    if (typedChars >= title.length) {
      setIsTyping(false);
      setSubtitleVisible(true);
      return;
    }
    const t = setTimeout(() => setTypedChars(c => c + 1), 30);
    return () => clearTimeout(t);
  }, [isTyping, typedChars, textIndex]);

  // Auto-cycle text every 6s
  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setTextIndex(prev => {
        const next = (prev + 1) % TEXT_SLIDES.length;
        setSubtitleVisible(false);
        setTypedChars(0);
        setIsTyping(true);
        return next;
      });
    }, 6000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, []);

  // Hero carousel (only without media)
  useEffect(() => {
    if (heroes.length <= 1 || hasMedia) return;
    const timer = setInterval(() => goTo((current + 1) % heroes.length), 5000);
    return () => clearInterval(timer);
  }, [current, heroes.length, goTo, hasMedia]);

  const hero = heroes[current];
  const slide = TEXT_SLIDES[textIndex];
  const titleFull = slide.titlePlain;
  const isDone = typedChars >= titleFull.length;

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 520 }}>

      {/* Background */}
      <BannerMediaBackground />
      {!hasMedia && (
        <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: fading ? 0 : 1 }}>
          {hero?.splash_url && (
            <Image src={hero.splash_url} alt={hero.name} fill priority sizes="100vw" className="object-cover object-top" style={{ opacity: 0.3 }} />
          )}
        </div>
      )}

      {/* Gradients */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(11,15,23,0.92) 0%, rgba(11,15,23,0.7) 55%, rgba(11,15,23,0.5) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(11,15,23,0.98) 100%)" }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 flex items-center gap-8" style={{ minHeight: 520 }}>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p className="text-[11px] font-heading font-bold text-gold-400 uppercase tracking-[0.2em] mb-4">
            {slide.label}
          </p>

          {/* Título com efeito de digitação */}
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-white leading-tight mb-4 tracking-tight min-h-[120px]">
            {isDone ? (
              slide.titleJSX
            ) : (
              <>
                {titleFull.slice(0, typedChars)}
                <span className="animate-pulse text-gold-400">|</span>
              </>
            )}
          </h1>

          {/* Subtítulo com fade */}
          <p
            className="text-gray-300 text-base mb-8 leading-relaxed font-sans max-w-lg transition-opacity duration-500"
            style={{ opacity: subtitleVisible ? 1 : 0 }}
          >
            {slide.subtitle}
          </p>

          {/* Botões — fixos, não piscam */}
          <div className="flex items-center gap-4">
            <Link href="/heroes" className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-heading font-bold text-sm px-7 py-3 rounded-lg transition-colors tracking-wide">
              Ver Todos os Heróis
            </Link>
            <Link href="/tier-list" className="inline-flex items-center gap-2 border border-gray-600 hover:border-gold-400 text-gray-300 hover:text-gold-400 font-heading font-bold text-sm px-7 py-3 rounded-lg transition-colors">
              Tier List
            </Link>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-8">
            {TEXT_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToText(i)}
                className={`rounded-full transition-all duration-300 ${i === textIndex ? "w-5 h-2 bg-gold-400" : "w-2 h-2 bg-gray-600 hover:bg-gray-400"}`}
              />
            ))}
          </div>
        </div>

        {/* Popular heroes */}
        {children && (
          <div className="hidden lg:block w-72 shrink-0">{children}</div>
        )}
      </div>
    </section>
  );
}
