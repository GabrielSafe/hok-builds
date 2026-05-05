import { Suspense } from "react";

export const dynamic = "force-dynamic";

import HeroBanner from "@/components/home/HeroBanner";
import PopularHeroes from "@/components/home/PopularHeroes";
import HeroSection from "@/components/home/HeroSection";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <Suspense fallback={<div className="h-72 rounded-xl bg-dark-700 animate-pulse" />}>
            <HeroBanner />
          </Suspense>
        </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-72 rounded-xl bg-dark-700 animate-pulse" />}>
            <PopularHeroes />
          </Suspense>
        </div>
      </div>

      <HeroSection />
    </div>
  );
}
