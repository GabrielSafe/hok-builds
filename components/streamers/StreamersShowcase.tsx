"use client";

import { useState } from "react";
import { Twitch, Youtube, Twitter } from "lucide-react";
import type { Creator, CreatorType } from "@/types";

const LANE_LABELS: Record<string, string> = {
  top_lane: "Top Lane",
  jungle:   "Selva",
  mid:      "Mid",
  marksman: "Atirador",
  support:  "Suporte",
};

const TYPE_BADGE: Record<CreatorType, { label: string; color: string }> = {
  pro_player: { label: "Pro Player", color: "bg-gold-500/30 text-gold-300 border border-gold-500/40" },
  streamer:   { label: "Streamer",   color: "bg-purple-500/30 text-purple-200 border border-purple-400/40" },
  coach:      { label: "Coach",      color: "bg-blue-500/30 text-blue-200 border border-blue-400/40" },
};

interface Props {
  creators: Creator[];
}

export default function StreamersShowcase({ creators }: Props) {
  const [expandedImage, setExpandedImage] = useState(1);

  const getImageWidth = (index: number) =>
    index === expandedImage ? "24rem" : "5rem";

  if (creators.length === 0) return null;

  const badge = (type: CreatorType) => TYPE_BADGE[type];

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-full">
        <div className="relative grid grid-cols-1 items-center justify-center p-2 transition-all duration-300 ease-in-out lg:flex w-full">
          <div className="w-full h-full overflow-hidden rounded-3xl">
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <div className="relative w-full max-w-6xl px-5">
                <div className="flex w-full items-center justify-center gap-1">
                  {creators.map((creator, idx) => {
                    const isExpanded = idx + 1 === expandedImage;
                    const b = badge(creator.creator_type);
                    return (
                      <div
                        key={creator.id}
                        className="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out shrink-0"
                        style={{ width: getImageWidth(idx + 1), height: "24rem" }}
                        onMouseEnter={() => setExpandedImage(idx + 1)}
                      >
                        {/* Image */}
                        {creator.avatar_url ? (
                          <img className="w-full h-full object-cover" src={creator.avatar_url} alt={creator.name} />
                        ) : (
                          <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                            <span className="text-4xl font-black text-gold-400/40">{creator.name[0]}</span>
                          </div>
                        )}

                        {/* Overlay — estilo Card 1 (Nike) */}
                        {isExpanded && (
                          <>
                            {/* Gradiente top */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none" />

                            {/* Info topo */}
                            <div className="absolute top-0 left-0 right-0 p-4">
                              <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${b.color}`}>
                                {b.label}
                              </span>
                              <h3 className="text-white font-heading font-black text-2xl mt-2 leading-tight drop-shadow-lg">
                                {creator.name}
                              </h3>
                              {creator.main_role && (
                                <p className="text-white/60 text-xs mt-0.5">{LANE_LABELS[creator.main_role] ?? creator.main_role}</p>
                              )}
                            </div>

                            {/* Redes sociais base */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              {creator.description && (
                                <p className="text-white/60 text-xs mb-3 line-clamp-2 leading-relaxed">{creator.description}</p>
                              )}
                              <div className="flex gap-2 flex-wrap">
                                {creator.twitch_url && (
                                  <a href={creator.twitch_url} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 backdrop-blur text-white text-xs font-bold transition-colors shadow-lg">
                                    <Twitch size={12} /> Twitch
                                  </a>
                                )}
                                {creator.youtube_url && (
                                  <a href={creator.youtube_url} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 backdrop-blur text-white text-xs font-bold transition-colors shadow-lg">
                                    <Youtube size={12} /> YouTube
                                  </a>
                                )}
                                {creator.twitter_url && (
                                  <a href={creator.twitter_url} target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600/80 hover:bg-sky-600 backdrop-blur text-white text-xs font-bold transition-colors shadow-lg">
                                    <Twitter size={12} /> Twitter
                                  </a>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — grid de cards */}
      <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
        {creators.map((creator) => {
          const b = badge(creator.creator_type);
          return (
            <div key={creator.id} className="relative overflow-hidden rounded-2xl aspect-[3/4]">
              {creator.avatar_url ? (
                <img className="w-full h-full object-cover" src={creator.avatar_url} alt={creator.name} />
              ) : (
                <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                  <span className="text-3xl font-black text-gold-400/40">{creator.name[0]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
              <div className="absolute top-0 left-0 right-0 p-3">
                <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${b.color}`}>
                  {b.label}
                </span>
                <p className="text-white font-black text-sm mt-1 leading-tight">{creator.name}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-1.5 flex-wrap">
                {creator.twitch_url && (
                  <a href={creator.twitch_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-600/80 text-white">
                    <Twitch size={12} />
                  </a>
                )}
                {creator.youtube_url && (
                  <a href={creator.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-600/80 text-white">
                    <Youtube size={12} />
                  </a>
                )}
                {creator.twitter_url && (
                  <a href={creator.twitter_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-600/80 text-white">
                    <Twitter size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
