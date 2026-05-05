import Image from "next/image";
import type { Build } from "@/types";

interface FlatItem {
  item_name: string;
  item_image_url: string | null;
  sort_order: number;
  phase: string;
}
interface FlatArcana {
  arcana_name: string;
  arcana_image_url: string | null;
  quantity: number;
}
interface FlatSpell {
  spell_name: string;
  spell_image_url: string | null;
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

function ItemFrame({
  name,
  imageUrl,
  size = 56,
}: {
  name: string;
  imageUrl: string | null;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div className="item-frame" style={{ width: size + 4, height: size + 4 }}>
        <div className="item-frame-inner">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={size}
              height={size}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 font-heading"
              style={{ width: size, height: size }}
            >
              {name[0]}
            </div>
          )}
        </div>
      </div>
      <span className="text-[10px] text-gray-400 text-center font-sans leading-tight max-w-[64px]">
        {name}
      </span>
    </div>
  );
}

function SpellFrame({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="rounded-lg overflow-hidden border-2 hover:border-gold-500 transition-all hover:scale-105"
        style={{
          borderColor: "#4a4a6a",
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          width: 52,
          height: 52,
        }}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt={name} width={52} height={52} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{name[0]}</div>
        )}
      </div>
      <span className="text-[10px] text-gray-400 text-center font-sans">{name}</span>
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
  const hasPhases = startItems.length + coreItems.length + bootsItems.length + finalItems.length > 0;

  return (
    <div className="space-y-4">
      {/* ── Items ──────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
            <h3 className="section-label">Build de Itens</h3>
            {build.patch_version && (
              <span className="text-xs text-gray-500 bg-dark-600 border border-dark-500 px-2 py-0.5 rounded font-sans">
                Patch {build.patch_version}
              </span>
            )}
          </div>

          <div className="p-5 space-y-5">
            {hasPhases ? (
              <>
                {/* Row 1 — Start / Core / Boots */}
                {(startItems.length > 0 || coreItems.length > 0 || bootsItems.length > 0) && (
                  <div className="flex flex-wrap gap-4 items-start">
                    {startItems.length > 0 && (
                      <div className="phase-box min-w-[100px]">
                        <p className="text-[10px] font-heading font-bold text-gray-500 uppercase tracking-widest mb-3">
                          Item Inicial
                        </p>
                        <div className="flex flex-wrap gap-3 items-end">
                          {startItems.map((item, i) => (
                            <ItemFrame key={i} name={item.item_name} imageUrl={item.item_image_url} size={52} />
                          ))}
                        </div>
                      </div>
                    )}

                    {coreItems.length > 0 && (
                      <div className="phase-box-highlight flex-1">
                        <p className="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mb-3">
                          Itens Core
                        </p>
                        <div className="flex flex-wrap gap-3 items-end">
                          {coreItems.map((item, i) => (
                            <ItemFrame key={i} name={item.item_name} imageUrl={item.item_image_url} size={56} />
                          ))}
                        </div>
                      </div>
                    )}

                    {bootsItems.length > 0 && (
                      <div className="phase-box">
                        <p className="text-[10px] font-heading font-bold text-gray-500 uppercase tracking-widest mb-3">
                          Botas
                        </p>
                        <div className="flex flex-wrap gap-3 items-end">
                          {bootsItems.map((item, i) => (
                            <ItemFrame key={i} name={item.item_name} imageUrl={item.item_image_url} size={52} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Row 2 — Final Build */}
                {finalItems.length > 0 && (
                  <div className="phase-box-highlight">
                    <p className="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Build Final
                    </p>
                    <div className="flex flex-wrap gap-3 items-end">
                      {finalItems.map((item, i) => (
                        <ItemFrame key={i} name={item.item_name} imageUrl={item.item_image_url} size={56} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-wrap gap-3 items-end">
                {items.map((item, i) => (
                  <ItemFrame key={i} name={item.item_name} imageUrl={item.item_image_url} size={52} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Arcana + Spells ────────────────────────────── */}
      {(arcana.length > 0 || spells.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {arcana.length > 0 && (
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
              <p className="section-label mb-4">Arcana</p>
              <div className="flex flex-wrap gap-4 items-end">
                {arcana.map((a, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    {/* Arcana frame — dourado */}
                    <div
                      style={{
                        padding: 2,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #D4A017, #F0C040, #B8860B)",
                        boxShadow: "0 0 10px rgba(212,160,23,0.35)",
                        transition: "all 0.2s",
                      }}
                      className="hover:scale-110"
                    >
                      <div className="rounded-full overflow-hidden bg-dark-900" style={{ width: 44, height: 44 }}>
                        {a.arcana_image_url ? (
                          <Image src={a.arcana_image_url} alt={a.arcana_name} width={44} height={44} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold-400">{a.arcana_name[0]}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-sans">{a.quantity}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {spells.length > 0 && (
            <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
              <p className="section-label mb-4">Feitiços</p>
              <div className="flex gap-4 items-end">
                {spells.map((s, i) => (
                  <SpellFrame key={i} name={s.spell_name} imageUrl={s.spell_image_url} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Skill Order ────────────────────────────────── */}
      {skillOrder.length > 0 && (
        <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
          <p className="section-label mb-4">Ordem de Habilidades</p>
          <div className="flex items-center gap-2 flex-wrap">
            {skillOrder.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div
                    style={{
                      padding: 2,
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                      boxShadow: "0 0 8px rgba(99,102,241,0.4)",
                    }}
                    className="hover:scale-110 transition-transform"
                  >
                    <div className="rounded-lg overflow-hidden bg-dark-900" style={{ width: 40, height: 40 }}>
                      {s.skill_image_url ? (
                        <Image src={s.skill_image_url} alt={s.skill_name} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black text-gold-400 font-display">
                          {s.skill_key.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-heading font-bold">{s.skill_key.toUpperCase()}</span>
                </div>
                {i < skillOrder.length - 1 && (
                  <span className="text-gray-600 text-xl font-bold mb-4">›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
