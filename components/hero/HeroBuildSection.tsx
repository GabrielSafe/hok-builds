import Image from "next/image";
import type { Build } from "@/types";

interface Props {
  build: Build;
}

function ItemIcon({ name, imageUrl, slug }: { name: string; imageUrl: string | null; slug: string }) {
  return (
    <div className="group relative">
      <div className="w-12 h-12 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={48} height={48} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">{slug[0]?.toUpperCase()}</div>
        )}
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-dark-900 border border-dark-500 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {name}
      </div>
    </div>
  );
}

export default function HeroBuildSection({ build }: Props) {
  const items = (build.items ?? []) as unknown as Array<{ item_name: string; item_image_url: string; item_slug: string }>;
  const arcana = (build.arcana ?? []) as unknown as Array<{ arcana_name: string; arcana_image_url: string; arcana_slug: string; arcana_tier: number; quantity: number }>;
  const spells = (build.spells ?? []) as unknown as Array<{ spell_name: string; spell_image_url: string; spell_slug: string }>;
  const skillOrder = (build.skill_order ?? []) as unknown as Array<{ skill_name: string; skill_key: string; skill_image_url: string | null; sort_order: number }>;

  return (
    <div className="space-y-6">
      {/* Items */}
      {items.length > 0 && (
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-600">
          <p className="section-title">Build Recomendada — Itens</p>
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <ItemIcon name={item.item_name} imageUrl={item.item_image_url} slug={item.item_slug} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Arcana */}
        {arcana.length > 0 && (
          <div className="bg-dark-700 rounded-xl p-5 border border-dark-600">
            <p className="section-title">Arcana</p>
            <div className="flex flex-wrap gap-3">
              {arcana.map((a, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                    {a.arcana_image_url ? (
                      <Image src={a.arcana_image_url} alt={a.arcana_name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">{a.arcana_name[0]}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{a.quantity}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spells */}
        {spells.length > 0 && (
          <div className="bg-dark-700 rounded-xl p-5 border border-dark-600">
            <p className="section-title">Feitiços</p>
            <div className="flex gap-2">
              {spells.map((s, i) => (
                <div key={i} className="group relative">
                  <div className="w-12 h-12 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                    {s.spell_image_url ? (
                      <Image src={s.spell_image_url} alt={s.spell_name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">{s.spell_name[0]}</div>
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-dark-900 border border-dark-500 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {s.spell_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skill Order */}
      {skillOrder.length > 0 && (
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-600">
          <p className="section-title">Ordem de Habilidades</p>
          <div className="flex items-center gap-2 flex-wrap">
            {skillOrder.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                    {s.skill_image_url ? (
                      <Image src={s.skill_image_url} alt={s.skill_name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold-400">
                        {s.skill_key}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{s.skill_key}</span>
                </div>
                {i < skillOrder.length - 1 && (
                  <span className="text-gray-600">›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
