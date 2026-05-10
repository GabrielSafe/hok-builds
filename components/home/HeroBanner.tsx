import { query } from "@/lib/db";
import type { Hero } from "@/types";
import HeroBannerCarousel from "./HeroBannerCarousel";
import type { ReactNode } from "react";

async function getFeaturedHeroes(): Promise<Hero[]> {
  const featured = await query<Hero>(
    `SELECT * FROM heroes WHERE is_published = true AND is_featured = true AND splash_url IS NOT NULL ORDER BY name`
  );
  if (featured.length > 0) return featured;
  return query<Hero>(
    `SELECT h.* FROM heroes h
     WHERE h.is_published = true AND h.splash_url IS NOT NULL
     ORDER BY (SELECT COUNT(*) FROM hero_views WHERE hero_id = h.id) DESC
     LIMIT 3`
  );
}

export default async function HeroBanner({ children }: { children?: ReactNode }) {
  const heroes = await getFeaturedHeroes();
  return <HeroBannerCarousel heroes={heroes}>{children}</HeroBannerCarousel>;
}
