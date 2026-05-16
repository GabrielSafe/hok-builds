import { query } from "@/lib/db";
import type { Creator } from "@/types";
import StreamersShowcase from "@/components/streamers/StreamersShowcase";
import StreamersHero from "@/components/streamers/StreamersHero";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Parceiros | HOK Builds",
  description: "Streamers e criadores de conteúdo parceiros do HOK Builds.",
};

export default async function StreamersPage() {
  const creators = await query<Creator>(
    `SELECT id, name, slug, creator_type, main_role, avatar_url, description, twitch_url, youtube_url, twitter_url
     FROM creators
     WHERE is_active = true
     ORDER BY creator_type ASC, name ASC`
  );

  const streamers = creators.filter(c => c.creator_type === "streamer");
  const proPlayers = creators.filter(c => c.creator_type === "pro_player");
  const coaches = creators.filter(c => c.creator_type === "coach");

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-dark-700">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-gold-500/5 pointer-events-none" />
        <StreamersHero />
      </div>

      {/* Streamers */}
      {streamers.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-purple-500 rounded-full" />
              <h2 className="text-lg font-heading font-bold text-white">Streamers</h2>
              <span className="text-xs text-gray-600">{streamers.length} parceiro{streamers.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <StreamersShowcase creators={streamers} />
        </section>
      )}

      {/* Pro Players */}
      {proPlayers.length > 0 && (
        <section className="py-16 border-t border-dark-700">
          <div className="max-w-7xl mx-auto px-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gold-500 rounded-full" />
              <h2 className="text-lg font-heading font-bold text-white">Pro Players</h2>
              <span className="text-xs text-gray-600">{proPlayers.length} player{proPlayers.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <StreamersShowcase creators={proPlayers} />
        </section>
      )}

      {/* Coaches */}
      {coaches.length > 0 && (
        <section className="py-16 border-t border-dark-700">
          <div className="max-w-7xl mx-auto px-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-lg font-heading font-bold text-white">Coaches</h2>
              <span className="text-xs text-gray-600">{coaches.length} coach{coaches.length !== 1 ? "es" : ""}</span>
            </div>
          </div>
          <StreamersShowcase creators={coaches} />
        </section>
      )}

      {/* Empty state */}
      {creators.length === 0 && (
        <div className="py-32">
          <StreamersShowcase creators={[]} />
        </div>
      )}
    </div>
  );
}
