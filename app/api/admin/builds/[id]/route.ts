import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const build = await queryOne("SELECT * FROM builds WHERE id=$1", [id]);
  if (!build) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [items, arcana, spells, skillOrder] = await Promise.all([
    query(`SELECT bi.id, bi.item_id, bi.sort_order, bi.phase, i.name, i.image_url
           FROM build_items bi JOIN items i ON i.id=bi.item_id
           WHERE bi.build_id=$1 ORDER BY bi.sort_order`, [id]),
    query(`SELECT ba.id, ba.arcana_id, ba.quantity, a.name, a.image_url, a.tier
           FROM build_arcana ba JOIN arcana a ON a.id=ba.arcana_id
           WHERE ba.build_id=$1`, [id]),
    query(`SELECT bs.id, bs.spell_id, s.name, s.image_url
           FROM build_spells bs JOIN spells s ON s.id=bs.spell_id
           WHERE bs.build_id=$1`, [id]),
    query(`SELECT bso.id, bso.skill_id, bso.sort_order, sk.name, sk.key, sk.image_url
           FROM build_skill_order bso JOIN skills sk ON sk.id=bso.skill_id
           WHERE bso.build_id=$1 ORDER BY bso.sort_order`, [id]),
  ]);

  return NextResponse.json({ ...build, items, arcana, spells, skill_order: skillOrder });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { type, data } = await request.json();

  if (type === "item") {
    const max = await queryOne<{ max: string }>("SELECT COALESCE(MAX(sort_order),0) AS max FROM build_items WHERE build_id=$1", [id]);
    const next = parseInt((max as { max: string }).max) + 1;
    const row = await queryOne(
      "INSERT INTO build_items (build_id, item_id, sort_order, phase) VALUES ($1,$2,$3,$4) RETURNING *",
      [id, data.item_id, next, data.phase ?? "core"]
    );
    return NextResponse.json(row);
  }

  if (type === "arcana") {
    await query("DELETE FROM build_arcana WHERE build_id=$1 AND arcana_id=$2", [id, data.arcana_id]);
    const row = await queryOne(
      "INSERT INTO build_arcana (build_id, arcana_id, quantity) VALUES ($1,$2,$3) RETURNING *",
      [id, data.arcana_id, data.quantity ?? 10]
    );
    return NextResponse.json(row);
  }

  if (type === "spell") {
    const row = await queryOne(
      "INSERT INTO build_spells (build_id, spell_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING *",
      [id, data.spell_id]
    );
    return NextResponse.json(row);
  }

  if (type === "skill") {
    const max = await queryOne<{ max: string }>("SELECT COALESCE(MAX(sort_order),0) AS max FROM build_skill_order WHERE build_id=$1", [id]);
    const next = parseInt((max as { max: string }).max) + 1;
    const row = await queryOne(
      "INSERT INTO build_skill_order (build_id, skill_id, sort_order) VALUES ($1,$2,$3) RETURNING *",
      [id, data.skill_id, next]
    );
    return NextResponse.json(row);
  }

  return NextResponse.json({ error: "type inválido" }, { status: 400 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { type, rowId } = await request.json();

  const tables: Record<string, string> = {
    item: "build_items",
    arcana: "build_arcana",
    spell: "build_spells",
    skill: "build_skill_order",
  };

  if (!tables[type]) return NextResponse.json({ error: "type inválido" }, { status: 400 });
  await query(`DELETE FROM ${tables[type]} WHERE id=$1 AND build_id=$2`, [rowId, id]);
  return NextResponse.json({ success: true });
}
