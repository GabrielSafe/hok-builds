import { formatNumber } from "@/lib/utils";
import type { HeroStats } from "@/types";

const TIER_COLORS: Record<string, string> = {
  S: "text-gold-400 border-gold-500",
  A: "text-green-400 border-green-500",
  B: "text-blue-400 border-blue-500",
  C: "text-gray-400 border-gray-500",
  D: "text-red-400 border-red-500",
};

interface Props {
  stats: HeroStats;
  totalViews: number;
}

export default function HeroStatsSection({ stats, totalViews }: Props) {
  const tierColor = TIER_COLORS[stats.tier] ?? TIER_COLORS.B;

  return (
    <div className="bg-dark-700 rounded-xl p-5 border border-dark-600">
      <p className="section-title">Estatísticas</p>

      <div className="flex items-center justify-between pt-3">
        <div>
          <p className="text-2xs text-gray-500 font-heading uppercase tracking-wider">Tier Atual</p>
          <div className={`font-display text-2xl font-bold border-2 w-10 h-10 rounded flex items-center justify-center mt-1 ${tierColor}`}>
            {stats.tier}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xs text-gray-500 font-heading uppercase tracking-wider">Visualizações</p>
          <p className="stat-number text-lg text-gold-400 mt-1">{formatNumber(totalViews)}</p>
        </div>
      </div>
    </div>
  );
}
