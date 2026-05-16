"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import type { Creator, CreatorType } from "@/types";

const CREATOR_TYPES: { value: CreatorType; label: string; color: string }[] = [
  { value: "pro_player", label: "Pro Player", color: "text-gold-400" },
  { value: "streamer", label: "Streamer", color: "text-purple-400" },
  { value: "coach", label: "Coach", color: "text-blue-400" },
];

const LANES = [
  { value: "top_lane", label: "Top Lane" },
  { value: "jungle", label: "Selva" },
  { value: "mid", label: "Mid" },
  { value: "marksman", label: "Atirador" },
  { value: "support", label: "Suporte" },
];

export const CREATOR_TYPE_LABELS: Record<CreatorType, string> = {
  pro_player: "Pro Player",
  streamer: "Streamer",
  coach: "Coach",
};

export const LANE_LABELS: Record<string, string> = {
  top_lane: "Top Lane",
  jungle: "Selva",
  mid: "Mid",
  marksman: "Atirador",
  support: "Suporte",
};

interface Props {
  creators: Creator[];
  onRefresh: () => void;
}

export default function CreatorForm({ creators, onRefresh }: Props) {
  const [form, setForm] = useState<{
    name: string;
    creator_type: CreatorType;
    main_role: string;
    description: string;
    twitch_url: string;
    youtube_url: string;
    twitter_url: string;
  }>({
    name: "",
    creator_type: "pro_player",
    main_role: "",
    description: "",
    twitch_url: "",
    youtube_url: "",
    twitter_url: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const showLane = form.creator_type === "pro_player" || form.creator_type === "streamer";

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(file: File, name: string): Promise<string> {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", `creators/${slug}/avatar.webp`);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);

    let avatar_url = null;
    if (avatarFile) avatar_url = await uploadAvatar(avatarFile, form.name);

    await fetch("/api/admin/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        main_role: showLane ? form.main_role || null : null,
        avatar_url,
      }),
    });

    setForm({ name: "", creator_type: "pro_player", main_role: "", description: "", twitch_url: "", youtube_url: "", twitter_url: "" });
    setAvatarFile(null);
    setAvatarPreview("");
    setSuccess("Criador cadastrado!");
    setTimeout(() => setSuccess(""), 2500);
    setSaving(false);
    onRefresh();
  }

  async function deleteCreator(id: number) {
    if (!confirm("Remover este criador?")) return;
    await fetch(`/api/admin/creators/${id}`, { method: "DELETE" });
    onRefresh();
  }

  const byType = (type: CreatorType) => creators.filter(c => c.creator_type === type);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      {/* Form */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5 space-y-4">
        <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Novo Criador</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Avatar */}
          <label className="cursor-pointer block">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-dark-500 hover:border-gold-500/50 overflow-hidden bg-dark-600 flex items-center justify-center transition-colors shrink-0">
                {avatarPreview
                  ? <Image src={avatarPreview} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  : <Upload size={18} className="text-gray-600" />
                }
              </div>
              <span className="text-xs text-gray-500">Clique para enviar foto</span>
            </div>
          </label>

          {/* Tipo */}
          <div>
            <label className="text-xs text-gray-400 block mb-1.5">Tipo *</label>
            <div className="flex gap-2">
              {CREATOR_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, creator_type: t.value, main_role: "" })}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${form.creator_type === t.value ? "border-gold-500 bg-gold-500/10 text-white" : "border-dark-500 bg-dark-600 text-gray-400 hover:text-white"}`}
                >
                  <span className={form.creator_type === t.value ? t.color : ""}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Nome *</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Lefy" className="input" />
          </div>

          {showLane && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">Rota Principal</label>
              <select value={form.main_role} onChange={e => setForm({ ...form, main_role: e.target.value })} className="input">
                <option value="">Selecionar...</option>
                {LANES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 block mb-1">Descrição</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Sobre o criador..." className="input resize-none" />
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Redes Sociais</p>
            <input type="text" value={form.twitch_url} onChange={e => setForm({ ...form, twitch_url: e.target.value })} placeholder="Twitch URL" className="input text-xs" />
            <input type="text" value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })} placeholder="YouTube URL" className="input text-xs" />
            <input type="text" value={form.twitter_url} onChange={e => setForm({ ...form, twitter_url: e.target.value })} placeholder="Twitter/X URL" className="input text-xs" />
          </div>

          {success && <p className="text-xs text-green-400">{success}</p>}

          <button type="submit" disabled={saving || !form.name.trim()}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-dark-900 font-bold text-sm py-2.5 rounded-lg transition-colors">
            {saving ? "Salvando..." : "Cadastrar Criador"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-600">
          <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Criadores ({creators.length})</p>
        </div>

        <div className="divide-y divide-dark-600 max-h-[520px] overflow-y-auto">
          {creators.length === 0 && (
            <p className="px-5 py-4 text-sm text-gray-500">Nenhum criador cadastrado.</p>
          )}

          {CREATOR_TYPES.map(t => {
            const list = byType(t.value);
            if (list.length === 0) return null;
            return (
              <div key={t.value}>
                <p className={`px-5 py-2 text-[10px] font-bold uppercase tracking-wider bg-dark-800/50 ${t.color}`}>{t.label}</p>
                {list.map(creator => (
                  <div key={creator.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-dark-500 shrink-0 bg-dark-600">
                      {creator.avatar_url
                        ? <Image src={creator.avatar_url} alt={creator.name} width={40} height={40} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm font-black text-gold-400">{creator.name[0]}</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{creator.name}</p>
                      <p className="text-xs text-gray-500">
                        {creator.main_role ? LANE_LABELS[creator.main_role] ?? creator.main_role : CREATOR_TYPE_LABELS[creator.creator_type]}
                      </p>
                    </div>
                    <button onClick={() => deleteCreator(creator.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
