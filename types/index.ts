export type HeroRole = "Tank" | "Fighter" | "Assassin" | "Mage" | "Marksman" | "Support" | "Jungle";

export interface Hero {
  id: number;
  name: string;
  slug: string;
  role: HeroRole[];
  difficulty: number;
  description: string | null;
  lore: string | null;
  icon_url: string | null;
  splash_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  total_views?: number;
  change_type?: "buff" | "nerf" | "adjustment" | null;
  race?: string | null;
  height?: string | null;
  fighting_style?: string | null;
  origin_place?: string | null;
  faction?: string | null;
  lore_role?: string | null;
}

export interface HeroStats {
  id: number;
  hero_id: number;
  tier: string;
  updated_at: string;
}

export interface Item {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  stats: Record<string, unknown>;
  cost: number;
  change_type?: "buff" | "nerf" | "adjustment" | null;
}

export interface Arcana {
  id: number;
  name: string;
  slug: string;
  tier: number;
  image_url: string | null;
  description: string | null;
  stats: Record<string, unknown>;
  change_type?: "buff" | "nerf" | "adjustment" | null;
}

export interface Spell {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  change_type?: "buff" | "nerf" | "adjustment" | null;
}

export interface Skill {
  id: number;
  hero_id: number;
  name: string;
  key: string;
  image_url: string | null;
  description: string | null;
  sort_order: number;
  tags?: string[] | null;
}

export interface Build {
  id: number;
  hero_id: number;
  title: string;
  description: string | null;
  patch_version: string | null;
  is_recommended: boolean;
  created_at: string;
  updated_at: string;
  items?: BuildItem[];
  arcana?: BuildArcana[];
  spells?: BuildSpell[];
  skill_order?: BuildSkillOrder[];
}

export interface BuildItem {
  id: number;
  build_id: number;
  item_id: number;
  sort_order: number;
  phase: string;
  item?: Item;
}

export interface BuildArcana {
  id: number;
  build_id: number;
  arcana_id: number;
  quantity: number;
  arcana?: Arcana;
}

export interface BuildSpell {
  id: number;
  build_id: number;
  spell_id: number;
  spell?: Spell;
}

export interface BuildSkillOrder {
  id: number;
  build_id: number;
  skill_id: number;
  sort_order: number;
  skill?: Skill;
}

export interface HeroDetail extends Hero {
  stats: HeroStats | null;
  skills: Skill[];
  recommended_build: Build | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
