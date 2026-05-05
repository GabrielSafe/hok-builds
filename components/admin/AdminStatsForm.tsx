"use client";

import { useState } from "react";
import type { Hero } from "@/types";

const TIERS = ["S", "A", "B", "C", "D"];

interface Props {
  heroes: Hero[];
}

export default function AdminStatsForm({ heroes }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    winrate: "",
    pickrate: "",
    banrate: "",
    games_played: "",
    tier: "B",
  });

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setSuccess(false);

    const res = await fetch(`/api/admin/stats/${selected}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winrate: parseFloat(form.winrate) || 0,
        pickrate: parseFloat(form.pickrate) || 0,
        banrate: parseFloat(form.banrate) || 0,
        games_played: parseInt(form.games_played) || 0,
        tier: form.tier,
      }),
    });

    setSaving(false);
    if (res.ok) setSuccess(true);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
      {/* Hero selector */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
        <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-3">Selecionar Herói</p>
        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
          {heroes.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => { setSelected(h.id); setSuccess(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                selected === h.id
                  ? "bg-gold-500/20 border border-gold-500/50 text-gold-400"
                  : "hover:bg-dark-600 text-gray-300 border border-transparent"
              }`}
            >
              {h.icon_url && (
                <img src={h.icon_url} alt={h.name} className="w-6 h-6 rounded object-cover" />
              )}
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats form */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
        <p className="text-xs font-bold text-gold-400 uppercase tracking-wider mb-4">
          {selected ? `Editar: ${heroes.find((h) => h.id === selected)?.name}` : "Selecione um herói"}
        </p>

        <div className="space-y-3">
          {[
            { key: "winrate", label: "Taxa de Vitória (%)" },
            { key: "pickrate", label: "Taxa de Escolha (%)" },
            { key: "banrate", label: "Taxa de Banimento (%)" },
            { key: "games_played", label: "Partidas Jogadas" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1">{label}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                disabled={!selected}
                className="input disabled:opacity-40"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tier</label>
            <div className="flex gap-2">
              {TIERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!selected}
                  onClick={() => setForm({ ...form, tier: t })}
                  className={`w-10 h-10 rounded-lg font-black text-sm border-2 transition-all disabled:opacity-40 ${
                    form.tier === t
                      ? "border-gold-500 text-gold-400 bg-gold-500/10"
                      : "border-dark-500 text-gray-500 hover:border-gold-500/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {success && (
          <p className="text-sm text-green-400 mt-3">Salvo com sucesso!</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!selected || saving}
          className="mt-4 w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-dark-900 font-bold text-sm py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Salvando..." : "Salvar Estatísticas"}
        </button>
      </div>
    </div>
  );
}
