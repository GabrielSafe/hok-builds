"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import HeroBuildSection from "@/components/hero/HeroBuildSection";
import type { Build } from "@/types";

interface RichBuild extends Build {
  pro_player_name?: string | null;
  pro_player_avatar?: string | null;
}

interface Props {
  builds: RichBuild[];
}

export default function HeroBuildSwitcher({ builds }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(builds[0]?.id);

  if (builds.length === 0) return null;

  const selected = builds.find(b => b.id === selectedId) ?? builds[0];
  const isProBuild = !!selected.pro_player_id;

  return (
    <div>
      {/* Selector — só aparece se tiver mais de 1 build */}
      {builds.length > 1 && (
        <div className="relative mb-4">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dark-600 bg-dark-700 hover:border-gold-500/50 transition-colors text-sm"
          >
            {isProBuild && selected.pro_player_avatar && (
              <Image src={selected.pro_player_avatar} alt={selected.pro_player_name ?? ""} width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
            )}
            <span className="text-white font-semibold">
              {isProBuild ? `Build de ${selected.pro_player_name}` : "Build Padrão"}
            </span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ml-auto ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute top-full mt-1 left-0 min-w-[220px] bg-dark-700 border border-dark-600 rounded-xl overflow-hidden shadow-2xl z-20">
              {builds.map(b => {
                const isPro = !!b.pro_player_id;
                const isActive = b.id === selectedId;
                return (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedId(b.id); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isActive ? "bg-gold-500/10 border-l-2 border-gold-500" : "hover:bg-dark-600"}`}
                  >
                    {isPro && b.pro_player_avatar ? (
                      <Image src={b.pro_player_avatar} alt={b.pro_player_name ?? ""} width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-dark-600 border border-dark-500 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-gold-400">STD</span>
                      </div>
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${isActive ? "text-gold-400" : "text-white"}`}>
                        {isPro ? b.pro_player_name : "Build Padrão"}
                      </p>
                      {b.patch_version && <p className="text-[10px] text-gray-500">Patch {b.patch_version}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <HeroBuildSection build={selected as Build} />
    </div>
  );
}
