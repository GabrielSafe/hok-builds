import Image from "next/image";
import type { Skill } from "@/types";

const KEY_LABELS: Record<string, string> = {
  passive: "Passiva",
  "1":     "Habilidade 1",
  "2":     "Habilidade 2",
  "3":     "Habilidade 3",
  ult:     "Ultimate",
};

const TAG_COLORS: Record<string, string> = {
  Dano:       "bg-red-900/60 text-red-300 border-red-700",
  Marca:      "bg-blue-900/60 text-blue-300 border-blue-700",
  Movimento:  "bg-green-900/60 text-green-300 border-green-700",
  Aceleração: "bg-cyan-900/60 text-cyan-300 border-cyan-700",
  Melhora:    "bg-amber-900/60 text-amber-300 border-amber-700",
  Controle:   "bg-purple-900/60 text-purple-300 border-purple-700",
  Cura:       "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  Escudo:     "bg-slate-700/60 text-slate-300 border-slate-500",
  Passivo:    "bg-gray-700/60 text-gray-400 border-gray-600",
};

const MARKUP_COLORS: Record<string, string> = {
  dano:       "#EF4444",
  movimento:  "#22C55E",
  aceleracao: "#06B6D4",
  melhora:    "#FBBF24",
  marca:      "#60A5FA",
  controle:   "#A78BFA",
  cura:       "#4ADE80",
  passivo:    "#9CA3AF",
};

function SkillText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /\{(\w+)\}([\s\S]*?)\{\/\1\}/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const color = MARKUP_COLORS[match[1].toLowerCase()];
    parts.push(
      <span key={match.index} style={{ color: color ?? "#FACC15", fontWeight: 600 }}>
        {match[2]}
      </span>
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));

  return <>{parts}</>;
}

interface Props {
  skills: Skill[];
}

export default function HeroSkillsSection({ skills }: Props) {
  if (skills.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden border border-dark-600" style={{ background: "linear-gradient(135deg,#1E293B,#1F1F23)" }}>
      <div className="px-5 py-3 border-b border-dark-600">
        <p className="section-label">Habilidades</p>
      </div>

      <div className="divide-y divide-dark-600">
        {skills.map((skill) => (
          <div key={skill.id} className="p-4 flex gap-4">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl border-2 border-dark-500 overflow-hidden bg-dark-600 shrink-0"
              style={{ boxShadow: "0 0 12px rgba(99,102,241,.3)" }}>
              {skill.image_url ? (
                <Image src={skill.image_url} alt={skill.name} width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-black text-gold-400">
                  {skill.key.toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                  {KEY_LABELS[skill.key] ?? skill.key}
                </span>
                <span className="text-sm font-bold text-white">{skill.name}</span>
              </div>

              {/* Tags */}
              {(skill.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {(skill.tags ?? []).map(tag => (
                    <span
                      key={tag}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TAG_COLORS[tag] ?? "bg-gray-700 text-gray-400 border-gray-600"}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {skill.description && (
                <p className="text-xs text-gray-400 leading-relaxed">
                  <SkillText text={skill.description} />
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
