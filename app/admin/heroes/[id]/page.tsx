import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { queryOne } from "@/lib/db";
import type { Hero } from "@/types";
import HeroForm from "@/components/admin/HeroForm";

export default async function EditHeroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hero = await queryOne<Hero>("SELECT * FROM heroes WHERE id = $1", [id]);
  if (!hero) notFound();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Editar: {hero.name}</h1>
      <HeroForm hero={hero} />
    </div>
  );
}
