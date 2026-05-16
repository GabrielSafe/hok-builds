"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Twitch, Youtube, Twitter } from "lucide-react";
import type { Creator, CreatorType } from "@/types";

const TYPE_BADGE: Record<CreatorType, { label: string; color: string }> = {
  pro_player: { label: "Pro Player", color: "bg-gold-500/20 text-gold-400 border border-gold-500/30" },
  streamer:   { label: "Streamer",   color: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
  coach:      { label: "Coach",      color: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
};

const LANE_LABELS: Record<string, string> = {
  top_lane: "Top Lane",
  jungle:   "Selva",
  mid:      "Mid",
  marksman: "Atirador",
  support:  "Suporte",
};

interface Props {
  creators: Creator[];
}

export default function StreamersShowcase({ creators }: Props) {
  const [expanded, setExpanded] = useState(Math.floor(creators.length / 2));

  if (creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center mb-4">
          <Twitch size={24} className="text-gray-600" />
        </div>
        <p className="text-gray-400 font-semibold">Nenhum parceiro cadastrado ainda.</p>
        <p className="text-gray-600 text-sm mt-1">Em breve novos streamers parceiros!</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 w-full px-4 overflow-x-auto scrollbar-hide">
      {creators.map((creator, idx) => {
        const isExpanded = idx === expanded;
        const badge = TYPE_BADGE[creator.creator_type];

        return (
          <div
            key={creator.id}
            onMouseEnter={() => setExpanded(idx)}
            className="relative cursor-pointer overflow-hidden rounded-2xl shrink-0 transition-all duration-500 ease-in-out"
            style={{
              width: isExpanded ? "22rem" : "5rem",
              height: "26rem",
            }}
          >
            {/* Background / avatar */}
            <div className="absolute inset-0">
              {creator.avatar_url ? (
                <Image
                  src={creator.avatar_url}
                  alt={creator.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 352px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-700">
                  <span className="text-5xl font-black text-gold-400/30">{creator.name[0]}</span>
                </div>
              )}
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
            </div>

            {/* Collapsed: vertical name */}
            {!isExpanded && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <p className="text-[10px] font-bold text-white/70 tracking-widest uppercase"
                  style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}>
                  {creator.name}
                </p>
              </div>
            )}

            {/* Expanded: info overlay */}
            {isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
                {/* Badge */}
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                  {badge.label}
                </span>

                {/* Name */}
                <div>
                  <h3 className="text-xl font-heading font-black text-white leading-tight">{creator.name}</h3>
                  {creator.main_role && (
                    <p className="text-xs text-gray-400 mt-0.5">{LANE_LABELS[creator.main_role] ?? creator.main_role}</p>
                  )}
                </div>

                {/* Description */}
                {creator.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{creator.description}</p>
                )}

                {/* Social links */}
                <div className="flex items-center gap-2 pt-1">
                  {creator.twitch_url && (
                    <a href={creator.twitch_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 transition-colors text-purple-300 text-xs font-semibold">
                      <Twitch size={12} />
                      Twitch
                    </a>
                  )}
                  {creator.youtube_url && (
                    <a href={creator.youtube_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 transition-colors text-red-300 text-xs font-semibold">
                      <Youtube size={12} />
                      YouTube
                    </a>
                  )}
                  {creator.twitter_url && (
                    <a href={creator.twitter_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-dark-600/60 hover:bg-dark-500 border border-dark-500 transition-colors text-gray-300 text-xs">
                      <Twitter size={12} />
                    </a>
                  )}
                  {!creator.twitch_url && !creator.youtube_url && !creator.twitter_url && (
                    <span className="text-[10px] text-gray-600">Sem redes sociais</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
