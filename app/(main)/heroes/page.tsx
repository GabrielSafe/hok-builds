import type { Metadata } from "next";
import HeroGrid from "@/components/home/HeroGrid";

export const metadata: Metadata = {
  title: "Heróis",
  description: "Todos os heróis de Honor of Kings com builds e guias completos.",
};

export default function HeroesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-white mb-2">Heróis</h1>
      <p className="text-gray-500 text-sm mb-6">
        Escolha um herói para ver builds, habilidades, arcana e estatísticas.
      </p>
      <HeroGrid />
    </div>
  );
}
