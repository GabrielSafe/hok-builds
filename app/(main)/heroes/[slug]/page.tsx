import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import ViewTracker from "@/components/hero/ViewTracker";
import HeroBuildSection from "@/components/hero/HeroBuildSection";
import HeroSkillsSection from "@/components/hero/HeroSkillsSection";
import HeroStatsSection from "@/components/hero/HeroStatsSection";
import RoleBadge from "@/components/ui/RoleBadge";
import DifficultyStars from "@/components/ui/DifficultyStars";
import type { HeroDetail } from "@/types";

export const dynamic = "force-dynamic";

async function getHero(slug: string): Promise<HeroDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/heroes/${slug}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hero = await getHero(slug);
  if (!hero) return { title: "Herói não encontrado" };
  return {
    title: `${hero.name} — Build e Guia`,
    description: hero.description ?? `Build recomendada, habilidades e estatísticas de ${hero.name} em Honor of Kings.`,
    openGraph: {
      images: hero.splash_url ? [{ url: hero.splash_url }] : [],
    },
  };
}

export default async function HeroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hero = await getHero(slug);

  if (!hero) notFound();

  return (
    <>
      <ViewTracker heroId={hero.id} />

      {/* Splash background */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        {hero.splash_url ? (
          <Image
            src={hero.splash_url}
            alt={hero.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900/30 via-dark-900/60 to-dark-900" />

        {/* Back */}
        <div className="absolute top-4 left-4">
          <Link href="/heroes" className="flex items-center gap-1 text-sm text-gray-300 hover:text-gold-400 transition-colors bg-dark-900/60 rounded-lg px-3 py-1.5">
            <ChevronLeft size={16} />
            Heróis
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: hero info */}
          <div className="lg:col-span-1">
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
              <div className="flex items-start gap-4">
                {hero.icon_url && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gold-500/50 shrink-0">
                    <Image src={hero.icon_url} alt={hero.name} fill sizes="80px" className="object-cover" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black text-white">{hero.name}</h1>
                  <RoleBadge role={hero.role} size="md" />
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Dificuldade</span>
                    <DifficultyStars value={hero.difficulty} />
                  </div>
                </div>
              </div>

              {hero.description && (
                <p className="text-sm text-gray-400 leading-relaxed mt-4 pt-4 border-t border-dark-600">
                  {hero.description}
                </p>
              )}
            </div>

            {/* Stats */}
            {hero.stats && (
              <div className="mt-4">
                <HeroStatsSection stats={hero.stats} totalViews={hero.total_views ?? 0} />
              </div>
            )}

            {/* Skills */}
            {hero.skills.length > 0 && (
              <div className="mt-4">
                <HeroSkillsSection skills={hero.skills} />
              </div>
            )}
          </div>

          {/* Right: build */}
          <div className="lg:col-span-2">
            {hero.recommended_build ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">{hero.recommended_build.title}</h2>
                  {hero.recommended_build.patch_version && (
                    <span className="text-xs bg-dark-700 border border-dark-600 rounded px-2 py-1 text-gray-400">
                      Patch {hero.recommended_build.patch_version}
                    </span>
                  )}
                </div>
                <HeroBuildSection build={hero.recommended_build} />
              </>
            ) : (
              <div className="bg-dark-700 border border-dark-600 rounded-xl p-10 text-center text-gray-500">
                <p className="text-lg font-semibold mb-2">Build em breve</p>
                <p className="text-sm">A build recomendada para este herói ainda está sendo preparada.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
