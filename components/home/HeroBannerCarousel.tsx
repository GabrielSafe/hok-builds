"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import BannerMediaBackground from "./BannerMediaBackground";
import type { Hero } from "@/types";

interface Props {
  heroes: Hero[];
}

export default function HeroBannerCarousel({ heroes }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setFading(true);
      setTimeout(() => {
        setCurrent(index);
        setFading(false);
      }, 300);
    },
    [current]
  );

  useEffect(() => {
    if (heroes.length <= 1) return;
    const timer = setInterval(() => {
      goTo((current + 1) % heroes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, heroes.length, goTo]);

  const hero = heroes[current];

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-dark-700 via-dark-800 to-dark-900 border border-dark-600 min-h-[280px] md:min-h-[320px] flex items-center">
      {/* Background — vídeo/foto do admin (se tiver) OU splash do herói */}
      <BannerMediaBackground />
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {hero?.splash_url && (
          <Image
            src={hero.splash_url}
            alt={hero.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-20"
          />
        )}
      </div>

      {/* Content */}
      <div
        className="relative z-10 px-8 py-10 max-w-xl transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <p className="section-label mb-3">Guias & Builds</p>
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white leading-tight mb-3 tracking-tight">
          Guias e builds para todos os heróis de{" "}
          <span className="text-gold-400">Honor of Kings</span>
        </h1>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed font-sans">
          As melhores builds, arcana, feitiços e dicas para você dominar o campo de batalha!
        </p>
        <Link
          href="/heroes"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-heading font-bold text-sm px-6 py-2.5 rounded-lg transition-colors tracking-wide"
        >
          Ver Todos os Heróis
        </Link>
      </div>

      {/* Dots */}
      {heroes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroes.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-2 bg-gold-400"
                  : "w-2 h-2 bg-gray-600 hover:bg-gray-400"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
