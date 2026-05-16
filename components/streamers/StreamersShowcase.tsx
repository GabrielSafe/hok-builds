"use client";

import { useState } from "react";
import type { Creator } from "@/types";

interface Props {
  creators: Creator[];
}

export default function StreamersShowcase({ creators }: Props) {
  const [expandedImage, setExpandedImage] = useState(1);

  const getImageWidth = (index: number) =>
    index === expandedImage ? "24rem" : "5rem";

  if (creators.length === 0) return null;

  return (
    <div className="w-full">
      <div className="relative grid grid-cols-1 items-center justify-center p-2 transition-all duration-300 ease-in-out lg:flex w-full">
        <div className="w-full h-full overflow-hidden rounded-3xl">
          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            <div className="relative w-full max-w-6xl px-5">
              <div className="flex w-full items-center justify-center gap-1">
                {creators.map((creator, idx) => (
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
