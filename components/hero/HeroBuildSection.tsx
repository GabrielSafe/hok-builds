import Image from "next/image";
import type { Build } from "@/types";

interface FlatItem {
  item_name: string;
  item_image_url: string | null;
  item_slug: string;
  sort_order: number;
  phase: string;
}

interface FlatArcana {
  arcana_name: string;
  arcana_image_url: string | null;
  arcana_slug: string;
  arcana_tier: number;
  quantity: number;
}

interface FlatSpell {
  spell_name: string;
  spell_image_url: string | null;
  spell_slug: string;
}

interface FlatSkill {
  skill_name: string;
  skill_key: string;
  skill_image_url: string | null;
  sort_order: number;
}

interface Props {
  build: Build;
}

function ItemCircle({ name, imageUrl, size = 52 }: { name: string; imageUrl: string | null; size?: number }) {
  return (
    <div className="group relative flex flex-col items-center gap-1">
      <div
        style={{ width: size, height: size }}
        className="rounded-full border-2 border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors shrink-0"
      >
        {imageUrl
          ? <Image src={imageUrl} alt={name} width={size} height={size} className="object-cover w-full h-full" />
          : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{name[0]}</div>
        }
      </div>
      <span className="text-[10px] text-gray-400 text-center max-w-[56px] leading-tight">{name}</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-900 border border-dark-500 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
        {name}
      </div>
    </div>
  );
}

function PhaseBox({ label, children, highlight = false }: { label: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-dark-600 border border-dark-500" : ""}`}>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex flex-wrap gap-3 items-end">{children}</div>
    </div>
  );
}

export default function HeroBuildSection({ build }: Props) {
  const items = (build.items ?? []) as unknown as FlatItem[];
  const arcana = (build.arcana ?? []) as unknown as FlatArcana[];
  const spells = (build.spells ?? []) as unknown as FlatSpell[];
  const skillOrder = (build.skill_order ?? []) as unknown as FlatSkill[];

  const startItems = items.filter((i) => i.phase === "start");
  const coreItems = items.filter((i) => i.phase === "core");
  const bootsItems = items.filter((i) => i.phase === "boots");
  const finalItems = items.filter((i) => i.phase === "final");
  const allItems = items;

  const hasPhases = startItems.length > 0 || coreItems.length > 0 || bootsItems.length > 0 || finalItems.length > 0;

  return (
    <div className="space-y-4">
      {/* Items */}
      {allItems.length > 0 && (
        <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider">Build de Itens</h3>
            {build.patch_version && (
              <span className="text-xs text-gray-500 bg-dark-600 px-2 py-0.5 rounded">Patch {build.patch_version}</span>
            )}
          </div>
          <div className="p-5">
            {hasPhases ? (
              <div className="space-y-4">
                {/* Row 1: Start → Core → Boots */}
                {(startItems.length > 0 || coreItems.length > 0 || bootsItems.length > 0) && (
                  <div className="flex flex-wrap gap-4 items-start">
                    {startItems.length > 0 && (
                      <PhaseBox label="Item Inicial">
                        {startItems.map((item, i) => <ItemCircle key={i} name={item.item_name} imageUrl={item.item_image_url} />)}
                      </PhaseBox>
                    )}
                    {coreItems.length > 0 && (
                      <PhaseBox label="Itens Core" highlight>
                        {coreItems.map((item, i) => <ItemCircle key={i} name={item.item_name} imageUrl={item.item_image_url} />)}
                      </PhaseBox>
                    )}
                    {bootsItems.length > 0 && (
                      <PhaseBox label="Botas">
                        {bootsItems.map((item, i) => <ItemCircle key={i} name={item.item_name} imageUrl={item.item_image_url} />)}
                      </PhaseBox>
                    )}
                  </div>
                )}

                {/* Row 2: Final Build */}
                {finalItems.length > 0 && (
                  <div className="border-t border-dark-600 pt-4">
                    <PhaseBox label="Build Final" highlight>
                      {finalItems.map((item, i) => <ItemCircle key={i} name={item.item_name} imageUrl={item.item_image_url} />)}
                    </PhaseBox>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 items-end">
                {allItems.map((item, i) => <ItemCircle key={i} name={item.item_name} imageUrl={item.item_image_url} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Arcana + Spells */}
      {(arcana.length > 0 || spells.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {arcana.length > 0 && (
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
              <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">Arcana</p>
              <div className="flex flex-wrap gap-3 items-end">
                {arcana.map((a, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-full border-2 border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                      {a.arcana_image_url
                        ? <Image src={a.arcana_image_url} alt={a.arcana_name} width={44} height={44} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold-400">{a.arcana_name[0]}</div>
                      }
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{a.quantity}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {spells.length > 0 && (
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
              <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">Feitiços</p>
              <div className="flex gap-3 items-end">
                {spells.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full border-2 border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                      {s.spell_image_url
                        ? <Image src={s.spell_image_url} alt={s.spell_name} width={48} height={48} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">{s.spell_name[0]}</div>
                      }
                    </div>
                    <span className="text-[10px] text-gray-400">{s.spell_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skill Order */}
      {skillOrder.length > 0 && (
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">Ordem de Habilidades</p>
          <div className="flex items-center gap-2 flex-wrap">
            {skillOrder.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-lg border-2 border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                    {s.skill_image_url
                      ? <Image src={s.skill_image_url} alt={s.skill_name} width={44} height={44} className="object-cover w-full h-full" />
                      : <div className="w-full h-full flex items-center justify-center text-sm font-black text-gold-400">{s.skill_key.toUpperCase()}</div>
                    }
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold">{s.skill_key.toUpperCase()}</span>
                </div>
                {i < skillOrder.length - 1 && <span className="text-gray-600 text-lg font-bold">›</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
