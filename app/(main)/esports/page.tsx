import Link from "next/link";
import { Map, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "E-Sports — HOK Builds" };

export default function EsportsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <p className="text-xs font-bold text-gold-400 uppercase tracking-[0.2em] mb-3">E-Sports</p>
        <h1 className="font-heading font-extrabold text-4xl text-white mb-4">Ferramentas para Competitivo</h1>
        <p className="text-gray-400 max-w-lg mx-auto">Simuladores para preparação e análise de partidas de Honor of Kings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/esports/map" className="group relative overflow-hidden rounded-2xl border border-dark-600 bg-dark-700 p-8 hover:border-gold-500/50 transition-all">
          <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-5 group-hover:bg-gold-500/20 transition-colors">
            <Map size={28} className="text-gold-400" />
          </div>
          <h2 className="font-heading font-bold text-xl text-white mb-2">Simulador de Mapa</h2>
          <p className="text-gray-500 text-sm leading-relaxed">Planeje estratégias no mapa. Posicione campeões, desenhe rotas e marque objetivos.</p>
          <div className="mt-6 text-xs font-bold text-gold-400 uppercase tracking-wider">Acessar →</div>
        </Link>

        <Link href="/esports/draft" className="group relative overflow-hidden rounded-2xl border border-dark-600 bg-dark-700 p-8 hover:border-gold-500/50 transition-all">
          <div className="w-14 h-14 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-5 group-hover:bg-gold-500/20 transition-colors">
            <Users size={28} className="text-gold-400" />
          </div>
          <h2 className="font-heading font-bold text-xl text-white mb-2">Simulador de Draft</h2>
          <p className="text-gray-500 text-sm leading-relaxed">Simule a fase de bans e picks. 5 bans por time, picks alternados com todos os heróis.</p>
          <div className="mt-6 text-xs font-bold text-gold-400 uppercase tracking-wider">Acessar →</div>
        </Link>
      </div>
    </div>
  );
}
