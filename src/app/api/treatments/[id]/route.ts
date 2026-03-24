/// PUT (UPDATE) and DELETE (DELETE) for treatments by id
import { db } from "@/db/index";
export const runtime = "nodejs";

type PutBody = {
  name_public: string;
  duration_min: number;
  is_active: boolean;
};

/// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const url = new URL(req.url);
  const salonId = url.searchParams.get("salonId");

  if (!salonId) {
    return Response.json({ error: "Missing salonId" }, { status: 400 });
  }

  const numericSalonId = Number(salonId);

  if (!Number.isFinite(numericSalonId)) {
    return Response.json({ error: "Invalid salonId" }, { status: 400 });
  }

  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as PutBody;

  if (!body?.name_public || typeof body.name_public !== "string") {
    return Response.json({ error: "name_public required" }, { status: 400 });
  }

  const duration = Number(body.duration_min);

  if (!Number.isFinite(duration) || duration <= 0) {
    return Response.json({ error: "duration_min invalid" }, { status: 400 });
  }

  const update = db.prepare(`
    UPDATE services
    SET name = ?, duration_min = ?, is_active = ?
    WHERE id = ? AND salon_id = ?
  `);

  const result = update.run(
    body.name_public.trim(),
    duration,
    body.is_active ? 1 : 0,
    numericId,
    numericSalonId,
  );

  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const updated = db
    .prepare(`
      SELECT id, salon_id, name, duration_min, is_active
      FROM services
      WHERE id = ? AND salon_id = ?
    `)
    .get(numericId, numericSalonId);

  return Response.json({ service: updated });
}

/// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const url = new URL(req.url);
  const salonId = url.searchParams.get("salonId");

  if (!salonId) {
    return Response.json({ error: "Missing salonId" }, { status: 400 });
  }

  const numericSalonId = Number(salonId);

  if (!Number.isFinite(numericSalonId)) {
    return Response.json({ error: "Invalid salonId" }, { status: 400 });
  }

  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const del = db.prepare(`
    DELETE FROM services
    WHERE id = ? AND salon_id = ?
  `);

  const result = del.run(numericId, numericSalonId);

  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}