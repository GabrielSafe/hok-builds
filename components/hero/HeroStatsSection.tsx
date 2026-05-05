import { formatPercent, formatNumber } from "@/lib/utils";
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

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="stat-card">
          <p className="text-2xs text-gray-500 mb-1 font-heading uppercase tracking-wider">Taxa de Vitória</p>
          <p className="stat-number text-xl text-green-400">{formatPercent(stats.winrate)}</p>
        </div>
        <div className="stat-card">
          <p className="text-2xs text-gray-500 mb-1 font-heading uppercase tracking-wider">Taxa de Escolha</p>
          <p className="stat-number text-xl text-blue-400">{formatPercent(stats.pickrate)}</p>
        </div>
        <div className="stat-card">
          <p className="text-2xs text-gray-500 mb-1 font-heading uppercase tracking-wider">Taxa de Ban</p>
          <p className="stat-number text-xl text-red-400">{formatPercent(stats.banrate)}</p>
        </div>
        <div className="stat-card">
          <p className="text-2xs text-gray-500 mb-1 font-heading uppercase tracking-wider">Partidas</p>
          <p className="stat-number text-xl text-white">{formatNumber(stats.games_played)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dark-500">
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
