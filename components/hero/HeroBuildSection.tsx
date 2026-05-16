"use client";

import Image from "next/image";
import type { Build } from "@/types";

type ChangeType = "buff" | "nerf" | "adjustment" | null;
interface FlatItem  { item_name: string; item_image_url: string | null; sort_order: number; phase: string; item_change_type?: ChangeType; }
interface FlatArcana { arcana_name: string; arcana_image_url: string | null; quantity: number; arcana_tier: number; arcana_change_type?: ChangeType; }
interface FlatSpell  { spell_name: string; spell_image_url: string | null; spell_change_type?: ChangeType; }
interface FlatSkill  { skill_name: string; skill_key: string; skill_image_url: string | null; sort_order: number; }

/* ─── Indicator badge ───────────────────────────────────── */
function IndicatorBadge({ type }: { type: ChangeType }) {
  if (!type) return null;
  const styles: Record<NonNullable<ChangeType>, { bg: string; symbol: string }> = {
    buff:       { bg: "#22C55E", symbol: "↑" },
    nerf:       { bg: "#EF4444", symbol: "↓" },
    adjustment: { bg: "#F97316", symbol: "⏱" },
  };
  const s = styles[type];
  return (
    <div style={{
      position: "absolute", top: -2, right: -2,
      width: 16, height: 16, borderRadius: "50%",
      background: s.bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 9, fontWeight: 900,
      color: "#fff", zIndex: 10, boxShadow: "0 1px 4px rgba(0,0,0,.6)",
    }}>
      {s.symbol}
    </div>
  );
}

/* ─── Item ring ─────────────────────────────────────────── */
function ItemRing({ name, imageUrl, size = 60, changeType }: { name: string; imageUrl: string | null; size?: number; changeType?: ChangeType }) {
  const ring = size + 6;
  return (
    <div className="flex flex-col items-center gap-2" style={{ width: ring + 8 }}>
      {/* Outer ring */}
      <div style={{ position: "relative" }}>
      <IndicatorBadge type={changeType ?? null} />
      <div
        style={{
          width: ring,
          height: ring,
          borderRadius: "50%",
          padding: 3,
          background: "linear-gradient(135deg,#3B82F6 0%,#6366F1 55%,#8B5CF6 100%)",
          boxShadow: "0 0 12px rgba(99,102,241,.55), 0 3px 10px rgba(0,0,0,.7)",
          transition: "all .2s ease",
          cursor: "pointer",
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = "linear-gradient(135deg,#FACC15 0%,#F0C040 55%,#D4AF37 100%)";
          el.style.boxShadow = "0 0 18px rgba(250,204,21,.7)";
          el.style.transform = "scale(1.12)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.background = "linear-gradient(135deg,#3B82F6 0%,#6366F1 55%,#8B5CF6 100%)";
          el.style.boxShadow = "0 0 12px rgba(99,102,241,.55), 0 3px 10px rgba(0,0,0,.7)";
          el.style.transform = "scale(1)";
        }}
      >
        {/* Inner circle */}
        <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: "#0B0F17" }}>
          {imageUrl
            ? <Image src={imageUrl} alt={name} width={size} height={size} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#71717A" }}>{name[0]}</div>
          }
        </div>
      </div>
      </div>
      <span style={{ fontSize: 10, color: "#A1A1AA", textAlign: "center", lineHeight: 1.3, maxWidth: ring + 8, fontFamily: "var(--font-inter)" }}>
        {name}
      </span>
    </div>
  );
}

/* ─── Arcana hexagon grid ───────────────────────────────── */
const TIER_CONFIG = {
  1: { label: "Azul",     bg: "#0D1B3E", border: "#3B82F6", glow: "rgba(59,130,246,.6)",  empty: "#0a1630" },
  2: { label: "Verde",    bg: "#0D2A1A", border: "#22C55E", glow: "rgba(34,197,94,.6)",   empty: "#091f13" },
  3: { label: "Vermelho", bg: "#2A0D0D", border: "#EF4444", glow: "rgba(239,68,68,.6)",   empty: "#1f0909" },
} as const;

/* ─── Arcana SVG hex grid — layout unificado igual ao jogo ─── */

// Grade com formato exato do jogo: 6-7-8-7-8-7-6
// start = coluna inicial (pode ser 0, 0.5 ou 1.0 — em unidades de coluna)
// tier = 0 (ghost) por enquanto; posições serão definidas pelo usuário
const ROWS_DEF = [
  { start: 1.0, count: 6 },
  { start: 0.5, count: 7 },
  { start: 0.0, count: 8 },
  { start: 0.5, count: 7 },
  { start: 0.0, count: 8 },
  { start: 0.5, count: 7 },
  { start: 1.0, count: 6 },
];

// Mapa de tier: "row-hexIndex" → 1=azul, 2=verde, 3=vermelho, ausente=ghost
// Linha 0 (6): B B _ R R _
// Linha 1 (7): B B _ _ R R _
// Linha 2 (8): B _ G G _ _ _ R
// Linha 3 (7): B _ G G G _ R
// Linha 4 (8): B _ G G G _ _ R
// Linha 5 (7): B _ G G _ _ R
// Linha 6 (6): B B _ R R _
const TIER_MAP: Record<string, number> = {
  "0-0":1,"0-1":1,"0-3":3,"0-4":3,
  "1-0":1,"1-1":1,"1-4":3,"1-5":3,
  "2-0":1,"2-2":2,"2-3":2,"2-7":3,
  "3-0":1,"3-2":2,"3-3":2,"3-4":2,"3-6":3,
  "4-0":1,"4-2":2,"4-3":2,"4-4":2,"4-7":3,
  "5-0":1,"5-2":2,"5-3":2,"5-6":3,
  "6-0":1,"6-1":1,"6-3":3,"6-4":3,
};

const R = 28;        // circumradius
const S3 = Math.sqrt(3);
const COL_STEP = R * S3;
const ROW_STEP = R * 1.5;
const PAD = R + 6;

function hexPts(cx: number, cy: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

function ArcanaHexGrid({ arcana }: { arcana: FlatArcana[] }) {
  // Expande arcanas por tier em slots individuais
  const tierSlots: Record<number, Array<{ name: string; imageUrl: string | null }>> = { 1: [], 2: [], 3: [] };
  arcana.forEach(a => {
    for (let i = 0; i < a.quantity; i++)
      tierSlots[a.arcana_tier]?.push({ name: a.arcana_name, imageUrl: a.arcana_image_url });
  });
  const tierIdx = { 1: 0, 2: 0, 3: 0 };

  // Gera todos os hexagonos a partir da definição de linhas
  type HexData = { cx: number; cy: number; tier: number; slot: { name: string; imageUrl: string | null } | null; key: string };
  const hexes: HexData[] = [];

  ROWS_DEF.forEach(({ start, count }, ri) => {
    for (let hi = 0; hi < count; hi++) {
      const cx = PAD + (start + hi) * COL_STEP;
      const cy = PAD + ri * ROW_STEP;
      const key = `${ri}-${hi}`;
      const tier = TIER_MAP[key] ?? 0;
      let slot: { name: string; imageUrl: string | null } | null = null;
      if (tier > 0) {
        slot = tierSlots[tier]?.[tierIdx[tier as 1|2|3]] ?? null;
        tierIdx[tier as 1|2|3]++;
      }
      hexes.push({ cx, cy, tier, slot, key });
    }
  });

  // Dimensões do SVG
  const maxCx = Math.max(...hexes.map(h => h.cx));
  const maxCy = Math.max(...hexes.map(h => h.cy));
  const svgW = maxCx + R + PAD;
  const svgH = maxCy + R + PAD;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        <defs>
          {hexes.filter(h => h.slot?.imageUrl).map(h => (
            <clipPath key={`cp-${h.key}`} id={`cp-${h.key}`}>
              <polygon points={hexPts(h.cx, h.cy)} />
            </clipPath>
          ))}
        </defs>

        {hexes.map(h => {
          const pts = hexPts(h.cx, h.cy);

          if (h.tier === 0) {
            return (
              <polygon key={h.key} points={pts}
                fill="rgba(255,255,255,0.03)"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={1} />
            );
          }

          const cfg = TIER_CONFIG[h.tier as 1|2|3];
          const hasFill = !!h.slot;
          return (
            <g key={h.key}>
              <polygon
                points={pts}
                fill={hasFill ? cfg.bg : cfg.empty}
                stroke={cfg.border}
                strokeWidth={hasFill ? 1.5 : 0.8}
                strokeOpacity={hasFill ? 1 : 0.4}
              />
              {hasFill && h.slot?.imageUrl && (
                <image
                  href={h.slot.imageUrl}
                  x={h.cx - R * S3 / 2}
                  y={h.cy - R}
                  width={R * S3}
                  height={R * 2}
                  clipPath={`url(#cp-${h.key})`}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
              {hasFill && !h.slot?.imageUrl && (
                <text x={h.cx} y={h.cy + 4} textAnchor="middle" fill={cfg.border} fontSize={11} fontWeight="bold">
                  {h.slot!.name[0]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Skill ring ────────────────────────────────────────── */
function SkillRing({ name, skillKey, imageUrl }: { name: string; skillKey: string; imageUrl: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        style={{
          width: 50, height: 50, borderRadius: 10, padding: 3,
          background: "linear-gradient(135deg,#3B82F6 0%,#6366F1 100%)",
          boxShadow: "0 0 12px rgba(99,102,241,.5)",
          transition: "all .2s", cursor: "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.12)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 7, overflow: "hidden", background: "#0B0F17", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {imageUrl
            ? <Image src={imageUrl} alt={name} width={44} height={44} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 13, fontWeight: 900, color: "#FACC15", fontFamily: "var(--font-orbitron)" }}>{skillKey.toUpperCase()}</span>
          }
        </div>
      </div>
      <span style={{ fontSize: 10, color: "#71717A", fontFamily: "var(--font-montserrat)", fontWeight: 700, textTransform: "uppercase" }}>{skillKey.toUpperCase()}</span>
    </div>
  );
}

/* ─── Section box ───────────────────────────────────────── */
function PhaseSection({ label, highlight = false, children }: { label: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 10,
      padding: "12px 16px",
      border: highlight ? "1px solid #3F3F46" : "1px solid #27272A",
      background: highlight ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.02)",
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#71717A", fontFamily: "var(--font-montserrat)", marginBottom: 12 }}>
        {label}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Spell frame ───────────────────────────────────────── */
function SpellFrame({ name, imageUrl, changeType }: { name: string; imageUrl: string | null; changeType?: ChangeType }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div style={{ position: "relative" }}>
      <IndicatorBadge type={changeType ?? null} />
      <div
        style={{
          width: 56, height: 56, borderRadius: 12, padding: 3,
          background: "linear-gradient(135deg,#22C55E 0%,#16A34A 100%)",
          boxShadow: "0 0 12px rgba(34,197,94,.45)",
          transition: "all .2s", cursor: "pointer",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.1)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 9, overflow: "hidden", background: "#0B0F17" }}>
          {imageUrl
            ? <Image src={imageUrl} alt={name} width={50} height={50} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#71717A" }}>{name[0]}</div>
          }
        </div>
      </div>
      </div>
      <span style={{ fontSize: 10, color: "#A1A1AA", fontFamily: "var(--font-inter)" }}>{name}</span>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */
export default function HeroBuildSection({ build }: { build: Build }) {
  const items      = (build.items       ?? []) as unknown as FlatItem[];
  const arcana     = (build.arcana      ?? []) as unknown as FlatArcana[];
  const spells     = (build.spells      ?? []) as unknown as FlatSpell[];
  const skillOrder = (build.skill_order ?? []) as unknown as FlatSkill[];

  const startItems = items.filter(i => i.phase === "start");
  const coreItems  = items.filter(i => i.phase === "core");
  const bootsItems = items.filter(i => i.phase === "boots");
  const finalItems = items.filter(i => i.phase === "final");
  const hasPhases  = startItems.length + coreItems.length + bootsItems.length + finalItems.length > 0;

  const card: React.CSSProperties = {
    background: "linear-gradient(135deg,#1E293B,#1F1F23)",
    border: "1px solid #27272A",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,.5)",
  };
  const cardHeader: React.CSSProperties = {
    padding: "12px 20px",
    borderBottom: "1px solid #27272A",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
  const sectionLabel: React.CSSProperties = {
    fontFamily: "var(--font-montserrat)",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#FACC15",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── ITEMS ── */}
      {items.length > 0 && (
        <div style={card}>
          <div style={cardHeader}>
            <span style={sectionLabel}>Build de Itens</span>
            {build.patch_version && (
              <span style={{ fontSize: 11, color: "#71717A", background: "#0F172A", border: "1px solid #27272A", borderRadius: 6, padding: "2px 8px", fontFamily: "var(--font-inter)" }}>
                Patch {build.patch_version}
              </span>
            )}
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {hasPhases ? (
              <>
                {/* Row 1 */}
                {(startItems.length > 0 || coreItems.length > 0 || bootsItems.length > 0) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
                    {startItems.length > 0 && (
                      <PhaseSection label="Item Inicial">
                        {startItems.map((item, i) => <ItemRing key={i} name={item.item_name} imageUrl={item.item_image_url} size={54} changeType={item.item_change_type} />)}
                      </PhaseSection>
                    )}
                    {coreItems.length > 0 && (
                      <PhaseSection label="Core Items" highlight>
                        {coreItems.map((item, i) => <ItemRing key={i} name={item.item_name} imageUrl={item.item_image_url} size={60} changeType={item.item_change_type} />)}
                      </PhaseSection>
                    )}
                    {bootsItems.length > 0 && (
                      <PhaseSection label="Botas">
                        {bootsItems.map((item, i) => <ItemRing key={i} name={item.item_name} imageUrl={item.item_image_url} size={54} changeType={item.item_change_type} />)}
                      </PhaseSection>
                    )}
                  </div>
                )}
                {/* Row 2 — Final */}
                {finalItems.length > 0 && (
                  <div style={{ borderTop: "1px solid #27272A", paddingTop: 16 }}>
                    <PhaseSection label="Build Final" highlight>
                      {finalItems.map((item, i) => <ItemRing key={i} name={item.item_name} imageUrl={item.item_image_url} size={60} changeType={item.item_change_type} />)}
                    </PhaseSection>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
                {items.map((item, i) => <ItemRing key={i} name={item.item_name} imageUrl={item.item_image_url} size={56} changeType={item.item_change_type} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ARCANA ── */}
      {arcana.length > 0 && (
        <div style={card}>
          <div style={cardHeader}><span style={sectionLabel}>Arcana</span></div>
          <div style={{ padding: 20 }}>
            <ArcanaHexGrid arcana={arcana} />
          </div>
        </div>
      )}

      {/* ── SPELLS ── */}
      {spells.length > 0 && (
        <div style={card}>
          <div style={cardHeader}><span style={sectionLabel}>Feitiços</span></div>
          <div style={{ padding: 20, display: "flex", gap: 12, alignItems: "flex-end" }}>
            {spells.map((s, i) => <SpellFrame key={i} name={s.spell_name} imageUrl={s.spell_image_url} changeType={s.spell_change_type} />)}
          </div>
        </div>
      )}

      {/* ── SKILL ORDER ── */}
      {skillOrder.length > 0 && (
        <div style={card}>
          <div style={cardHeader}><span style={sectionLabel}>Ordem de Habilidades</span></div>
          <div style={{ padding: 20, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {skillOrder.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SkillRing name={s.skill_name} skillKey={s.skill_key} imageUrl={s.skill_image_url} />
                {i < skillOrder.length - 1 && (
                  <span style={{ color: "#3F3F46", fontSize: 22, fontWeight: 700, marginBottom: 18 }}>›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
