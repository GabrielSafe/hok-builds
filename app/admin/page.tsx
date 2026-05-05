import { query } from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { Users, Eye, Sword, TrendingUp } from "lucide-react";

async function getDashboardStats() {
  const [heroCount, viewCount, buildCount, popularHeroes] = await Promise.all([
    query<{ count: string }>("SELECT COUNT(*) AS count FROM heroes"),
    query<{ count: string }>("SELECT COUNT(*) AS count FROM hero_views"),
    query<{ count: string }>("SELECT COUNT(*) AS count FROM builds"),
    query<{ name: string; slug: string; total_views: string }>(
      `SELECT h.name, h.slug, COALESCE(COUNT(hv.id), 0)::text AS total_views
       FROM heroes h LEFT JOIN hero_views hv ON hv.hero_id = h.id
       WHERE h.is_published = true
       GROUP BY h.id ORDER BY total_views DESC LIMIT 5`
    ),
  ]);

  return {
    heroes: parseInt(heroCount[0]?.count ?? "0"),
    views: parseInt(viewCount[0]?.count ?? "0"),
    builds: parseInt(buildCount[0]?.count ?? "0"),
    popularHeroes,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Users size={20} />} label="Heróis Publicados" value={stats.heroes} color="blue" />
        <StatCard icon={<Eye size={20} />} label="Total de Views" value={stats.views} color="gold" />
        <StatCard icon={<Sword size={20} />} label="Builds Criadas" value={stats.builds} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gold-400" />
            <h2 className="text-sm font-bold text-white">Heróis Mais Vistos</h2>
          </div>
          <div className="space-y-2">
            {stats.popularHeroes.map((h, i) => (
              <div key={h.slug} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-dark-500 w-4">{i + 1}</span>
                  <Link href={`/heroes/${h.slug}`} target="_blank" className="text-sm text-gray-300 hover:text-gold-400 transition-colors">
                    {h.name}
                  </Link>
                </div>
                <span className="text-xs text-gold-400 font-semibold">{formatNumber(parseInt(h.total_views))} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <h2 className="text-sm font-bold text-white mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/heroes/new" className="flex flex-col items-center gap-2 p-4 bg-dark-600 hover:bg-dark-500 border border-dark-500 hover:border-gold-500/50 rounded-lg transition-all text-sm text-gray-300 hover:text-white">
              <Users size={20} className="text-gold-400" />
              Novo Herói
            </Link>
            <Link href="/admin/builds/new" className="flex flex-col items-center gap-2 p-4 bg-dark-600 hover:bg-dark-500 border border-dark-500 hover:border-gold-500/50 rounded-lg transition-all text-sm text-gray-300 hover:text-white">
              <Sword size={20} className="text-gold-400" />
              Nova Build
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "gold" | "green";
}) {
  const colors = {
    blue: "text-blue-400 bg-blue-900/20",
    gold: "text-gold-400 bg-yellow-900/20",
    green: "text-green-400 bg-green-900/20",
  };

  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-white">{formatNumber(value)}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
