"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Erro ao fazer login");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-dark-900 font-black text-sm">HOK</span>
          </div>
          <h1 className="text-xl font-bold text-white">Painel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">HOK Builds</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-700 border border-dark-600 rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-dark-800 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-dark-800 border border-dark-500 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-gold-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-dark-900 font-bold text-sm py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
