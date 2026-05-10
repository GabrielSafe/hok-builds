"use client";

import { useState, useEffect, useRef } from "react";

interface BannerMedia {
  id: number;
  url: string;
  type: "video" | "image";
}

export default function BannerMediaBackground() {
  const [media, setMedia] = useState<BannerMedia[]>([]);
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/banner-media")
      .then(r => r.json())
      .then((data: BannerMedia[]) => { if (data.length > 0) setMedia(data); });
  }, []);

  useEffect(() => {
    if (media.length <= 1) return;
    timerRef.current = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % media.length);
        setFading(false);
      }, 800);
    }, 7000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, media]);

  if (media.length === 0) return null;

  const item = media[current];

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ transition: "opacity 0.8s ease", opacity: fading ? 0 : 1 }}
    >
      {item.type === "video" ? (
        <video
          key={item.url}
          src={item.url}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={item.url}
          src={item.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Gradient overlay — deixa o texto legível */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to right, rgba(11,15,23,0.85) 0%, rgba(11,15,23,0.55) 50%, rgba(11,15,23,0.4) 100%)"
      }} />
      <div className="absolute inset-0" style={{
        background: "linear-gradient(to bottom, transparent 50%, rgba(11,15,23,0.95) 100%)"
      }} />
    </div>
  );
}
