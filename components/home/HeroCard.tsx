import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import RoleBadge from "@/components/ui/RoleBadge";
import type { Hero } from "@/types";

interface Props {
  hero: Hero;
}

export default function HeroCard({ hero }: Props) {
  return (
    <Link href={`/heroes/${hero.slug}`} className="group block">
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-dark-600 bg-dark-700",
        "transition-all duration-300 group-hover:border-gold-500 group-hover:scale-105",
        "group-hover:shadow-[0_0_20px_rgba(212,160,23,0.25)]"
      )}>
        {/* Hero image */}
        <div className="relative aspect-square overflow-hidden">
          {hero.icon_url ? (
            <Image
              src={hero.icon_url}
              alt={hero.name}
              fill
              sizes="(max-width: 768px) 50vw, 120px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-600 to-dark-500 flex items-center justify-center">
              <span className="text-2xl font-black text-gold-400/40">{hero.name[0]}</span>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Views badge */}
          {hero.total_views != null && hero.total_views > 0 && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-dark-900/70 rounded px-1.5 py-0.5">
              <Eye size={10} className="text-gold-400" />
              <span className="text-[10px] text-gray-300">{formatNumber(hero.total_views)}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-2 py-2">
          <p className="text-sm font-semibold text-white truncate group-hover:text-gold-400 transition-colors">
            {hero.name}
          </p>
          <RoleBadge role={hero.role} size="sm" />
        </div>
      </div>
    </Link>
  );
}
