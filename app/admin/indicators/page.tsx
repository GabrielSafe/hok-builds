import { query } from "@/lib/db";
import IndicatorManager from "@/components/admin/IndicatorManager";
import type { Hero } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminIndicatorsPage() {
  const heroes = await query<Hero>(
    `SELECT id, name, slug, role, icon_url, change_type FROM heroes WHERE is_published = true ORDER BY name ASC`
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-1">Indicadores de Patch</h1>
      <p className="text-gray-500 text-sm mb-6">
        Defina manualmente o indicador de cada herói para o patch atual.
      </p>
      <IndicatorManager heroes={heroes} />
    </div>
  );
}
