"use client";

import { useState } from "react";
import HeroGrid from "./HeroGrid";
import HeroTooltip from "./HeroTooltip";
import type { Hero } from "@/types";

export default function HeroSection() {
  const [hoveredHero, setHoveredHero] = useState<Hero | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);

  function handleHover(hero: Hero | null, rect?: DOMRect) {
    setHoveredHero(hero);
    setHoveredRect(rect ?? null);
  }

  return (
    <>
      <HeroGrid onHeroHover={handleHover} />

      {hoveredHero && hoveredRect && (
        <HeroTooltip heroId={hoveredHero.id} rect={hoveredRect} />
      )}
    </>
  );
}
