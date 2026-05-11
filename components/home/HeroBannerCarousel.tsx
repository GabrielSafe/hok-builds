"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import BannerMediaBackground, { useBannerMedia } from "./BannerMediaBackground";
import type { Hero } from "@/types";
import type { ReactNode } from "react";

interface Props {
  heroes: Hero[];
  children?: ReactNode;
}

export default function HeroBannerCarousel({ heroes, children }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const bannerMedia = useBannerMedia();
  const hasMedia = bannerMedia.length > 0;

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setFading(true);
      setTimeout(() => { setCurrent(index); setFading(false); }, 300);
    },
    [current]
  );

  useEffect(() => {
    if (heroes.length <= 1) return;
    const timer = setInterval(() => goTo((current + 1) % heroes.length), 5000);
    return () => clearInterval(timer);
  }, [current, heroes.length, goTo]);

  const hero = heroes[current];

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 520 }}>

      {/* ── Background: mídia do admin ou splash dos heróis ── */}
      <BannerMediaBackground />
      {/* Splash do herói — só aparece se não houver mídia cadastrada */}
      {!hasMedia && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {hero?.splash_url && (
            <Image
              src={hero.splash_url}
              alt={hero.name}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
              style={{ opacity: 0.3 }}
            />
          )}
        </div>
      )}

      {/* ── Gradients para legibilidade ── */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(11,15,23,0.92) 0%, rgba(11,15,23,0.7) 55%, rgba(11,15,23,0.5) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(11,15,23,0.98) 100%)" }} />

      {/* ── Conteúdo ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 flex items-center gap-8" style={{ minHeight: 520 }}>

        {/* Texto principal */}
        <div
          className="flex-1 min-w-0 transition-opacity duration-300"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <p className="text-[11px] font-heading font-bold text-gold-400 uppercase tracking-[0.2em] mb-4">
            Guias & Builds
          </p>
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-white leading-tight mb-4 tracking-tight">
            Guias e builds para todos os<br />
            heróis de <span className="text-gold-400">Honor of Kings</span>
          </h1>
          <p className="text-gray-400 text-base mb-8 leading-relaxed font-sans max-w-lg">
            As melhores builds, arcana, feitiços e dicas para você dominar o campo de batalha!
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/heroes"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-heading font-bold text-sm px-7 py-3 rounded-lg transition-colors tracking-wide"
            >
              Ver Todos os Heróis
            </Link>
            <Link
              href="/tier-list"
              className="inline-flex items-center gap-2 border border-gray-600 hover:border-gold-400 text-gray-300 hover:text-gold-400 font-heading font-bold text-sm px-7 py-3 rounded-lg transition-colors"
            >
              Tier List
            </Link>
          </div>

          {/* Dots */}
          {heroes.length > 1 && (
            <div className="flex gap-2 mt-8">
              {heroes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? "w-5 h-2 bg-gold-400" : "w-2 h-2 bg-gray-600 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Popular heroes — slot passado como children */}
        {children && (
          <div className="hidden lg:block w-72 shrink-0">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
