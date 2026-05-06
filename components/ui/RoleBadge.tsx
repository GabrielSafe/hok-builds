import { cn } from "@/lib/utils";
import type { HeroRole } from "@/types";

const roleColors: Record<HeroRole, string> = {
  Tank: "bg-blue-900/60 text-blue-300 border-blue-700",
  Fighter: "bg-orange-900/60 text-orange-300 border-orange-700",
  Assassin: "bg-purple-900/60 text-purple-300 border-purple-700",
  Mage: "bg-indigo-900/60 text-indigo-300 border-indigo-700",
  Marksman: "bg-green-900/60 text-green-300 border-green-700",
  Support: "bg-teal-900/60 text-teal-300 border-teal-700",
  Jungle: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
};

const roleLabels: Record<HeroRole, string> = {
  Tank: "Tanque",
  Fighter: "Lutador",
  Assassin: "Assassino",
  Mage: "Mago",
  Marksman: "Atirador",
  Support: "Suporte",
  Jungle: "Selva",
};

interface Props {
  role: HeroRole[];
  size?: "sm" | "md";
}

export default function RoleBadge({ role, size = "sm" }: Props) {
  return (
    <div className="flex flex-wrap gap-1">
      {role.map((r) => (
        <span
          key={r}
          className={cn(
            "inline-block font-semibold border rounded-full",
            roleColors[r] ?? "bg-gray-800 text-gray-300 border-gray-600",
            size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
          )}
        >
          {roleLabels[r] ?? r}
        </span>
      ))}
    </div>
  );
}
