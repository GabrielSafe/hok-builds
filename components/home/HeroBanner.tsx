import Link from "next/link";
import Image from "next/image";
import { queryOne } from "@/lib/db";
import type { Hero } from "@/types";

async function getFeaturedHero(): Promise<Hero | null> {
  const featured = await queryOne<Hero>(
    `SELECT * FROM heroes WHERE is_published = true AND is_featured = true LIMIT 1`
  );
  if (featured) return featured;
  return queryOne<Hero>(
    `SELECT h.* FROM heroes h
     WHERE h.is_published = true
     ORDER BY (SELECT COUNT(*) FROM hero_views WHERE hero_id = h.id) DESC
     LIMIT 1`
  );
}

export default async function HeroBanner() {
  const hero = await getFeaturedHero();

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-dark-700 via-dark-800 to-dark-900 border border-dark-600 min-h-[280px] md:min-h-[320px] flex items-center">
      {/* Background splash */}
      {hero?.splash_url && (
        <div className="absolute inset-0">
          <Image
            src={hero.splash_url}
            alt={hero.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/70 to-dark-900/30" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 px-8 py-10 max-w-xl">
        <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-2">
          Guias & Builds
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
          Guias e builds para todos os heróis de{" "}
          <span className="text-gold-400">Honor of Kings</span>
        </h1>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          As melhores builds, arcana, feitiços e dicas para você dominar o campo de batalha!
        </p>
        <Link
          href="/heroes"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors"
        >
          Ver Todos os Heróis
        </Link>
      </div>

    </section>
  );
}
