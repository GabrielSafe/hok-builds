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
        <div className="stat-card text-center">
          <p className="text-xs text-gray-500 mb-1">Taxa de Vitória</p>
          <p className="text-xl font-black text-green-400">{formatPercent(stats.winrate)}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-gray-500 mb-1">Taxa de Escolha</p>
          <p className="text-xl font-black text-blue-400">{formatPercent(stats.pickrate)}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-gray-500 mb-1">Taxa de Banimento</p>
          <p className="text-xl font-black text-red-400">{formatPercent(stats.banrate)}</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-xs text-gray-500 mb-1">Partidas</p>
          <p className="text-xl font-black text-white">{formatNumber(stats.games_played)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dark-500">
        <div>
          <p className="text-xs text-gray-500">Tier Atual</p>
          <div className={`text-2xl font-black border-2 w-10 h-10 rounded flex items-center justify-center mt-1 ${tierColor}`}>
            {stats.tier}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Visualizações</p>
          <p className="text-lg font-bold text-gold-400 mt-1">{formatNumber(totalViews)}</p>
        </div>
      </div>
    </div>
  );
}
