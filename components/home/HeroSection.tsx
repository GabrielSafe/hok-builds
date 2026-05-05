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
      {hoveredHero && (
        <div className="mt-2 mb-6">
          <HeroQuickView heroId={hoveredHero.id} />
        </div>
      )}
    </>
  );
}
