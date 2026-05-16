"use client";

import { useState, useEffect, useCallback } from "react";
import CreatorForm from "@/components/admin/CreatorForm";
import type { Creator } from "@/types";

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/creators");
    setCreators(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-1">Criadores</h1>
      <p className="text-gray-500 text-sm mb-6">
        Gerencie os perfis de Pro Players, Streamers e Coaches. As builds podem ser associadas a cada criador.
      </p>
      <CreatorForm creators={creators} onRefresh={load} />
    </div>
  );
}
