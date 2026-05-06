import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guias — Em Breve",
};

export default function GuidesPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-dark-600 flex items-center justify-center mb-6">
        <BookOpen size={28} className="text-gold-400" />
      </div>

      <h1 className="font-heading font-extrabold text-3xl text-white mb-3">
        Guias em Breve
      </h1>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-8">
        A seção de guias está sendo preparada. Em breve você encontrará dicas, estratégias e tutoriais completos aqui.
      </p>

      <Link
        href="/heroes"
        className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-heading font-bold text-sm px-6 py-2.5 rounded-lg transition-colors"
      >
        Ver Heróis
      </Link>
    </div>
  );
}
