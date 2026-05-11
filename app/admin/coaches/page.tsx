"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Copy, Check, ToggleLeft, ToggleRight } from "lucide-react";

interface Coach {
  id: number;
  name: string;
  key_value: string;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
}

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/coaches");
    setCoaches(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/admin/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    setSaving(false);
    load();
  }

  async function toggle(coach: Coach) {
    await fetch(`/api/admin/coaches/${coach.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !coach.is_active }),
    });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Remover este coach?")) return;
    await fetch(`/api/admin/coaches/${id}`, { method: "DELETE" });
    load();
  }

  function copyKey(coach: Coach) {
    navigator.clipboard.writeText(coach.key_value);
    setCopied(coach.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold text-white mb-1">Coaches — Acesso E-Sports</h1>
      <p className="text-gray-500 text-sm mb-6">
        Gerencie as chaves de acesso para as ferramentas de E-Sports. Cada coach recebe uma chave única.
      </p>

      {/* Form */}
      <form onSubmit={create} className="flex gap-3 mb-6">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome do coach (ex: Lefy)"
          className="input flex-1"
          required
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-dark-900 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shrink-0"
        >
          <Plus size={16} /> Gerar Chave
        </button>
      </form>

      {/* List */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
          <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Coaches ({coaches.length})</p>
          <p className="text-xs text-gray-500">{coaches.filter(c => c.is_active).length} ativo(s)</p>
        </div>

        {coaches.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-gray-500">Nenhum coach cadastrado ainda.</p>
        )}

        <div className="divide-y divide-dark-600">
          {coaches.map(coach => (
            <div key={coach.id} className={`flex items-center gap-4 px-5 py-4 ${!coach.is_active ? "opacity-50" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">{coach.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono text-gold-400 bg-dark-600 px-2 py-0.5 rounded tracking-widest">
                    {coach.key_value}
                  </code>
                  <button onClick={() => copyKey(coach)} className="text-gray-500 hover:text-white transition-colors">
                    {copied === coach.id ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                  </button>
                </div>
                {coach.last_used && (
                  <p className="text-[10px] text-gray-600 mt-1">
                    Último acesso: {new Date(coach.last_used).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(coach)} title={coach.is_active ? "Desativar" : "Ativar"}
                  className={`transition-colors ${coach.is_active ? "text-green-400 hover:text-gray-400" : "text-gray-600 hover:text-green-400"}`}>
                  {coach.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
                <button onClick={() => remove(coach.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-dark-700/50 border border-dark-600 rounded-xl text-xs text-gray-500 leading-relaxed">
        <p className="font-semibold text-gray-400 mb-1">Como funciona:</p>
        <p>1. Crie uma chave com o nome do coach e clique em <strong className="text-white">Gerar Chave</strong></p>
        <p>2. Copie a chave (formato XXXX-XXXX-XXXX) e envie para o coach</p>
        <p>3. O coach acessa <strong className="text-white">hokbuilds.com.br/esports</strong> e insere a chave</p>
        <p>4. Use o toggle para ativar/desativar o acesso a qualquer momento</p>
      </div>
    </div>
  );
}
