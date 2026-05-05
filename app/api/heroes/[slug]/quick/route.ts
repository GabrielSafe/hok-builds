import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const hero = await queryOne(
    `SELECT h.id, h.name, h.slug, h.role, h.difficulty, h.description, h.icon_url, h.splash_url,
            COALESCE(v.total_views, 0) AS total_views
     FROM heroes h
     LEFT JOIN hero_view_counts v ON v.hero_id = h.id
     WHERE (h.id::text = $1 OR h.slug = $1) AND h.is_published = true`,
    [slug]
  );

  if (!hero) return NextResponse.json(null, { status: 404 });

  const h = hero as { id: number };

  const [stats, build] = await Promise.all([
    queryOne(`SELECT winrate, pickrate, games_played, tier FROM hero_stats WHERE hero_id = $1`, [h.id]),
    queryOne(`SELECT id FROM builds WHERE hero_id = $1 AND is_recommended = true LIMIT 1`, [h.id]),
  ]);

  let buildData = null;
  if (build) {
    const bid = (build as { id: number }).id;
    const [items, arcana, spells, skillOrder] = await Promise.all([
      query(`SELECT i.name AS item_name, i.image_url AS item_image_url
             FROM build_items bi JOIN items i ON i.id=bi.item_id
             WHERE bi.build_id=$1 ORDER BY bi.sort_order ASC LIMIT 6`, [bid]),
      query(`SELECT a.name AS arcana_name, a.image_url AS arcana_image_url, ba.quantity
             FROM build_arcana ba JOIN arcana a ON a.id=ba.arcana_id
             WHERE ba.build_id=$1 LIMIT 3`, [bid]),
      query(`SELECT s.name AS spell_name, s.image_url AS spell_image_url
             FROM build_spells bs JOIN spells s ON s.id=bs.spell_id
             WHERE bs.build_id=$1`, [bid]),
      query(`SELECT sk.name AS skill_name, sk.key AS skill_key, sk.image_url AS skill_image_url
             FROM build_skill_order bso JOIN skills sk ON sk.id=bso.skill_id
             WHERE bso.build_id=$1 ORDER BY bso.sort_order ASC LIMIT 5`, [bid]),
    ]);
    buildData = { items, arcana, spells, skill_order: skillOrder };
  }

  return NextResponse.json({ ...hero, stats, build: buildData });
}
