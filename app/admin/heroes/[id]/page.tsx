import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import type { Hero } from "@/types";
import HeroForm from "@/components/admin/HeroForm";
import SkillsEditor from "@/components/admin/SkillsEditor";
import CountersEditor from "@/components/admin/CountersEditor";

export const dynamic = "force-dynamic";

export default async function EditHeroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hero = await queryOne<Hero>("SELECT * FROM heroes WHERE id = $1", [id]);
  if (!hero) notFound();

  const allHeroes = await query<Hero>(
    "SELECT id, name, slug, icon_url, role FROM heroes WHERE is_published = true AND id != $1 ORDER BY name ASC",
    [id]
  );

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-heading font-bold text-white mb-1">Editar: {hero.name}</h1>
        <p className="text-sm text-gray-500">Informações gerais, imagens e publicação.</p>
      </div>

      <HeroForm hero={hero} />

      <div>
        <p className="text-sm text-gray-500 mb-4">Cadastre as habilidades com ícone e descrição.</p>
        <SkillsEditor heroId={hero.id} heroSlug={hero.slug} />
      </div>

      <CountersEditor heroId={hero.id} allHeroes={allHeroes} />
    </div>
  );
}
