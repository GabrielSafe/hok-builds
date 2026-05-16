"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, X, RefreshCw } from "lucide-react";

interface Asset { id: number; name: string; image_url: string | null; tier?: number; key?: string; }
interface BuildRow { id: number; name: string; image_url: string | null; phase?: string; quantity?: number; sort_order?: number; item_id?: number; arcana_id?: number; spell_id?: number; skill_id?: number; }

const TIER_INFO = {
  1: { label: "Azul",     border: "border-blue-500",  text: "text-blue-400",  bg: "bg-blue-500/10"  },
  2: { label: "Verde",    border: "border-green-500", text: "text-green-400", bg: "bg-green-500/10" },
  3: { label: "Vermelho", border: "border-red-500",   text: "text-red-400",   bg: "bg-red-500/10"   },
} as const;

function ArcanaEditorSection({
  arcana, availableArcana, onAdd, onRemove,
}: {
  arcana: BuildRow[];
  availableArcana: Asset[];
  onAdd: (arcana_id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}) {
  const [qty, setQty] = useState<Record<number, number>>({});

  const usedPerTier = (tier: number) =>
    arcana.filter(a => {
      const avail = availableArcana.find(av => av.id === a.arcana_id);
      return avail?.tier === tier;
    }).reduce((s, a) => s + (a.quantity ?? 0), 0);

  return (
    <Section title="Arcana">
      {([1, 2, 3] as const).map(tier => {
        const info = TIER_INFO[tier];
        const tierArcana = arcana.filter(a => availableArcana.find(av => av.id === a.arcana_id)?.tier === tier);
        const used = usedPerTier(tier);
        const remaining = 10 - used;
        const available = availableArcana.filter(a => a.tier === tier);

        return (
          <div key={tier} className={`rounded-xl border p-4 mb-4 ${info.border} ${info.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <p className={`text-xs font-bold uppercase tracking-wider ${info.text}`}>{info.label}</p>
              <span className="text-[10px] text-gray-500">
                {used}/10 slots usados {remaining > 0 && <span className={info.text}>({remaining} restando)</span>}
              </span>
            </div>

            {/* Arcanas já adicionadas nesse tier */}
            {tierArcana.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tierArcana.map(a => (
                  <div key={a.id} className="relative group flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full border overflow-hidden bg-dark-700 ${info.border}`}>
                      {a.image_url
                        ? <Image src={a.image_url} alt={a.name} width={44} height={44} className="object-cover w-full h-full" />
                        : <div className={`w-full h-full flex items-center justify-center text-xs ${info.text}`}>{a.name[0]}</div>}
                    </div>
                    <span className="text-[9px] text-gray-400">{a.quantity}x</span>
                    <button onClick={() => onRemove(a.id)}
                      className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Disponíveis para adicionar */}
            {remaining > 0 && (
              <>
                <p className="text-[10px] text-gray-600 mb-2">Clique + quantidade para adicionar:</p>
                <div className="flex flex-wrap gap-2">
                  {available.map(a => {
                    const alreadyIn = arcana.find(r => r.arcana_id === a.id);
                    if (alreadyIn) return null;
                    const q = qty[a.id] ?? 1;
                    return (
                      <div key={a.id} className="flex flex-col items-center gap-1">
                        <div className={`w-11 h-11 rounded-full border overflow-hidden bg-dark-700 ${info.border} opacity-70`}>
                          {a.image_url
                            ? <Image src={a.image_url} alt={a.name} width={44} height={44} className="object-cover w-full h-full" />
                            : <div className={`w-full h-full flex items-center justify-center text-xs ${info.text}`}>{a.name[0]}</div>}
                        </div>
                        <span className="text-[9px] text-gray-500 text-center max-w-[48px] truncate">{a.name}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" min={1} max={remaining} value={q}
                            onChange={e => setQty(prev => ({ ...prev, [a.id]: Math.min(remaining, Math.max(1, parseInt(e.target.value) || 1)) }))}
                            className="w-10 text-center text-xs bg-dark-600 border border-dark-500 rounded px-1 py-0.5 text-white" />
                          <button onClick={() => onAdd(a.id, q)}
                            className={`w-6 h-6 rounded flex items-center justify-center text-dark-900 font-bold transition-colors ${info.bg} ${info.border} border`}>
                            <Plus size={12} className={info.text} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {remaining === 0 && <p className="text-[10px] text-gray-600">10 slots preenchidos ✓</p>}
          </div>
        );
      })}
    </Section>
  );
}

interface Props {
  buildId: number;
  availableItems: Asset[];
  availableArcana: Asset[];
  availableSpells: Asset[];
  availableSkills: Asset[];
}

export default function BuildEditor({ buildId, availableItems, availableArcana, availableSpells, availableSkills }: Props) {
  const [items, setItems] = useState<BuildRow[]>([]);
  const [arcana, setArcana] = useState<BuildRow[]>([]);
  const [spells, setSpells] = useState<BuildRow[]>([]);
  const [skillOrder, setSkillOrder] = useState<BuildRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"start" | "core" | "boots" | "final">("core");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/builds/${buildId}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
      setArcana(data.arcana ?? []);
      setSpells(data.spells ?? []);
      setSkillOrder(data.skill_order ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add(type: string, data: Record<string, unknown>) {
    await fetch(`/api/admin/builds/${buildId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
    });
    await load();
  }

  async function remove(type: string, rowId: number) {
    await fetch(`/api/admin/builds/${buildId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, rowId }),
    });
    await load();
  }

  if (loading) return <div className="text-gray-500 text-sm">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ITEMS */}
      <Section title="Itens da Build">
        <div className="flex flex-wrap gap-2 mb-4">
          {([
            { value: "start", label: "Item Inicial" },
            { value: "core", label: "Core" },
            { value: "boots", label: "Botas" },
            { value: "final", label: "Build Final" },
          ] as const).map((p) => (
            <button key={p.value} onClick={() => setPhase(p.value)}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${phase === p.value ? "bg-gold-500 text-dark-900" : "bg-dark-600 text-gray-400 hover:text-white border border-dark-500"}`}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Preview por fase */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-[10px]">
          {([
            { value: "start", label: "Item Inicial" },
            { value: "core", label: "Core" },
            { value: "boots", label: "Botas" },
            { value: "final", label: "Build Final" },
          ] as const).map((p) => {
            const phaseItems = items.filter((i) => i.phase === p.value);
            return (
              <div key={p.value} className={`rounded-lg p-2 border ${phase === p.value ? "border-gold-500/50 bg-gold-500/5" : "border-dark-500 bg-dark-600/50"}`}>
                <p className="text-gray-500 uppercase tracking-wider mb-1.5">{p.label}</p>
                <div className="flex flex-wrap gap-1">
                  {phaseItems.length === 0
                    ? <span className="text-gray-700 italic">vazio</span>
                    : phaseItems.map((item, i) => (
                      <div key={i} className="relative group">
                        <div className="w-7 h-7 rounded border border-dark-500 overflow-hidden bg-dark-700">
                          {item.image_url
                            ? <Image src={item.image_url} alt={item.name} width={28} height={28} className="object-cover w-full h-full" />
                            : <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-600">{item.name[0]}</div>
                          }
                        </div>
                        <button onClick={() => remove("item", item.id)}
                          className="absolute -top-1 -right-1 bg-red-600 rounded-full w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <X size={8} className="text-white" />
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>


        {/* Available items */}
        <p className="text-xs text-gray-500 mb-2">Clique para adicionar como <strong className="text-gold-400">{phase === "core" ? "Core" : "Item Inicial"}</strong>:</p>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {availableItems.map((item) => (
            <button key={item.id} onClick={() => add("item", { item_id: item.id, phase })}
              className="group relative w-12 h-12 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
              {item.image_url
                ? <Image src={item.image_url} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
                : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">{item.name[0]}</div>
              }
              <div className="absolute inset-0 bg-gold-500/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Plus size={16} className="text-gold-400" />
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* ARCANA */}
      <ArcanaEditorSection
        arcana={arcana}
        availableArcana={availableArcana}
        onAdd={(arcana_id, quantity) => add("arcana", { arcana_id, quantity })}
        onRemove={(id) => remove("arcana", id)}
      />

      {/* SPELLS */}
      <Section title="Feitiços">
        <div className="flex gap-3 mb-4">
          {spells.map((s) => (
            <div key={s.id} className="relative group">
              <div className="w-14 h-14 rounded-lg border border-dark-500 overflow-hidden bg-dark-600">
                {s.image_url
                  ? <Image src={s.image_url} alt={s.name} width={56} height={56} className="object-cover w-full h-full" />
                  : <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">{s.name[0]}</div>
                }
              </div>
              <button onClick={() => remove("spell", s.id)}
                className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
        </div>
        {spells.length < 2 && (
          <div className="flex flex-wrap gap-2">
            {availableSpells.map((s) => (
              <button key={s.id} onClick={() => add("spell", { spell_id: s.id })}
                className="group relative w-12 h-12 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                {s.image_url
                  ? <Image src={s.image_url} alt={s.name} width={48} height={48} className="object-cover w-full h-full" />
                  : <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">{s.name[0]}</div>
                }
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* SKILL ORDER */}
      {availableSkills.length > 0 && (
        <Section title="Ordem de Habilidades">
          <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[48px] p-3 bg-dark-600 rounded-lg border border-dark-500">
            {skillOrder.length === 0
              ? <p className="text-xs text-gray-600">Nenhuma habilidade na ordem ainda</p>
              : skillOrder.map((s, i) => (
                <div key={s.id} className="flex items-center gap-1">
                  <div className="relative group">
                    <div className="w-10 h-10 rounded-lg border border-dark-500 overflow-hidden bg-dark-700">
                      {s.image_url
                        ? <Image src={s.image_url} alt={s.name} width={40} height={40} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold-400">{s.name?.[0]}</div>
                      }
                    </div>
                    <button onClick={() => remove("skill", s.id)}
                      className="absolute -top-1 -right-1 bg-red-600 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                  {i < skillOrder.length - 1 && <span className="text-gray-600">›</span>}
                </div>
              ))
            }
          </div>
          <p className="text-xs text-gray-500 mb-2">Clique na ordem desejada:</p>
          <div className="flex gap-2">
            {availableSkills.map((s) => (
              <button key={s.id} onClick={() => add("skill", { skill_id: s.id })}
                className="group relative flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 hover:border-gold-500 transition-colors">
                  {s.image_url
                    ? <Image src={s.image_url} alt={s.name} width={40} height={40} className="object-cover w-full h-full" />
                    : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold-400">{s.key?.toUpperCase()}</div>
                  }
                </div>
                <span className="text-[10px] text-gray-500">{s.key?.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
      <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">{title}</p>
      {children}
    </div>
  );
}
