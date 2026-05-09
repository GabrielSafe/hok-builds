"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import type { ProPlayer } from "@/types";
import { ROLE_LABELS } from "@/lib/utils";

const ROLES = ["Tank","Fighter","Assassin","Mage","Marksman","Support","Jungle"];

interface Props {
  players: ProPlayer[];
  onRefresh: () => void;
}

export default function ProPlayerForm({ players, onRefresh }: Props) {
  const [form, setForm] = useState({ name: "", main_role: "", description: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

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
    fd.append("path", `pro-players/${slug}/avatar.webp`);
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

    await fetch("/api/admin/pro-players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, avatar_url }),
    });

    setForm({ name: "", main_role: "", description: "" });
    setAvatarFile(null);
    setAvatarPreview("");
    setSuccess("Pro player criado!");
    setTimeout(() => setSuccess(""), 2000);
    setSaving(false);
    onRefresh();
  }

  async function deletePlayer(id: number) {
    if (!confirm("Remover pro player?")) return;
    await fetch(`/api/admin/pro-players/${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
      {/* Form */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5 space-y-4">
        <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Novo Pro Player</p>

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

          <div>
            <label className="text-xs text-gray-400 block mb-1">Nome *</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Lefy" className="input" />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Role Principal</label>
            <select value={form.main_role} onChange={e => setForm({...form, main_role: e.target.value})} className="input">
              <option value="">Selecionar...</option>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Descrição</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Sobre o player..." className="input resize-none" />
          </div>

          {success && <p className="text-xs text-green-400">{success}</p>}

          <button type="submit" disabled={saving || !form.name.trim()}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-dark-900 font-bold text-sm py-2.5 rounded-lg transition-colors">
            {saving ? "Salvando..." : "Criar Pro Player"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-600">
          <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Pro Players ({players.length})</p>
        </div>
        <div className="divide-y divide-dark-600 max-h-96 overflow-y-auto">
          {players.length === 0 && (
            <p className="px-5 py-4 text-sm text-gray-500">Nenhum pro player cadastrado.</p>
          )}
          {players.map(player => (
            <div key={player.id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-dark-500 shrink-0 bg-dark-600">
                {player.avatar_url
                  ? <Image src={player.avatar_url} alt={player.name} width={40} height={40} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-sm font-black text-gold-400">{player.name[0]}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{player.name}</p>
                <p className="text-xs text-gray-500">{player.main_role ? (ROLE_LABELS[player.main_role] ?? player.main_role) : "—"}</p>
              </div>
              <button onClick={() => deletePlayer(player.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
