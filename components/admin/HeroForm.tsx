"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import type { Hero, HeroRole } from "@/types";

const ROLES: HeroRole[] = ["Tank", "Fighter", "Assassin", "Mage", "Marksman", "Support", "Jungle"];

const ROLE_LABELS: Record<HeroRole, string> = {
  Tank: "Tanque", Fighter: "Lutador", Assassin: "Assassino",
  Mage: "Mago", Marksman: "Atirador", Support: "Suporte", Jungle: "Selva",
};

interface Props {
  hero?: Hero;
}

export default function HeroForm({ hero }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [splashFile, setSplashFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState(hero?.icon_url ?? "");
  const [splashPreview, setSplashPreview] = useState(hero?.splash_url ?? "");

  const [form, setForm] = useState({
    name: hero?.name ?? "",
    role: hero?.role ?? (["Marksman"] as HeroRole[]),
    difficulty: hero?.difficulty ?? 1,
    description: hero?.description ?? "",
    lore: hero?.lore ?? "",
    is_published: hero?.is_published ?? false,
    is_featured: hero?.is_featured ?? false,
    icon_url: hero?.icon_url ?? "",
    splash_url: hero?.splash_url ?? "",
  });

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "icon" | "splash"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === "icon") { setIconFile(file); setIconPreview(preview); }
    else { setSplashFile(file); setSplashPreview(preview); }
  }

  async function uploadFile(file: File, path: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", path);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload falhou");
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const slug = form.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
      let iconUrl = form.icon_url;
      let splashUrl = form.splash_url;

      if (iconFile) iconUrl = await uploadFile(iconFile, `heroes/${slug}/icon.webp`);
      if (splashFile) splashUrl = await uploadFile(splashFile, `heroes/${slug}/splash.webp`);

      const payload = { ...form, icon_url: iconUrl, splash_url: splashUrl };
      const url = hero ? `/api/admin/heroes/${hero.id}` : "/api/admin/heroes";
      const method = hero ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao salvar");
      }

      router.push("/admin/heroes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome *">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Função *">
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => {
              const active = (form.role as HeroRole[]).includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    const current = form.role as HeroRole[];
                    const next = active
                      ? current.filter((x) => x !== r)
                      : [...current, r];
                    if (next.length > 0) setForm({ ...form, role: next });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                    active
                      ? "border-gold-500 text-gold-400 bg-gold-500/10"
                      : "border-dark-500 text-gray-500 hover:border-gold-500/40"
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <Field label={`Dificuldade: ${form.difficulty}/5`}>
        <input
          type="range"
          min={1}
          max={5}
          value={form.difficulty}
          onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) })}
          className="w-full accent-gold-500"
        />
      </Field>

      <Field label="Descrição">
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input resize-none"
        />
      </Field>

      <Field label="Lore">
        <textarea
          rows={4}
          value={form.lore}
          onChange={(e) => setForm({ ...form, lore: e.target.value })}
          className="input resize-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <ImageUpload
          label="Ícone (64x64)"
          preview={iconPreview}
          onChange={(e) => handleFileChange(e, "icon")}
        />
        <ImageUpload
          label="Splash Art"
          preview={splashPreview}
          onChange={(e) => handleFileChange(e, "splash")}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={form.is_published}
          onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          className="w-4 h-4 accent-gold-500"
        />
        <label htmlFor="published" className="text-sm text-gray-300">Publicar herói</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-dark-900 font-bold text-sm px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Salvando..." : hero ? "Salvar Alterações" : "Criar Herói"}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ImageUpload({
  label,
  preview,
  onChange,
}: {
  label: string;
  preview: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Field label={label}>
      <label className="block cursor-pointer">
        <input type="file" accept="image/*" onChange={onChange} className="hidden" />
        <div className="border-2 border-dashed border-dark-500 hover:border-gold-500/50 rounded-lg p-3 transition-colors text-center">
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-24 object-cover rounded" />
          ) : (
            <div className="h-24 flex flex-col items-center justify-center gap-2 text-gray-600">
              <Upload size={20} />
              <span className="text-xs">Clique para enviar</span>
            </div>
          )}
        </div>
      </label>
    </Field>
  );
}
