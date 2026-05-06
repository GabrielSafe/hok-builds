"use client";

import { useState } from "react";
import Image from "next/image";
import { TrendingUp, TrendingDown, Clock, X } from "lucide-react";

type ChangeType = "buff" | "nerf" | "adjustment" | null;

export interface IndicatorEntity {
  id: number;
  name: string;
  image_url?: string | null;
  subtitle?: string;
  change_type?: ChangeType;
}

const OPTIONS: { value: ChangeType; label: string; icon: React.ReactNode; active: string }[] = [
  { value: "buff",       label: "Buff",   icon: <TrendingUp size={14} />,   active: "border-green-500 text-green-400 bg-green-500/10" },
  { value: "nerf",       label: "Nerf",   icon: <TrendingDown size={14} />, active: "border-red-500 text-red-400 bg-red-500/10" },
  { value: "adjustment", label: "Ajuste", icon: <Clock size={14} />,        active: "border-orange-500 text-orange-400 bg-orange-500/10" },
  { value: null,         label: "Limpar", icon: <X size={14} />,            active: "border-dark-500 text-gray-500" },
];

interface Props {
  entities: IndicatorEntity[];
  apiPath: string;
}

export default function IndicatorManager({ entities, apiPath }: Props) {
  const [indicators, setIndicators] = useState<Record<number, ChangeType>>(
    Object.fromEntries(entities.map((e) => [e.id, e.change_type ?? null]))
  );
  const [saving, setSaving] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  async function setIndicator(entityId: number, value: ChangeType) {
    setSaving(entityId);
    await fetch(`/api/admin/${apiPath}/${entityId}/indicator`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ change_type: value }),
    });
    setIndicators((prev) => ({ ...prev, [entityId]: value }));
    setSaving(null);
  }

  const filtered = entities.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input w-64"
      />

      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] px-5 py-2.5 border-b border-dark-600 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          <span>Nome</span>
          <span>Indicador</span>
        </div>

        <div className="divide-y divide-dark-600 max-h-[560px] overflow-y-auto">
          {filtered.map((entity) => {
            const current = indicators[entity.id];
            return (
              <div key={entity.id} className="flex items-center justify-between px-5 py-3 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {entity.image_url ? (
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-dark-500 shrink-0">
                      <Image src={entity.image_url} alt={entity.name} fill sizes="36px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center text-sm font-black text-dark-400 shrink-0">
                      {entity.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{entity.name}</p>
                    {entity.subtitle && <p className="text-[10px] text-gray-500">{entity.subtitle}</p>}
                  </div>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {OPTIONS.map((opt) => {
                    const isActive = current === opt.value;
                    return (
                      <button
                        key={String(opt.value)}
                        onClick={() => setIndicator(entity.id, opt.value)}
                        disabled={saving === entity.id}
                        title={opt.label}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all disabled:opacity-50 ${
                          isActive ? opt.active : "border-dark-500 text-gray-600 hover:border-dark-400"
                        }`}
                      >
                        {opt.icon}
                        <span className="hidden sm:inline">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-500">Nenhum resultado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
