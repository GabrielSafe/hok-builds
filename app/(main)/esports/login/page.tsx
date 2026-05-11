"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, KeyRound } from "lucide-react";

export default function EsportsLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/esports/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Chave inválida");
      setLoading(false);
      return;
    }

    router.push("/esports");
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-gold-400" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-white mb-2">Acesso E-Sports</h1>
          <p className="text-gray-500 text-sm">Insira sua chave de acesso para utilizar as ferramentas de coach.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX-XXXX"
              className="w-full bg-dark-700 border border-dark-600 focus:border-gold-500/50 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-center text-lg tracking-widest outline-none transition-colors placeholder:text-gray-700 placeholder:text-base placeholder:tracking-normal placeholder:font-sans"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center bg-red-900/20 border border-red-700/40 rounded-lg py-2 px-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 text-dark-900 font-heading font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Não tem uma chave? Entre em contato com o administrador.
        </p>
      </div>
    </div>
  );
}
