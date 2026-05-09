"use client";

import { useState, useEffect, useCallback } from "react";
import ProPlayerForm from "@/components/admin/ProPlayerForm";
import type { ProPlayer } from "@/types";

export default function AdminProPlayersPage() {
  const [players, setPlayers] = useState<ProPlayer[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/pro-players");
    setPlayers(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-1">Pro Players</h1>
      <p className="text-gray-500 text-sm mb-6">
        Gerencie os perfis de pro players. As builds deles podem ser associadas a cada herói.
      </p>
      <ProPlayerForm players={players} onRefresh={load} />
    </div>
  );
}
