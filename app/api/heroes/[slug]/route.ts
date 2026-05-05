import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import type { Hero, HeroStats, Skill, Build, BuildItem, BuildArcana, BuildSpell, BuildSkillOrder } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const hero = await queryOne<Hero>(
    `SELECT h.*, COALESCE(v.total_views, 0) AS total_views
     FROM heroes h
     LEFT JOIN hero_view_counts v ON v.hero_id = h.id
     WHERE h.slug = $1 AND h.is_published = true`,
    [slug]
  );

  if (!hero) {
    return NextResponse.json({ error: "Hero not found" }, { status: 404 });
  }

  const [stats, skills, build] = await Promise.all([
    queryOne<HeroStats>(
      "SELECT * FROM hero_stats WHERE hero_id = $1",
      [hero.id]
    ),
    query<Skill>(
      "SELECT * FROM skills WHERE hero_id = $1 ORDER BY sort_order ASC",
      [hero.id]
    ),
    queryOne<Build>(
      "SELECT * FROM builds WHERE hero_id = $1 AND is_recommended = true LIMIT 1",
      [hero.id]
    ),
  ]);

  let recommendedBuild = null;

  if (build) {
    const [items, arcana, spells, skillOrder] = await Promise.all([
      query<BuildItem & { item_name: string; item_image_url: string; item_slug: string }>(
        `SELECT bi.*, i.name AS item_name, i.image_url AS item_image_url, i.slug AS item_slug
         FROM build_items bi JOIN items i ON i.id = bi.item_id
         WHERE bi.build_id = $1 ORDER BY bi.sort_order ASC`,
        [build.id]
      ),
      query<BuildArcana & { arcana_name: string; arcana_image_url: string; arcana_slug: string; arcana_tier: number }>(
        `SELECT ba.*, a.name AS arcana_name, a.image_url AS arcana_image_url, a.slug AS arcana_slug, a.tier AS arcana_tier
         FROM build_arcana ba JOIN arcana a ON a.id = ba.arcana_id
         WHERE ba.build_id = $1`,
        [build.id]
      ),
      query<BuildSpell & { spell_name: string; spell_image_url: string; spell_slug: string }>(
        `SELECT bs.*, s.name AS spell_name, s.image_url AS spell_image_url, s.slug AS spell_slug
         FROM build_spells bs JOIN spells s ON s.id = bs.spell_id
         WHERE bs.build_id = $1`,
        [build.id]
      ),
      query<BuildSkillOrder & { skill_name: string; skill_key: string; skill_image_url: string }>(
        `SELECT bso.*, sk.name AS skill_name, sk.key AS skill_key, sk.image_url AS skill_image_url
         FROM build_skill_order bso JOIN skills sk ON sk.id = bso.skill_id
         WHERE bso.build_id = $1 ORDER BY bso.sort_order ASC`,
        [build.id]
      ),
    ]);

    recommendedBuild = { ...build, items, arcana, spells, skill_order: skillOrder };
  }

  return NextResponse.json({
    ...hero,
    stats,
    skills,
    recommended_build: recommendedBuild,
  });
}
