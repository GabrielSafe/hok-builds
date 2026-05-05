"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Menu } from "lucide-react";
import type { Hero } from "@/types";

export default function Header() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hero[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      const res = await fetch(`/api/heroes?search=${encodeURIComponent(query)}&limit=6`);
      const data = await res.json();
      setResults(data);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <header className="sticky top-0 z-50 bg-dark-800/95 backdrop-blur border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="HOK Builds"
            width={160}
            height={34}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/" className="px-3 py-1.5 rounded hover:text-gold-400 transition-colors">Início</Link>
          <Link href="/heroes" className="px-3 py-1.5 rounded hover:text-gold-400 transition-colors">Heróis</Link>
          <Link href="/tier-list" className="px-3 py-1.5 rounded hover:text-gold-400 transition-colors">Tier List</Link>
          <Link href="/builds" className="px-3 py-1.5 rounded hover:text-gold-400 transition-colors">Builds</Link>
        </nav>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-sm ml-auto">
          <div className="flex items-center bg-dark-600 border border-dark-500 rounded-lg px-3 py-2 focus-within:border-gold-500 transition-colors">
            <Search size={16} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Buscar herói..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent flex-1 ml-2 text-sm outline-none placeholder:text-gray-500"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); }}>
                <X size={14} className="text-gray-500 hover:text-white" />
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-dark-700 border border-dark-500 rounded-lg overflow-hidden shadow-xl z-50">
              {results.map((hero) => (
                <Link
                  key={hero.id}
                  href={`/heroes/${hero.slug}`}
                  onClick={() => { setQuery(""); setResults([]); }}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-dark-600 transition-colors"
                >
                  {hero.icon_url ? (
                    <img src={hero.icon_url} alt={hero.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-dark-500 flex items-center justify-center text-xs font-bold text-gold-400">
                      {hero.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{hero.name}</p>
                    <p className="text-xs text-gray-500">{hero.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-600 px-4 py-3 flex flex-col gap-2 text-sm">
          <Link href="/" onClick={() => setMenuOpen(false)} className="py-2 hover:text-gold-400">Início</Link>
          <Link href="/heroes" onClick={() => setMenuOpen(false)} className="py-2 hover:text-gold-400">Heróis</Link>
          <Link href="/tier-list" onClick={() => setMenuOpen(false)} className="py-2 hover:text-gold-400">Tier List</Link>
          <Link href="/builds" onClick={() => setMenuOpen(false)} className="py-2 hover:text-gold-400">Builds</Link>
        </div>
      )}
    </header>
  );
}
