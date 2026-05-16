"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import HeroBuildSection from "@/components/hero/HeroBuildSection";
import type { Build, CreatorType } from "@/types";

interface RichBuild extends Build {
  creator_name?: string | null;
  creator_avatar?: string | null;
  creator_type?: CreatorType | null;
}

interface Props {
  builds: RichBuild[];
}

const TYPE_BADGE: Record<CreatorType, { label: string; color: string }> = {
  pro_player: { label: "Pro Player", color: "text-gold-400 bg-gold-500/10" },
  streamer:   { label: "Streamer",   color: "text-purple-400 bg-purple-500/10" },
  coach:      { label: "Coach",      color: "text-blue-400 bg-blue-500/10" },
};

export default function HeroBuildSwitcher({ builds }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(builds[0]?.id);

  if (builds.length === 0) return null;

  const selected = builds.find(b => b.id === selectedId) ?? builds[0];
  const isCreatorBuild = !!selected.creator_id;

  return (
    <div>
      {builds.length > 1 && (
        <div className="relative mb-4">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dark-600 bg-dark-700 hover:border-gold-500/50 transition-colors text-sm"
          >
            {isCreatorBuild && selected.creator_avatar && (
              <Image src={selected.creator_avatar} alt={selected.creator_name ?? ""} width={24} height={24} className="w-6 h-6 rounded-full object-cover shrink-0" />
            )}
            <span className="text-white font-semibold">
              {isCreatorBuild ? selected.creator_name : "Build Padrão"}
            </span>
            {isCreatorBuild && selected.creator_type && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TYPE_BADGE[selected.creator_type].color}`}>
                {TYPE_BADGE[selected.creator_type].label}
              </span>
            )}
            <ChevronDown size={14} className={`text-gray-400 transition-transform ml-auto ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute top-full mt-1 left-0 min-w-[240px] bg-dark-700 border border-dark-600 rounded-xl overflow-hidden shadow-2xl z-20">
              {builds.map(b => {
                const isCreator = !!b.creator_id;
                const isActive = b.id === selectedId;
                const badge = b.creator_type ? TYPE_BADGE[b.creator_type] : null;
                return (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedId(b.id); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${isActive ? "bg-gold-500/10 border-l-2 border-gold-500" : "hover:bg-dark-600"}`}
                  >
                    {isCreator && b.creator_avatar ? (
                      <Image src={b.creator_avatar} alt={b.creator_name ?? ""} width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-dark-600 border border-dark-500 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-gold-400">STD</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className={`text-sm font-semibold ${isActive ? "text-gold-400" : "text-white"}`}>
                          {isCreator ? b.creator_name : "Build Padrão"}
                        </p>
                        {badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
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
