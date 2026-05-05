import Image from "next/image";
import type { Skill } from "@/types";

const KEY_LABELS: Record<string, string> = {
  passive: "Passiva",
  "1": "Habilidade 1",
  "2": "Habilidade 2",
  "3": "Habilidade 3",
  ult: "Ultimate",
};

interface Props {
  skills: Skill[];
}

export default function HeroSkillsSection({ skills }: Props) {
  if (skills.length === 0) return null;

  return (
    <div className="bg-dark-700 rounded-xl p-5 border border-dark-600">
      <p className="section-title">Habilidades</p>
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg border border-dark-500 overflow-hidden bg-dark-600 shrink-0">
              {skill.image_url ? (
                <Image src={skill.image_url} alt={skill.name} width={48} height={48} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gold-400">
                  {skill.key.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-white">{skill.name}</span>
                <span className="text-xs text-gray-500">{KEY_LABELS[skill.key] ?? skill.key}</span>
              </div>
              {skill.description && (
                <p className="text-xs text-gray-400 leading-relaxed">{skill.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
