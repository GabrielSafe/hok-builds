import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const hero = await queryOne<{ id: number }>(
    `SELECT id FROM heroes WHERE slug=$1 AND is_published=true`, [slug]
  );
  if (!hero) return NextResponse.json([], { status: 200 });

  const builds = await query<{
    id: number;
    title: string;
    patch_version: string | null;
    is_recommended: boolean;
    creator_id: number | null;
    creator_name: string | null;
    creator_avatar: string | null;
    creator_type: string | null;
  }>(
    `SELECT b.id, b.title, b.patch_version, b.is_recommended, b.creator_id,
            c.name AS creator_name, c.avatar_url AS creator_avatar, c.creator_type
     FROM builds b
     LEFT JOIN creators c ON c.id = b.creator_id
     WHERE b.hero_id = $1
     ORDER BY b.is_recommended DESC, c.name ASC`,
    [hero.id]
  );

  const detailed = await Promise.all(builds.map(async (b) => {
    const [items, arcana, spells, skillOrder] = await Promise.all([
      query(
        `SELECT bi.sort_order, bi.phase, i.name AS item_name, i.image_url AS item_image_url, i.change_type AS item_change_type
         FROM build_items bi JOIN items i ON i.id=bi.item_id
         WHERE bi.build_id=$1 ORDER BY bi.sort_order ASC`, [b.id]
      ),
      query(
        `SELECT ba.quantity, a.name AS arcana_name, a.image_url AS arcana_image_url, a.change_type AS arcana_change_type
         FROM build_arcana ba JOIN arcana a ON a.id=ba.arcana_id
         WHERE ba.build_id=$1`, [b.id]
      ),
      query(
        `SELECT s.name AS spell_name, s.image_url AS spell_image_url, s.change_type AS spell_change_type
         FROM build_spells bs JOIN spells s ON s.id=bs.spell_id
         WHERE bs.build_id=$1`, [b.id]
      ),
      query(
        `SELECT bso.sort_order, sk.name AS skill_name, sk.key AS skill_key, sk.image_url AS skill_image_url
         FROM build_skill_order bso JOIN skills sk ON sk.id=bso.skill_id
         WHERE bso.build_id=$1 ORDER BY bso.sort_order ASC`, [b.id]
      ),
    ]);
    return { ...b, items, arcana, spells, skill_order: skillOrder };
  }));

  return NextResponse.json(detailed);
}
