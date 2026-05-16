"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Hero, Creator } from "@/types";
import { CREATOR_TYPE_LABELS, LANE_LABELS } from "@/components/admin/CreatorForm";

interface Props {
  heroes: Hero[];
  creators?: Creator[];
  buildId?: number;
}

export default function BuildForm({ heroes, creators = [], buildId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    hero_id: heroes[0]?.id ?? "",
    creator_id: "" as number | "",
    title: "Build Recomendada",
    description: "",
    patch_version: "",
    is_recommended: true,
  });

  function handleCreatorChange(value: string) {
    const id = value === "" ? "" : parseInt(value);
    const creator = creators.find(c => c.id === id);
    setForm(prev => ({
      ...prev,
      creator_id: id,
      is_recommended: id === "" ? prev.is_recommended : false,
      title: creator ? `Build de ${creator.name}` : "Build Recomendada",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      creator_id: form.creator_id === "" ? null : form.creator_id,
    };

    const res = await fetch(buildId ? `/api/admin/builds/${buildId}` : "/api/admin/builds", {
      method: buildId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar");
      setLoading(false);
      return;
    }

    router.push("/admin/builds");
    router.refresh();
  }

  const selectedCreator = creators.find(c => c.id === form.creator_id);

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Herói *</label>
        <select
          value={form.hero_id}
          onChange={(e) => setForm({ ...form, hero_id: parseInt(e.target.value) })}
          className="input"
          required
        >
          {heroes.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {creators.length > 0 && (
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Criador</label>
          <select
            value={form.creator_id}
            onChange={(e) => handleCreatorChange(e.target.value)}
            className="input"
          >
            <option value="">Nenhum — Build Padrão</option>
            {["pro_player", "streamer", "coach"].map(type => {
              const group = creators.filter(c => c.creator_type === type);
              if (group.length === 0) return null;
              return (
                <optgroup key={type} label={CREATOR_TYPE_LABELS[type as keyof typeof CREATOR_TYPE_LABELS]}>
                  {group.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          {selectedCreator && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-dark-600 rounded-lg border border-gold-500/20">
              {selectedCreator.avatar_url ? (
                <Image src={selectedCreator.avatar_url} alt={selectedCreator.name} width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-dark-500 flex items-center justify-center text-xs font-black text-gold-400">{selectedCreator.name[0]}</div>
              )}
              <span className="text-sm text-white font-medium">{selectedCreator.name}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {CREATOR_TYPE_LABELS[selectedCreator.creator_type]}
                {selectedCreator.main_role ? ` · ${LANE_LABELS[selectedCreator.main_role] ?? selectedCreator.main_role}` : ""}
              </span>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Título</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Versão do Patch</label>
        <input
          type="text"
          placeholder="ex: 5.3"
          value={form.patch_version}
          onChange={(e) => setForm({ ...form, patch_version: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Descrição</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input resize-none"
        />
      </div>

      {!form.creator_id && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="recommended"
            checked={form.is_recommended}
            onChange={(e) => setForm({ ...form, is_recommended: e.target.checked })}
            className="w-4 h-4 accent-gold-500"
          />
          <label htmlFor="recommended" className="text-sm text-gray-300">Build Recomendada</label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-dark-900 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Salvando..." : "Criar Build"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-dark-600 hover:bg-dark-500 border border-dark-500 text-gray-300 font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
