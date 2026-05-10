import { Suspense } from "react";

export const dynamic = "force-dynamic";

import HeroBanner from "@/components/home/HeroBanner";
import PopularHeroes from "@/components/home/PopularHeroes";
import HeroSection from "@/components/home/HeroSection";

export default function HomePage() {
  return (
    <>
      {/* Banner full-width com popular heroes dentro */}
      <Suspense fallback={<div className="h-[420px] bg-dark-800 animate-pulse" />}>
        <HeroBanner>
          <Suspense fallback={null}>
            <PopularHeroes />
          </Suspense>
        </HeroBanner>
      </Suspense>

      {/* Grade de heróis */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <HeroSection />
      </div>
    </>
  );
}
