import { Suspense } from "react";
import HeroBanner from "@/components/home/HeroBanner";
import HeroGrid from "@/components/home/HeroGrid";
import PopularHeroes from "@/components/home/PopularHeroes";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3">
          <Suspense fallback={<div className="h-80 rounded-xl bg-dark-700 animate-pulse" />}>
            <HeroBanner />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-80 rounded-xl bg-dark-700 animate-pulse" />}>
            <PopularHeroes />
          </Suspense>
        </div>
      </div>

      {/* Hero Grid */}
      <HeroGrid />
    </div>
  );
}
