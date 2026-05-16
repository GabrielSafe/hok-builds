import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatNumber(n: number | string): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "0";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercent(n: number | string): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "0%";
  return `${num.toFixed(1)}%`;
}

export const ROLE_LABELS: Record<string, string> = {
  Tank:     "Tanque",
  Fighter:  "Lutador",
  Assassin: "Assassino",
  Mage:     "Mago",
  Marksman: "Atirador",
  Support:  "Suporte",
  Jungle:   "Selva",
};

export const LANE_LABELS: Record<string, string> = {
  top_lane: "Top Lane",
  jungle:   "Selva",
  mid:      "Mid",
  marksman: "Atirador",
  support:  "Suporte",
};

export const CREATOR_TYPE_LABELS: Record<string, string> = {
  pro_player: "Pro Player",
  streamer:   "Streamer",
  coach:      "Coach",
};

export function formatRoles(roles: string[]): string {
  return roles.map((r) => ROLE_LABELS[r] ?? r).join(" / ");
}

export function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
