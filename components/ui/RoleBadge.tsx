import { cn } from "@/lib/utils";
import type { HeroRole } from "@/types";

const roleColors: Record<HeroRole, string> = {
  Tank: "bg-blue-900/60 text-blue-300 border-blue-700",
  Fighter: "bg-orange-900/60 text-orange-300 border-orange-700",
  Assassin: "bg-purple-900/60 text-purple-300 border-purple-700",
  Mage: "bg-indigo-900/60 text-indigo-300 border-indigo-700",
  Marksman: "bg-green-900/60 text-green-300 border-green-700",
  Support: "bg-teal-900/60 text-teal-300 border-teal-700",
};

const roleLabels: Record<HeroRole, string> = {
  Tank: "Tanque",
  Fighter: "Lutador",
  Assassin: "Assassino",
  Mage: "Mago",
  Marksman: "Atirador",
  Support: "Suporte",
};

interface Props {
  role: HeroRole;
  size?: "sm" | "md";
}

export default function RoleBadge({ role, size = "sm" }: Props) {
  return (
    <span
      className={cn(
        "inline-block font-semibold border rounded-full",
        roleColors[role],
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      )}
    >
      {roleLabels[role]}
    </span>
  );
}
