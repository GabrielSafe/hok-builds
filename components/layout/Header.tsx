"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Menu, Swords } from "lucide-react";
import type { Hero } from "@/types";
import { formatRoles } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/heroes", label: "Heróis" },
  { href: "/tier-list", label: "Tier List" },
  { href: "/builds", label: "Builds" },
  { href: "/guides", label: "Guias" },
];

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hero[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setResults([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/heroes?search=${encodeURIComponent(query)}&limit=6`);
      setResults(await res.json());
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-dark-500" style={{ background: "rgba(11,15,23,0.96)" }}>
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center gap-3 md:gap-8">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="HOK Builds" width={160} height={34} className="h-8 w-auto object-contain" priority />
        </Link>

        {/* Nav — Montserrat uppercase */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link px-3 py-2 rounded text-gray-400 hover:text-gold-400 hover:bg-dark-700/50 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* E-Sports — destaque */}
        <Link
          href="/esports"
          className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-lg font-heading font-bold text-xs tracking-wide transition-all shrink-0 ml-auto border border-gold-500/40 text-gold-400 hover:bg-gold-500/10 hover:border-gold-500 hover:shadow-[0_0_12px_rgba(212,160,23,0.3)]"
          style={{ background: "linear-gradient(135deg, rgba(212,160,23,0.08), rgba(212,160,23,0.03))" }}
        >
          <Swords size={14} />
          E-Sports
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative min-w-0 max-w-xs">
          <div className="flex items-center rounded-lg px-3 py-2 gap-2 transition-colors focus-within:border-gold-400" style={{ background: "#1E293B", border: "1px solid #27272A" }}>
            <Search size={15} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar herói..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent flex-1 text-sm outline-none placeholder:text-gray-600 font-sans"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); }}>
                <X size={13} className="text-gray-500 hover:text-white" />
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-dark-700 border border-dark-600 rounded-xl overflow-hidden shadow-2xl z-50">
              {results.map((hero) => (
                <Link
                  key={hero.id}
                  href={`/heroes/${hero.slug}`}
                  onClick={() => { setQuery(""); setResults([]); }}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-dark-600 transition-colors"
                >
                  {hero.icon_url ? (
                    <Image src={hero.icon_url} alt={hero.name} width={32} height={32} className="rounded-lg object-cover w-8 h-8" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-dark-500 flex items-center justify-center text-xs font-bold text-gold-400 font-heading">
                      {hero.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white font-heading">{hero.name}</p>
                    <p className="text-xs text-gray-500">{formatRoles(hero.role)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-white">
          <Menu size={20} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-600 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="nav-link py-2 text-gray-400 hover:text-gold-400 transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
