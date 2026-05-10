"use client";

import { useState } from "react";
import HeroGrid from "./HeroGrid";
import HeroQuickView from "./HeroQuickView";
import type { Hero } from "@/types";

export default function HeroSection() {
  const [hoveredHero, setHoveredHero] = useState<Hero | null>(null);

  return (
    <>
      <HeroGrid onHeroHover={setHoveredHero} />

      {/* Quick view fixo no rodapé da tela — sempre visível */}
      {hoveredHero && (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 pointer-events-none">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <HeroQuickView heroId={hoveredHero.id} />
          </div>
        </div>
      )}
    </>
  );
}
