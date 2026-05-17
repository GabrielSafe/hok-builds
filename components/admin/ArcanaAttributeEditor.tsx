"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface ArcanaItem {
  id: number;
  name: string;
  image_url: string | null;
  tier: number;
}

interface Attribute {
  id: number;
  arcana_id: number;
  stat_name: string;
  value: number;
  is_percent: boolean;
}

const TIER_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "Azul",     color: "text-blue-400" },
  2: { label: "Verde",    color: "text-green-400" },
  3: { label: "Vermelho", color: "text-red-400" },
};

const COMMON_STATS = [
  "Velocidade de Movimento",
  "Ataque Físico",
  "Defesa Física",
  "Defesa Mágica",
  "Poder Mágico",
  "HP Máximo",
  "Regeneração de HP",
  "Redução de Recarga",
  "Penetração Física",
  "Penetração Mágica",
  "Velocidade de Ataque",
  "Roubo de Vida",
  "Taxa de Crítico",
  "Resistência",
];

export default function ArcanaAttributeEditor() {
  const [arcanas, setArcanas] = useState<ArcanaItem[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [attrs, setAttrs] = useState<Record<number, Attribute[]>>({});
  const [form, setForm] = useState({ stat_name: "", value: "", is_percent: true });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/arcana").then(r => r.json()).then(setArcanas);
  }, []);

  const loadAttrs = useCallback(async (arcanaId: number) => {
    const res = await fetch(`/api/admin/arcana/${arcanaId}/attributes`);
    const data = await res.json();
    setAttrs(prev => ({ ...prev, [arcanaId]: data }));
  }, []);

  function toggleExpand(id: number) {
    if (expanded === id) {
      setExpanded(null);
    } else {
      setExpanded(id);
      loadAttrs(id);
      setForm({ stat_name: "", value: "", is_percent: true });
    }
  }

  async function addAttr(arcanaId: number) {
    if (!form.stat_name || !form.value) return;
    setSaving(true);
    await fetch(`/api/admin/arcana/${arcanaId}/attributes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stat_name: form.stat_name,
        value: parseFloat(form.value),
        is_percent: form.is_percent,
      }),
    });
    setForm({ stat_name: "", value: "", is_percent: true });
    await loadAttrs(arcanaId);
    setSaving(false);
  }

  async function removeAttr(arcanaId: number, attrId: number) {
    await fetch(`/api/admin/arcana/${arcanaId}/attributes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attr_id: attrId }),
    });
    setAttrs(prev => ({
      ...prev,
      [arcanaId]: (prev[arcanaId] ?? []).filter(a => a.id !== attrId),
    }));
  }

  const filtered = arcanas.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar arcana..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-xs"
        />
        <span className="text-xs text-gray-500">{filtered.length} arcanas</span>
      </div>

      {filtered.map(arcana => {
        const tier = TIER_LABEL[arcana.tier] ?? { label: "?", color: "text-gray-400" };
        const isOpen = expanded === arcana.id;
        const arcanaAttrs = attrs[arcana.id] ?? [];

        return (
          <div key={arcana.id} className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggleExpand(arcana.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-600/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-600 shrink-0 border border-dark-500">
                {arcana.image_url
                  ? <Image src={arcana.image_url} alt={arcana.name} width={40} height={40} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-sm font-black text-gold-400">{arcana.name[0]}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{arcana.name}</p>
                <p className={`text-xs ${tier.color}`}>{tier.label}</p>
              </div>
              {isOpen && arcanaAttrs.length > 0 && (
                <span className="text-xs text-gray-500 mr-2">{arcanaAttrs.length} atributo{arcanaAttrs.length !== 1 ? "s" : ""}</span>
              )}
              {isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
            </button>

            {/* Atributos */}
            {isOpen && (
              <div className="border-t border-dark-600 p-4 space-y-4">
                {/* Lista atual */}
                {arcanaAttrs.length > 0 && (
                  <div className="space-y-2">
                    {arcanaAttrs.map(attr => (
                      <div key={attr.id} className="flex items-center gap-2 px-3 py-2 bg-dark-600 rounded-lg">
                        <span className="flex-1 text-sm text-white">
                          {attr.stat_name}:
                          <span className="text-gold-400 font-bold ml-1">
                            +{attr.value}{attr.is_percent ? "%" : ""}
                          </span>
                        </span>
                        <button
                          onClick={() => removeAttr(arcana.id, attr.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form adicionar */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Adicionar Atributo</p>

                  <div className="flex gap-2">
                    <input
                      list={`stats-${arcana.id}`}
                      type="text"
                      placeholder="Nome do atributo"
                      value={form.stat_name}
                      onChange={e => setForm({ ...form, stat_name: e.target.value })}
                      className="input flex-1 text-sm"
                    />
                    <datalist id={`stats-${arcana.id}`}>
                      {COMMON_STATS.map(s => <option key={s} value={s} />)}
                    </datalist>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor"
                      value={form.value}
                      onChange={e => setForm({ ...form, value: e.target.value })}
                      className="input w-24 text-sm"
                    />
                    <div className="flex items-center gap-1.5 px-3 bg-dark-600 border border-dark-500 rounded-lg">
                      <input
                        type="checkbox"
                        id={`pct-${arcana.id}`}
                        checked={form.is_percent}
                        onChange={e => setForm({ ...form, is_percent: e.target.checked })}
                        className="accent-gold-500"
                      />
                      <label htmlFor={`pct-${arcana.id}`} className="text-xs text-gray-400 cursor-pointer">%</label>
                    </div>
                    <button
                      onClick={() => addAttr(arcana.id)}
                      disabled={saving || !form.stat_name || !form.value}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-dark-900 font-bold text-xs rounded-lg transition-colors shrink-0"
                    >
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                </div>

                {arcanaAttrs.length === 0 && (
                  <p className="text-xs text-gray-600 italic">Nenhum atributo cadastrado ainda.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
