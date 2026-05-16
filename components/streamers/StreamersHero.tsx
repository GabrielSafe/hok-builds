"use client";

import { useState, useEffect, useRef } from "react";

const TITLES = [
  { plain: "A Comunidade que Move o Jogo", jsx: <><span className="text-gold-400">A Comunidade</span> que Move o Jogo</> },
  { plain: "Parceiros HOK Builds",         jsx: <>Parceiros <span className="text-gold-400">HOK Builds</span></> },
  { plain: "Quem Divulga o HOK Builds",    jsx: <>Quem Divulga o <span className="text-gold-400">HOK Builds</span></> },
  { plain: "Criadores que Fazem a Diferença", jsx: <>Criadores que Fazem a <span className="text-gold-400">Diferença</span></> },
];

export default function StreamersHero() {
  const [titleIdx, setTitleIdx] = useState(0);
  const [typedChars, setTypedChars] = useState(TITLES[0].plain.length);
  const [isTyping, setIsTyping] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isTyping) return;
    const title = TITLES[titleIdx].plain;
    if (typedChars >= title.length) { setIsTyping(false); return; }
    const t = setTimeout(() => setTypedChars(c => c + 1), 35);
    return () => clearTimeout(t);
  }, [isTyping, typedChars, titleIdx]);

  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setTitleIdx(prev => {
        const next = (prev + 1) % TITLES.length;
        setTypedChars(0);
        setIsTyping(true);
        return next;
      });
    }, 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, []);

  const title = TITLES[titleIdx];
  const isDone = typedChars >= title.plain.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4 min-h-[60px] md:min-h-[72px]">
        {isDone ? title.jsx : (
          <>{title.plain.slice(0, typedChars)}<span className="animate-pulse text-gold-400">|</span></>
        )}
      </h1>
      <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
        Streamers, Pro Players e Coaches que acreditam no projeto, contribuem diariamente para o crescimento da comunidade e levam o HOK Builds para cada vez mais jogadores.
      </p>
    </div>
  );
}
