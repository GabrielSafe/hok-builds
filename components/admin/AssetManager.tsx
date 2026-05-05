"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload } from "lucide-react";

interface Asset {
  id: number;
  name: string;
  image_url?: string | null;
  slug?: string;
  tier?: number;
  cost?: number;
  description?: string | null;
}

interface Props {
  title: string;
  apiPath: string;
  storageFolder: string;
  extraFields?: "tier" | "cost";
}

export default function AssetManager({ title, apiPath, storageFolder, extraFields }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState({ name: "", description: "", tier: 1, cost: 0, image_url: "" });

  async function loadAssets() {
    const res = await fetch(`/api/admin/${apiPath}`);
    if (res.ok) setAssets(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadAssets(); }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = form.image_url;

      if (imageFile) {
        const slug = form.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
        const ext = imageFile.name.split(".").pop() ?? "webp";
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("path", `${storageFolder}/${slug}.${ext}`);
        const up = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!up.ok) throw new Error("Upload falhou");
        const upData = await up.json();
        imageUrl = upData.url;
      }

      const res = await fetch(`/api/admin/${apiPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image_url: imageUrl }),
      });

      if (!res.ok) throw new Error((await res.json()).error ?? "Erro");

      setForm({ name: "", description: "", tier: 1, cost: 0, image_url: "" });
      setImageFile(null);
      setImagePreview("");
      setSuccess("Salvo com sucesso!");
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remover?")) return;
    await fetch(`/api/admin/${apiPath}/${id}`, { method: "DELETE" });
    setAssets((a) => a.filter((x) => x.id !== id));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4">Adicionar {title}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-900/30 border border-red-700 rounded px-3 py-2 text-sm text-red-400">{error}</div>}
          {success && <div className="bg-green-900/30 border border-green-700 rounded px-3 py-2 text-sm text-green-400">{success}</div>}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Nome *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
          </div>

          {extraFields === "tier" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tier (1-3)</label>
              <select value={form.tier} onChange={(e) => setForm({ ...form, tier: parseInt(e.target.value) })} className="input">
                <option value={1}>Tier 1</option>
                <option value={2}>Tier 2</option>
                <option value={3}>Tier 3</option>
              </select>
            </div>
          )}

          {extraFields === "cost" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Custo (gold)</label>
              <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: parseInt(e.target.value) })} className="input" />
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Descrição</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-none" />
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Imagem</label>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <div className="border-2 border-dashed border-dark-500 hover:border-gold-500/50 rounded-lg p-3 transition-colors text-center">
                {imagePreview ? (
                  <img src={imagePreview} className="w-16 h-16 object-cover rounded mx-auto" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-600 py-2">
                    <Upload size={20} />
                    <span className="text-xs">Clique para enviar</span>
                  </div>
                )}
              </div>
            </label>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-dark-900 font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Plus size={16} />
            {saving ? "Salvando..." : `Adicionar ${title}`}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-600">
          <h2 className="text-sm font-bold text-white">{title}s cadastrados <span className="text-gray-500 font-normal">({assets.length})</span></h2>
        </div>
        <div className="divide-y divide-dark-600 max-h-[520px] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Carregando...</div>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">Nenhum cadastrado ainda.</div>
          ) : (
            assets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 px-4 py-3 hover:bg-dark-600/50 transition-colors">
                <div className="w-10 h-10 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 shrink-0">
                  {asset.image_url ? (
                    <Image src={asset.image_url} alt={asset.name} width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">{asset.name[0]}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                  {asset.tier != null && <p className="text-xs text-gray-500">Tier {asset.tier}</p>}
                  {asset.cost != null && asset.cost > 0 && <p className="text-xs text-gray-500">{asset.cost} gold</p>}
                </div>
                <button onClick={() => handleDelete(asset.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
