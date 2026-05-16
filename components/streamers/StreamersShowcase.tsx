"use client";

import { useState } from "react";
import Image from "next/image";
import { Twitch, Youtube, Twitter } from "lucide-react";
import type { Creator, CreatorType } from "@/types";

const LANE_LABELS: Record<string, string> = {
  top_lane: "Top Lane",
  jungle:   "Selva",
  mid:      "Mid",
  marksman: "Atirador",
  support:  "Suporte",
};

const TYPE_COLOR: Record<CreatorType, string> = {
  pro_player: "text-yellow-600",
  streamer:   "text-purple-600",
  coach:      "text-blue-600",
};

interface Props {
  creators: Creator[];
}

export default function StreamersShowcase({ creators }: Props) {
  const [expandedIdx, setExpandedIdx] = useState(0);

  if (creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Twitch size={28} className="text-gray-600 mb-3" />
        <p className="text-gray-400 font-semibold">Nenhum parceiro cadastrado ainda.</p>
        <p className="text-gray-600 text-sm mt-1">Em breve novos parceiros!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex h-full w-full items-center justify-center overflow-hidden px-5 py-10">
        <div className="relative w-full max-w-6xl">
          <div className="flex w-full items-center justify-center gap-1">
            {creators.map((creator, idx) => {
              const isExpanded = idx === expandedIdx;
              return (
                <div
                  key={creator.id}
                  className="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out shrink-0"
                  style={{
                    width: isExpanded ? "24rem" : "5rem",
                    height: "24rem",
                  }}
                  onMouseEnter={() => setExpandedIdx(idx)}
                >
                  {/* Image */}
                  {creator.avatar_url ? (
                    <img
                      className="w-full h-full object-cover"
                      src={creator.avatar_url}
                      alt={creator.name}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-5xl font-black text-gray-400">{creator.name[0]}</span>
                    </div>
                  )}

                  {/* Info overlay — só no expandido */}
                  {isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${TYPE_COLOR[creator.creator_type]}`}>
                        {creator.creator_type === "pro_player" ? "Pro Player" : creator.creator_type === "streamer" ? "Streamer" : "Coach"}
                      </p>
                      <p className="text-white font-heading font-black text-xl leading-tight">{creator.name}</p>
                      {creator.main_role && (
                        <p className="text-white/60 text-xs mt-0.5">{LANE_LABELS[creator.main_role] ?? creator.main_role}</p>
                      )}
                      {creator.description && (
                        <p className="text-white/50 text-xs mt-1.5 line-clamp-2">{creator.description}</p>
                      )}
                      <div className="flex gap-2 mt-3">
                        {creator.twitch_url && (
                          <a href={creator.twitch_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white text-xs font-semibold transition-colors border border-white/20">
                            <Twitch size={11} /> Twitch
                          </a>
                        )}
                        {creator.youtube_url && (
                          <a href={creator.youtube_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white text-xs font-semibold transition-colors border border-white/20">
                            <Youtube size={11} /> YouTube
                          </a>
                        )}
                        {creator.twitter_url && (
                          <a href={creator.twitter_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white text-xs transition-colors border border-white/20">
                            <Twitter size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
