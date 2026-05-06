"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("hok_loaded")) return;
    setVisible(true);

    // Progress bar animation
    const steps = [20, 45, 70, 90, 100];
    const delays = [150, 350, 600, 900, 1200];
    delays.forEach((delay, i) => {
      setTimeout(() => setProgress(steps[i]), delay);
    });

    // Fade out and remove
    setTimeout(() => setFading(true), 1600);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("hok_loaded", "1");
    }, 2100);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0B0F17",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        transition: "opacity 0.5s ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* Logo */}
      <div
        style={{
          animation: "hok-fade-up 0.6s ease forwards",
          opacity: 0,
        }}
      >
        <Image
          src="/logo.png"
          alt="HOK Builds"
          width={200}
          height={44}
          className="w-auto"
          style={{ height: 44, objectFit: "contain" }}
          priority
        />
      </div>

      {/* Progress bar container */}
      <div
        style={{
          width: 220,
          height: 3,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          overflow: "hidden",
          animation: "hok-fade-up 0.6s ease 0.2s forwards",
          opacity: 0,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #B8860B, #D4A017, #FACC15)",
            borderRadius: 999,
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 0 10px rgba(250,204,21,0.5)",
          }}
        />
      </div>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "var(--font-montserrat)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          animation: "hok-fade-up 0.6s ease 0.3s forwards",
          opacity: 0,
          marginTop: -16,
        }}
      >
        Carregando...
      </p>

      <style>{`
        @keyframes hok-fade-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
