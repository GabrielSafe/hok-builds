"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Save, Upload } from "lucide-react";

interface Skill {
  id?: number;
  key: string;
  name: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  imageFile?: File;
  imagePreview?: string;
  saving?: boolean;
  isExtra?: boolean;
}

const DEFAULT_KEYS = [
  { key: "passive", label: "Passiva",      order: 0 },
  { key: "1",       label: "Habilidade 1", order: 1 },
  { key: "2",       label: "Habilidade 2", order: 2 },
  { key: "3",       label: "Habilidade 3", order: 3 },
];

function emptySkill(key: string, order: number, isExtra = false): Skill {
  return { key, name: "", description: "", image_url: null, sort_order: order, isExtra };
}

export default function SkillsEditor({ heroId, heroSlug }: { heroId: number; heroSlug: string }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    setLoading(true);
    const res = await fetch(`/api/admin/skills/${heroId}`);
    const data: Skill[] = await res.json();

    const defaultSlots: Skill[] = DEFAULT_KEYS.map(dk => {
      const saved = data.find(d => d.key === dk.key);
      return saved
        ? { ...saved, imagePreview: saved.image_url ?? undefined }
        : emptySkill(dk.key, dk.order);
    });

    const extraSaved = data.filter(d => !DEFAULT_KEYS.find(dk => dk.key === d.key));
    const extras: Skill[] = extraSaved.map(d => ({
      ...d,
      imagePreview: d.image_url ?? undefined,
      isExtra: true,
    }));

    setSkills([...defaultSlots, ...extras]);
    setLoading(false);
  }

  function addExtra() {
    const existingExtras = skills.filter(s => s.isExtra);
    const nextOrder = skills.length;
    const nextKey = `${nextOrder + 1}`;
    setSkills(prev => [...prev, emptySkill(nextKey, nextOrder, true)]);
  }

  function handleFile(index: number, file: File) {
    const preview = URL.createObjectURL(file);
    setSkills(prev => prev.map((s, i) => i === index ? { ...s, imageFile: file, imagePreview: preview } : s));
  }

  function handleChange(index: number, field: "name" | "description" | "key", value: string) {
    setSkills(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  async function uploadImage(file: File, key: string): Promise<string> {
    const ext = file.name.split(".").pop() ?? "webp";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", `skills/${heroSlug}/${key}.${ext}`);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload falhou");
    return data.url;
  }

  async function saveSkill(index: number) {
    const skill = skills[index];
    if (!skill.name.trim()) return;

    setSkills(prev => prev.map((s, i) => i === index ? { ...s, saving: true } : s));

    try {
      let imageUrl = skill.image_url;
      if (skill.imageFile) imageUrl = await uploadImage(skill.imageFile, skill.key);

      const payload = {
        id: skill.id,
        name: skill.name,
        key: skill.key,
        description: skill.description,
        image_url: imageUrl,
        sort_order: skill.sort_order,
      };

      const res = await fetch(`/api/admin/skills/${heroId}`, {
        method: skill.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
      const saved = await res.json();

      setSkills(prev => prev.map((s, i) =>
        i === index ? { ...saved, imagePreview: saved.image_url ?? undefined, isExtra: s.isExtra, saving: false } : s
      ));
      setSuccess(`"${skill.name}" salva!`);
      setTimeout(() => setSuccess(""), 2000);
    } catch {
      setSkills(prev => prev.map((s, i) => i === index ? { ...s, saving: false } : s));
    }
  }

  async function deleteSkill(index: number) {
    const skill = skills[index];

    if (!skill.id) {
      setSkills(prev => prev.filter((_, i) => i !== index));
      return;
    }

    if (!confirm(`Remover "${skill.name}"?`)) return;

    await fetch(`/api/admin/skills/${heroId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: skill.id }),
    });

    if (skill.isExtra) {
      setSkills(prev => prev.filter((_, i) => i !== index));
    } else {
      setSkills(prev => prev.map((s, i) =>
        i === index ? emptySkill(s.key, s.sort_order) : s
      ));
    }
  }

  const keyLabel = (key: string) => DEFAULT_KEYS.find(k => k.key === key)?.label ?? `Habilidade ${key}`;

  if (loading) return <div className="text-sm text-gray-500 py-4">Carregando habilidades...</div>;

  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
        <p className="section-label">Habilidades</p>
        {success && <span className="text-xs text-green-400">{success}</span>}
      </div>

      <div className="divide-y divide-dark-600">
        {skills.map((skill, index) => (
          <div key={`${skill.key}-${index}`} className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-heading font-bold text-gold-400 uppercase tracking-wider bg-dark-600 px-2 py-0.5 rounded">
                {keyLabel(skill.key)}
              </span>
              {skill.isExtra && (
                <input
                  type="text"
                  value={skill.key}
                  onChange={e => handleChange(index, "key", e.target.value)}
                  placeholder="ex: ult, 4, passive2..."
                  className="text-xs bg-dark-600 border border-dark-500 rounded px-2 py-0.5 text-gray-300 outline-none focus:border-gold-500 w-32"
                />
              )}
              {skill.id && <span className="text-xs text-green-400">Salvo</span>}
            </div>

            <div className="flex gap-4 items-start">
              {/* Icon upload */}
              <label className="cursor-pointer shrink-0">
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(index, f); }} />
                <div
                  className="relative rounded-xl overflow-hidden transition-all hover:opacity-80"
                  style={{
                    width: 72, height: 72,
                    border: skill.imagePreview ? "2px solid #3B82F6" : "2px dashed #3F3F46",
                    background: "#0B0F17",
                  }}
                >
                  {skill.imagePreview ? (
                    <Image src={skill.imagePreview} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <Upload size={18} className="text-gray-600" />
                      <span className="text-[9px] text-gray-600 font-sans">Ícone</span>
                    </div>
                  )}
                </div>
              </label>

              {/* Fields */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-heading">Nome</label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={e => handleChange(index, "name", e.target.value)}
                    placeholder={`Nome da ${keyLabel(skill.key)}`}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 font-heading">Descrição</label>
                  <textarea
                    rows={2}
                    value={skill.description}
                    onChange={e => handleChange(index, "description", e.target.value)}
                    placeholder="Efeito da habilidade..."
                    className="input resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3 justify-end">
              <button
                onClick={() => deleteSkill(index)}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
              >
                <Trash2 size={13} />
                {skill.isExtra ? "Remover" : "Limpar"}
              </button>
              <button
                onClick={() => saveSkill(index)}
                disabled={!skill.name.trim() || skill.saving}
                className="flex items-center gap-1.5 text-xs font-heading font-bold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                style={{
                  background: skill.name.trim() ? "#D4AF37" : "#27272A",
                  color: skill.name.trim() ? "#0B0F17" : "#71717A",
                }}
              >
                <Save size={13} />
                {skill.saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="px-5 py-4 border-t border-dark-600">
        <button
          onClick={addExtra}
          className="flex items-center gap-2 text-sm font-heading font-semibold text-gray-400 hover:text-gold-400 transition-colors"
        >
          <div className="w-6 h-6 rounded-full border-2 border-dashed border-dark-400 hover:border-gold-500 flex items-center justify-center transition-colors">
            <Plus size={12} />
          </div>
          Adicionar Habilidade Extra
        </button>
      </div>
    </div>
  );
}
