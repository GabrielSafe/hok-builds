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

const TYPE_LABEL: Record<CreatorType, string> = {
  pro_player: "Pro Player",
  streamer:   "Streamer",
  coach:      "Coach",
};

interface Props {
  creators: Creator[];
}

export default function StreamersShowcase({ creators }: Props) {
  const [expandedImage, setExpandedImage] = useState(1);

  const getImageWidth = (index: number) =>
    index === expandedImage ? "24rem" : "5rem";

  if (creators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Twitch size={28} className="text-gray-600 mb-3" />
        <p className="text-gray-400 font-semibold">Nenhum parceiro cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <div className="relative grid min-h-screen grid-cols-1 items-center justify-center p-2 transition-all duration-300 ease-in-out lg:flex w-full">
        <div className="w-full h-full overflow-hidden rounded-3xl">
          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            <div className="relative w-full max-w-6xl px-5">
              <div className="flex w-full items-center justify-center gap-1">
                {creators.map((creator, idx) => {
                  const isExpanded = idx + 1 === expandedImage;
                  return (
                    <div
                      key={creator.id}
                      className="relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-500 ease-in-out"
                      style={{
                        width: getImageWidth(idx + 1),
                        height: "24rem",
                      }}
                      onMouseEnter={() => setExpandedImage(idx + 1)}
                    >
                      {creator.avatar_url ? (
                        <img
                          className="w-full h-full object-cover"
                          src={creator.avatar_url}
                          alt={creator.name}
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                          <span className="text-4xl font-black text-gold-400/40">{creator.name[0]}</span>
                        </div>
                      )}

                      {isExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gold-400 mb-1">
                            {TYPE_LABEL[creator.creator_type]}
                          </p>
                          <p className="text-white font-black text-xl leading-tight">{creator.name}</p>
                          {creator.main_role && (
                            <p className="text-white/60 text-xs mt-0.5">{LANE_LABELS[creator.main_role] ?? creator.main_role}</p>
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
      </div>
    </div>
  );
}
