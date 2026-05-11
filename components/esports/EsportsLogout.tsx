"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function EsportsLogout() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/esports/logout", { method: "POST" });
    router.push("/esports/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-900/10"
      title="Sair do E-Sports"
    >
      <LogOut size={13} />
      Sair
    </button>
  );
}
