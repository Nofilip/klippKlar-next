/// PUT (UPDATE) and DELETE (DELETE) for treatments by id
import { db } from "@/db/index";
export const runtime = "nodejs";

/// UPDATE
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const {id} = await params;
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as {
    name_public: string;
    duration_min: number;
    is_active: boolean;
  };

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
    WHERE id = ?
  `);

  const result = update.run(
    body.name_public.trim(),
    duration,
    body.is_active ? 1 : 0,
    id,
  );

  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const updated = db
    .prepare(`SELECT id, name, duration_min, is_active FROM services WHERE id = ?`)
    .get(id);

  return Response.json({ service: updated });
}

/// DELETE

export async function DELETE(
  _req: Request,
  { params }: {params: Promise<{id: string}>},
  ) {
    const { id } = await params;
    const numericId = Number(id);

    if (!Number.isFinite(numericId)) {
      return Response.json ({error: "Invalid id"}, {status: 404});
    }
   const del = db.prepare (`DELETE FROM services WHERE id = ?`);
   const result = del.run(numericId)

   if(result.changes === 0) {
    return Response.json({error: "Not Found"}, { status: 404 });
   } 
   return Response.json({ok: true});
}