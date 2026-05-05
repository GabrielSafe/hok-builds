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
}

const SKILL_KEYS = [
  { key: "passive", label: "Passiva",    order: 0 },
  { key: "1",       label: "Habilidade 1", order: 1 },
  { key: "2",       label: "Habilidade 2", order: 2 },
  { key: "3",       label: "Habilidade 3", order: 3 },
  { key: "ult",     label: "Ultimate",   order: 4 },
];

export default function SkillsEditor({ heroId, heroSlug }: { heroId: number; heroSlug: string }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    setLoading(true);
    const res = await fetch(`/api/admin/skills/${heroId}`);
    const data = await res.json();
    const loaded: Skill[] = SKILL_KEYS.map(sk => {
      const existing = data.find((d: Skill) => d.key === sk.key);
      return existing
        ? { ...existing, imagePreview: existing.image_url ?? undefined }
        : { key: sk.key, name: "", description: "", image_url: null, sort_order: sk.order };
    });
    setSkills(loaded);
    setLoading(false);
  }

  function handleFile(index: number, file: File) {
    const preview = URL.createObjectURL(file);
    setSkills(prev => prev.map((s, i) => i === index ? { ...s, imageFile: file, imagePreview: preview } : s));
  }

  function handleChange(index: number, field: keyof Skill, value: string) {
    setSkills(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  async function uploadImage(file: File, key: string): Promise<string> {
    const fd = new FormData();
    const ext = file.name.split(".").pop() ?? "webp";
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
      if (skill.imageFile) {
        imageUrl = await uploadImage(skill.imageFile, skill.key);
      }

      const payload = { id: skill.id, name: skill.name, key: skill.key, description: skill.description, image_url: imageUrl, sort_order: skill.sort_order };
      const method = skill.id ? "PUT" : "POST";
      const res = await fetch(`/api/admin/skills/${heroId}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar");
      const saved = await res.json();

      setSkills(prev => prev.map((s, i) => i === index ? { ...saved, imagePreview: saved.image_url ?? undefined, saving: false } : s));
      setSuccess(`Habilidade "${skill.name}" salva!`);
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setSkills(prev => prev.map((s, i) => i === index ? { ...s, saving: false } : s));
    }
  }

  async function deleteSkill(index: number) {
    const skill = skills[index];
    if (!skill.id) {
      setSkills(prev => prev.map((s, i) => i === index ? { ...s, name: "", description: "", image_url: null, imagePreview: undefined, imageFile: undefined } : s));
      return;
    }
    if (!confirm(`Remover "${skill.name}"?`)) return;
    await fetch(`/api/admin/skills/${heroId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: skill.id }),
    });
    setSkills(prev => prev.map((s, i) => i === index ? { key: s.key, name: "", description: "", image_url: null, sort_order: s.sort_order } : s));
  }

  if (loading) return <div className="text-sm text-gray-500 py-4">Carregando habilidades...</div>;

  return (
    <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
        <p className="section-label">Habilidades</p>
        {success && <span className="text-xs text-green-400">{success}</span>}
      </div>

      <div className="divide-y divide-dark-600">
        {skills.map((skill, index) => {
          const meta = SKILL_KEYS.find(k => k.key === skill.key)!;
          return (
            <div key={skill.key} className="p-5">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-heading font-bold text-gold-400 uppercase tracking-wider bg-dark-600 px-2 py-0.5 rounded">
                  {meta.label}
                </span>
                {skill.id && <span className="text-xs text-green-400">Salvo</span>}
              </div>

              <div className="flex gap-4 items-start">
                {/* Image upload */}
                <div className="shrink-0">
                  <label className="cursor-pointer block">
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(index, f); }} />
                    <div
                      className="relative rounded-xl overflow-hidden border-2 transition-all hover:border-gold-500"
                      style={{
                        width: 72, height: 72,
                        border: skill.imagePreview ? "2px solid #3B82F6" : "2px dashed #27272A",
                        background: "#0B0F17",
                      }}
                    >
                      {skill.imagePreview ? (
                        <Image src={skill.imagePreview} alt={skill.name || "skill"} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <Upload size={18} className="text-gray-600" />
                          <span className="text-[9px] text-gray-600">Ícone</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-heading">Nome da Habilidade</label>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={e => handleChange(index, "name", e.target.value)}
                      placeholder={`Nome da ${meta.label}`}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1 font-heading">Descrição</label>
                    <textarea
                      rows={2}
                      value={skill.description}
                      onChange={e => handleChange(index, "description", e.target.value)}
                      placeholder="Descreva o efeito da habilidade..."
                      className="input resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 justify-end">
                {skill.id && (
                  <button
                    onClick={() => deleteSkill(index)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
                  >
                    <Trash2 size={13} /> Remover
                  </button>
                )}
                <button
                  onClick={() => saveSkill(index)}
                  disabled={!skill.name.trim() || skill.saving}
                  className="flex items-center gap-1.5 text-xs font-heading font-bold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                  style={{ background: skill.name.trim() ? "#D4AF37" : "#27272A", color: skill.name.trim() ? "#0B0F17" : "#71717A" }}
                >
                  <Save size={13} />
                  {skill.saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
