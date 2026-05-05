"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Hero } from "@/types";

interface Props {
  heroes: Hero[];
  buildId?: number;
}

export default function BuildForm({ heroes, buildId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    hero_id: heroes[0]?.id ?? "",
    title: "Build Recomendada",
    description: "",
    patch_version: "",
    is_recommended: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(buildId ? `/api/admin/builds/${buildId}` : "/api/admin/builds", {
      method: buildId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

      <p className="text-xs text-gray-500 bg-dark-700 border border-dark-600 rounded-lg p-3">
        Após criar a build, acesse o banco de dados para adicionar itens, arcana e feitiços via tabelas <code className="text-gold-400">build_items</code>, <code className="text-gold-400">build_arcana</code> e <code className="text-gold-400">build_spells</code>.
        Em breve teremos editor visual completo.
      </p>

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
